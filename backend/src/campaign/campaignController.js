import createHttpError from "http-errors";
import campaignModel from "./campaignModel.js";
import donationModel from "../donation/donationModel.js";
import { getDefaultPaymentReceivingAccount } from "../paymentReceiving/paymentReceivingController.js";
import { CAMPAIGN_STATUSES, CAMPAIGN_ADMIN_VIEWS } from "./campaignConstants.js";
import { deleteUploadedFile } from "../middlewares/upload.js";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const calcProgress = (raised, goal) =>
  goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

// Flips active campaigns to "completed" once the end date passes or the
// goal is met. Called per-campaign right after a donation is verified, and
// across all campaigns by the daily cron (campaignCron.js).
const autoCompleteCampaigns = async (extraFilter = {}) => {
  const filter = {
    ...extraFilter,
    isDeleted: false,
    status: "active",
    $or: [{ endDate: { $lt: new Date() } }, { $expr: { $gte: ["$raisedAmount", "$goalAmount"] } }],
  };
  return campaignModel.updateMany(filter, { $set: { status: "completed" } });
};

// POST /api/campaigns (admin)
const createCampaign = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      description,
      goalAmount,
      coverImage,
      gallery,
      startDate,
      endDate,
      isFeatured,
      status,
      paymentReceivingAccountId,
    } = req.body;

    const finalSlug = slugify(slug || title);

    const existing = await campaignModel.findOne({ slug: finalSlug });
    if (existing) {
      return next(createHttpError(409, "A campaign with this slug already exists."));
    }

    let finalPaymentAccountId = paymentReceivingAccountId;
    if (!finalPaymentAccountId) {
      const defaultAccount = await getDefaultPaymentReceivingAccount();
      if (!defaultAccount) {
        return next(
          createHttpError(
            400,
            "No payment receiving account is configured. Please create one first."
          )
        );
      }
      finalPaymentAccountId = defaultAccount._id;
    }

    const campaign = await campaignModel.create({
      title,
      slug: finalSlug,
      shortDescription,
      description,
      goalAmount,
      coverImage,
      gallery,
      startDate,
      endDate,
      isFeatured,
      status,
      paymentReceivingAccountId: finalPaymentAccountId,
    });

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully.",
      data: campaign,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while creating campaign."));
  }
};

const buildCampaignList = async ({ page, limit, search, featured, statusFilter }) => {
  const filter =
    statusFilter === "deleted" ? { isDeleted: true } : { isDeleted: false };
  if (statusFilter && statusFilter !== "deleted") filter.status = statusFilter;
  if (featured === "true") filter.isFeatured = true;
  if (search) {
    filter.$or = [
      { title: { $regex: String(search), $options: "i" } },
      { shortDescription: { $regex: String(search), $options: "i" } },
    ];
  }

  const [campaigns, total] = await Promise.all([
    campaignModel
      .find(filter)
      .select("-description -isDeleted -paymentReceivingAccountId")
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    campaignModel.countDocuments(filter),
  ]);

  return {
    campaigns: campaigns.map((c) => ({
      ...c,
      progress: calcProgress(c.raisedAmount, c.goalAmount),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// GET /api/campaigns (public) — active only unless ?status= is given
const listCampaigns = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const { search, featured, status } = req.query;
    const statusFilter = status && CAMPAIGN_STATUSES.includes(status) ? status : "active";

    const data = await buildCampaignList({ page, limit, search, featured, statusFilter });

    return res.json({
      success: true,
      message: "Campaigns fetched successfully.",
      data,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching campaigns."));
  }
};

// GET /api/campaigns/admin (admin) — active by default; ?status= also
// accepts "deleted" and "all" (see CAMPAIGN_ADMIN_VIEWS)
const adminListCampaigns = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const { search, featured, status } = req.query;
    const view = status && CAMPAIGN_ADMIN_VIEWS.includes(status) ? status : "active";
    const statusFilter = view === "all" ? undefined : view;

    const data = await buildCampaignList({ page, limit, search, featured, statusFilter });

    const campaignIds = data.campaigns.map((c) => c._id);
    const statusCounts = await donationModel.aggregate([
      { $match: { campaignId: { $in: campaignIds } } },
      { $group: { _id: { campaignId: "$campaignId", status: "$status" }, count: { $sum: 1 } } },
    ]);

    const countsByCampaign = new Map();
    for (const { _id, count } of statusCounts) {
      const key = String(_id.campaignId);
      const entry = countsByCampaign.get(key) || {
        totalDonations: 0,
        pendingDonations: 0,
        verifiedDonations: 0,
        rejectedDonations: 0,
      };
      entry[`${_id.status}Donations`] = count;
      entry.totalDonations += count;
      countsByCampaign.set(key, entry);
    }

    const emptyCounts = { totalDonations: 0, pendingDonations: 0, verifiedDonations: 0, rejectedDonations: 0 };
    const campaigns = data.campaigns.map((c) => {
      const { progress, ...campaign } = c;
      return {
        ...campaign,
        meta: {
          progress,
          ...(countsByCampaign.get(String(c._id)) || emptyCounts),
        },
      };
    });

    return res.json({
      success: true,
      message: "Campaigns fetched successfully.",
      data: { campaigns, pagination: data.pagination },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching admin campaigns."));
  }
};

// GET /api/campaigns/options (public) — {_id, title} list for dropdowns
const getCampaignOptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const statusFilter = status && CAMPAIGN_STATUSES.includes(status) ? status : "active";

    const campaigns = await campaignModel
      .find({
        isDeleted: false,
        status: statusFilter,
        $expr: { $lt: ["$raisedAmount", "$goalAmount"] },
      })
      .select("title")
      .sort({ title: 1 })
      .limit(200)
      .lean();

    return res.json({
      success: true,
      message: "Campaign options fetched successfully.",
      data: campaigns.map((c) => ({ _id: c._id, title: c.title })),
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching campaign options."));
  }
};

// GET /api/campaigns/:id (public)
const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await campaignModel
      .findOne({ _id: req.params.id, isDeleted: false })
      .select("-paymentReceivingAccountId")
      .lean();

    if (!campaign) {
      return next(createHttpError(404, "Campaign not found."));
    }

    return res.json({
      success: true,
      message: "Campaign fetched successfully.",
      data: {
        ...campaign,
        progress: calcProgress(campaign.raisedAmount, campaign.goalAmount),
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching campaign."));
  }
};

// PATCH /api/campaigns/:id (admin)
const updateCampaign = async (req, res, next) => {
  try {
    const allowed = [
      "title",
      "slug",
      "shortDescription",
      "description",
      "goalAmount",
      "coverImage",
      "gallery",
      "startDate",
      "endDate",
      "isFeatured",
      "status",
      "paymentReceivingAccountId",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.slug) updates.slug = slugify(String(updates.slug));

    const existing = await campaignModel
      .findOne({ _id: req.params.id, isDeleted: false })
      .select("coverImage gallery")
      .lean();
    if (!existing) {
      return next(createHttpError(404, "Campaign not found."));
    }

    const campaign = await campaignModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return next(createHttpError(404, "Campaign not found."));
    }

    // Cover replaced with a different image — old file is orphaned now.
    if (updates.coverImage !== undefined && existing.coverImage && existing.coverImage !== updates.coverImage) {
      deleteUploadedFile(existing.coverImage);
    }

    // Gallery replaced with a new list — clean up whatever dropped out.
    if (updates.gallery !== undefined) {
      const removed = (existing.gallery || []).filter((url) => !updates.gallery.includes(url));
      removed.forEach(deleteUploadedFile);
    }

    return res.json({
      success: true,
      message: "Campaign updated successfully.",
      data: campaign,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while updating campaign."));
  }
};

// DELETE /api/campaigns/:id (admin) — a campaign with zero donation records
// (nobody ever submitted one, verified or not) is hard-deleted along with
// its images, since there's no donor history tied to it worth preserving.
// Otherwise it's soft-deleted (isDeleted: true, status left untouched) so
// the donation trail stays linked to a real campaign.
const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignModel.findById(req.params.id);
    if (!campaign) {
      return next(createHttpError(404, "Campaign not found."));
    }

    const donationCount = await donationModel.countDocuments({ campaignId: campaign._id });

    if (donationCount === 0) {
      await campaignModel.deleteOne({ _id: campaign._id });

      if (campaign.coverImage) deleteUploadedFile(campaign.coverImage);
      (campaign.gallery || []).forEach(deleteUploadedFile);

      return res.json({
        success: true,
        message: "Campaign permanently deleted — no donations were on record.",
      });
    }

    await campaignModel.updateOne({ _id: campaign._id }, { $set: { isDeleted: true } });

    return res.json({
      success: true,
      message: "Campaign deleted successfully.",
    });
  } catch (err) {
    return next(createHttpError(500, "Error while deleting campaign."));
  }
};

// GET /api/campaigns/:id/donations (public) — verified donations only
const getCampaignDonations = async (req, res, next) => {
  try {
    const campaign = await campaignModel
      .findOne({ _id: req.params.id, isDeleted: false })
      .select("_id")
      .lean();

    if (!campaign) {
      return next(createHttpError(404, "Campaign not found."));
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const { search } = req.query;

    const filter = { campaignId: campaign._id, status: "verified" };
    if (search) {
      filter.name = { $regex: String(search), $options: "i" };
    }

    const [donations, total] = await Promise.all([
      donationModel
        .find(filter)
        .sort({ verifiedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("name amount verifiedAt")
        .lean(),
      donationModel.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      message: "Donations fetched successfully.",
      data: {
        donations: donations.map((d) => ({
          name: d.name,
          amount: d.amount,
          date: d.verifiedAt,
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
    return next(createHttpError(500, "Error while fetching campaign donations."));
  }
};

export {
  createCampaign,
  listCampaigns,
  adminListCampaigns,
  getCampaignOptions,
  getCampaignById,
  getCampaignDonations,
  updateCampaign,
  deleteCampaign,
  autoCompleteCampaigns,
};
