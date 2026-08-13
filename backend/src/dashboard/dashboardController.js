import createHttpError from "http-errors";
import campaignModel from "../campaign/campaignModel.js";
import donationModel from "../donation/donationModel.js";

// GET /api/dashboard
const getDashboardSummary = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalCampaigns,
      activeCampaigns,
      pendingDonations,
      verifiedDonations,
      amountAgg,
      todayDonations,
      recentDonors,
    ] = await Promise.all([
      campaignModel.countDocuments({ isDeleted: false }),
      campaignModel.countDocuments({ isDeleted: false, status: "active" }),
      donationModel.countDocuments({ status: "pending" }),
      donationModel.countDocuments({ status: "verified" }),
      donationModel.aggregate([
        { $match: { status: "verified" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      donationModel.countDocuments({ createdAt: { $gte: startOfToday } }),
      donationModel
        .find({ status: "verified" })
        .sort({ verifiedAt: -1 })
        .limit(5)
        .select("name amount verifiedAt campaignId")
        .populate("campaignId", "title slug")
        .lean(),
    ]);

    return res.json({
      success: true,
      message: "Dashboard summary fetched successfully.",
      data: {
        totalCampaigns,
        activeCampaigns,
        pendingDonations,
        verifiedDonations,
        totalDonationAmount: amountAgg[0]?.total || 0,
        todayDonations,
        recentDonors,
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching dashboard summary."));
  }
};

// GET /api/dashboard/recent-donors
const getRecentDonors = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const [donors, total] = await Promise.all([
      donationModel
        .find({ status: "verified" })
        .sort({ verifiedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("name email amount verifiedAt campaignId")
        .populate("campaignId", "title slug")
        .lean(),
      donationModel.countDocuments({ status: "verified" }),
    ]);

    return res.json({
      success: true,
      message: "Recent donors fetched successfully.",
      data: {
        donors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching recent donors."));
  }
};

export { getDashboardSummary, getRecentDonors };
