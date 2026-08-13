import createHttpError from "http-errors";
import mongoose from "mongoose";
import donationModel from "./donationModel.js";
import campaignModel from "../campaign/campaignModel.js";
import { autoCompleteCampaigns } from "../campaign/campaignController.js";
import { DONATION_STATUSES } from "./donationConstants.js";
import { sendDonationVerifiedEmail, sendDonationRejectedEmail } from "../mail/donationEmailService.js";

// POST /api/donations (public, multipart/form-data)
const submitDonation = async (req, res, next) => {
  try {
    const {
      campaignId,
      name,
      email,
      phone,
      amount,
      transactionId,
      paymentDate,
      message,
      is80GApplicable,
      panNumber,
    } = req.body;

    if (!req.file) {
      return next(createHttpError(400, "Payment screenshot is required."));
    }

    if (!mongoose.isValidObjectId(campaignId)) {
      return next(createHttpError(400, "Invalid campaign id."));
    }

    const campaign = await campaignModel.findOne({
      _id: campaignId,
      isDeleted: false,
      status: "active",
    });

    if (!campaign) {
      return next(createHttpError(404, "Campaign not found or is not accepting donations."));
    }

    // raisedAmount only increases on verify, not on submit — this checks
    // verified funds, not the pending queue.
    if (campaign.raisedAmount >= campaign.goalAmount) {
      return next(
        createHttpError(
          409,
          "This campaign has already reached its funding goal and is no longer accepting donations."
        )
      );
    }

    const paymentScreenshot = `/uploads/screenshot/${req.file.filename}`;

    // Same transaction id + campaign, previously rejected: reuse that
    // record and move it back to pending instead of blocking as a duplicate.
    const resubmitted = await donationModel.findOneAndUpdate(
      { campaignId, transactionId, status: "rejected" },
      {
        $set: {
          name,
          email,
          phone,
          amount,
          paymentDate,
          message,
          paymentScreenshot,
          is80GApplicable,
          panNumber,
          status: "pending",
        },
        $unset: { verifiedBy: "", verifiedAt: "", remarks: "", rejectionReason: "" },
        $push: {
          auditLog: { action: "resubmitted", timestamp: new Date() },
        },
      },
      { new: true }
    );

    if (resubmitted) {
      return res.status(201).json({
        success: true,
        message: "Donation resubmitted successfully.",
      });
    }

    const duplicate = await donationModel.findOne({
      campaignId,
      transactionId,
      status: { $in: ["pending", "verified"] },
    });
    if (duplicate) {
      return next(
        createHttpError(409, "A donation with this transaction ID has already been submitted.")
      );
    }

    await donationModel.create({
      campaignId,
      name,
      email,
      phone,
      amount,
      transactionId,
      paymentDate,
      message,
      paymentScreenshot,
      is80GApplicable,
      panNumber,
      status: "pending",
      auditLog: [{ action: "submitted", timestamp: new Date() }],
    });

    return res.status(201).json({
      success: true,
      message: "Donation submitted successfully.",
    });
  } catch (err) {
    return next(createHttpError(500, "Error while submitting donation."));
  }
};

// GET /api/donations (public) — verified donations, paginated, with
// platform-wide stats
const listDonations = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const { search } = req.query;

    const filter = { status: "verified" };

    if (search) {
      const matchingCampaigns = await campaignModel
        .find({ title: { $regex: String(search), $options: "i" } })
        .select("_id")
        .lean();

      filter.$or = [
        { name: { $regex: String(search), $options: "i" } },
        { campaignId: { $in: matchingCampaigns.map((c) => c._id) } },
      ];
    }

    // Stats always cover every verified donation, independent of search/pagination.
    const [donations, total, totalSupporters, amountAgg, campaignIds] = await Promise.all([
      donationModel
        .find(filter)
        .populate("campaignId", "title slug")
        .sort({ verifiedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("name amount verifiedAt campaignId")
        .lean(),
      donationModel.countDocuments(filter),
      donationModel.countDocuments({ status: "verified" }),
      donationModel.aggregate([
        { $match: { status: "verified" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      donationModel.distinct("campaignId", { status: "verified" }),
    ]);

    return res.json({
      success: true,
      message: "Donations fetched successfully.",
      data: {
        stats: {
          totalSupporters,
          totalRaised: amountAgg[0]?.total || 0,
          totalCampaigns: campaignIds.length,
        },
        donations: donations.map((d) => ({
          name: d.name,
          amount: d.amount,
          date: d.verifiedAt,
          campaign: d.campaignId ? { title: d.campaignId.title, slug: d.campaignId.slug } : null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching donations."));
  }
};

// GET /api/donations/recents (public) — latest 30 verified donations
const getRecentDonations = async (req, res, next) => {
  try {
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 30));

    const donations = await donationModel
      .find({ status: "verified" })
      .sort({ verifiedAt: -1 })
      .limit(limit)
      .select("name amount verifiedAt campaignId")
      .populate("campaignId", "title slug")
      .lean();

    return res.json({
      success: true,
      message: "Recent donations fetched successfully.",
      data: donations.map((d) => ({
        name: d.name,
        amount: d.amount,
        date: d.verifiedAt,
        campaign: d.campaignId ? { title: d.campaignId.title, slug: d.campaignId.slug } : null,
      })),
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching recent donations."));
  }
};

// GET /api/donations/admin (admin) — every status, filterable; with
// ?campaignId= also returns that campaign's status breakdown
const adminListDonations = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const { status, campaignId, search, is80GApplicable } = req.query;

    const filter = {};
    const validCampaignId =
      campaignId && mongoose.isValidObjectId(String(campaignId)) ? String(campaignId) : null;

    if (status && DONATION_STATUSES.includes(status)) {
      filter.status = status;
    }
    if (validCampaignId) {
      filter.campaignId = validCampaignId;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: String(search), $options: "i" } },
        { email: { $regex: String(search), $options: "i" } },
        { transactionId: { $regex: String(search), $options: "i" } },
      ];
    }
    // Tri-state: "true"/"false" narrow the results, anything else is unfiltered.
    if (is80GApplicable === "true") {
      filter.is80GApplicable = true;
    } else if (is80GApplicable === "false") {
      filter.is80GApplicable = false;
    }

    const [donations, total, statusCounts] = await Promise.all([
      donationModel
        .find(filter)
        .populate("campaignId", "title slug")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      donationModel.countDocuments(filter),
      validCampaignId
        ? donationModel.aggregate([
            { $match: { campaignId: new mongoose.Types.ObjectId(validCampaignId) } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ])
        : null,
    ]);

    let stats;
    if (statusCounts) {
      stats = { pending: 0, verified: 0, rejected: 0, total: 0 };
      for (const { _id, count } of statusCounts) {
        stats[_id] = count;
        stats.total += count;
      }
    }

    return res.json({
      success: true,
      message: "Donations fetched successfully.",
      data: {
        donations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        ...(stats && { stats }),
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching donations."));
  }
};

// GET /api/donations/:id (admin)
const adminGetDonation = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(createHttpError(400, "Invalid donation id."));
    }

    const donation = await donationModel
      .findById(req.params.id)
      .populate("campaignId", "title slug goalAmount raisedAmount status")
      .populate("verifiedBy", "name email")
      .populate("auditLog.performedBy", "name email")
      .lean();

    if (!donation) {
      return next(createHttpError(404, "Donation not found."));
    }

    return res.json({
      success: true,
      message: "Donation fetched successfully.",
      data: donation,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching donation."));
  }
};

// PATCH /api/donations/:id/verify (admin)
const verifyDonation = async (req, res, next) => {
  try {
    const { remarks } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(createHttpError(400, "Invalid donation id."));
    }

    // Atomic pending -> verified so the same donation can't be verified twice.
    const donation = await donationModel.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      {
        $set: {
          status: "verified",
          verifiedBy: req.adminId,
          verifiedAt: new Date(),
          remarks: remarks || "Payment verified successfully.",
        },
        $push: {
          auditLog: {
            action: "verified",
            performedBy: req.adminId,
            remarks,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!donation) {
      return next(
        createHttpError(409, "Donation not found or has already been processed.")
      );
    }

    await campaignModel.updateOne(
      { _id: donation.campaignId },
      { $inc: { raisedAmount: donation.amount, totalDonors: 1 } }
    );

    // Close the campaign out immediately if this donation met its goal,
    // rather than waiting for the next daily cron run.
    try {
      await autoCompleteCampaigns({ _id: donation.campaignId });
    } catch (autoCompleteErr) {
      console.error("Failed to auto-complete campaign after donation verify:", autoCompleteErr);
    }

    // Status is already committed above — an email failure must not roll it back.
    try {
      await donation.populate("campaignId", "title slug");
      await sendDonationVerifiedEmail(donation);
    } catch (emailErr) {
      console.error("Failed to send donation verified email:", emailErr);
    }

    return res.json({
      success: true,
      message: "Donation verified successfully.",
      data: donation,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while verifying donation."));
  }
};

// PATCH /api/donations/:id/reject (admin)
const rejectDonation = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(createHttpError(400, "Invalid donation id."));
    }

    const donation = await donationModel.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      {
        $set: {
          status: "rejected",
          rejectionReason: reason,
        },
        $push: {
          auditLog: {
            action: "rejected",
            performedBy: req.adminId,
            remarks: reason,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!donation) {
      return next(
        createHttpError(409, "Donation not found or has already been processed.")
      );
    }

    try {
      await donation.populate("campaignId", "title slug");
      await sendDonationRejectedEmail(donation);
    } catch (emailErr) {
      console.error("Failed to send donation rejected email:", emailErr);
    }

    return res.json({
      success: true,
      message: "Donation rejected successfully.",
      data: donation,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while rejecting donation."));
  }
};

export {
  submitDonation,
  listDonations,
  getRecentDonations,
  adminListDonations,
  adminGetDonation,
  verifyDonation,
  rejectDonation,
};
