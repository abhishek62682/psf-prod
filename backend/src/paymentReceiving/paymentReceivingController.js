import createHttpError from "http-errors";
import mongoose from "mongoose";
import paymentReceivingModel from "./paymentReceivingModel.js";
import paymentReceivingAuditLogModel from "./paymentReceivingAuditLogModel.js";
import campaignModel from "../campaign/campaignModel.js";
import adminModel from "../auth/adminModel.js";
import { deleteUploadedFile } from "../middlewares/upload.js";

const AUDITED_FIELDS = [
  "accountName",
  "qrCode",
  "upiId",
  "bankName",
  "accountNumber",
  "ifscCode",
  "branch",
  "isDefault",
];

// req.ip needs "trust proxy" configured (see app.js) to reflect the real
// client IP behind a reverse proxy.
const captureRequestMeta = (req) => ({
  ipAddress: req.ip || null,
  userAgent: req.headers["user-agent"] || null,
});

export const getDefaultPaymentReceivingAccount = async () => {
  const explicitDefault = await paymentReceivingModel.findOne({
    isDefault: true,
    isDeleted: false,
  });
  if (explicitDefault) return explicitDefault;

  return paymentReceivingModel
    .findOne({ isDeleted: false })
    .sort({ createdAt: 1 });
};

// GET /api/payment-receiving (public) — the current default account
const getDefaultAccount = async (req, res, next) => {
  try {
    const account = await getDefaultPaymentReceivingAccount();

    if (!account) {
      return next(createHttpError(404, "No payment receiving account is configured."));
    }

    return res.json({
      success: true,
      message: "Payment receiving account fetched successfully.",
      data: account,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching payment receiving account."));
  }
};

// GET /api/payment-receiving/:id (admin)
const getAccount = async (req, res, next) => {
  try {
    const account = await paymentReceivingModel
      .findOne({ _id: req.params.id, isDeleted: false })
      .lean();

    if (!account) {
      return next(createHttpError(404, "Payment receiving account not found."));
    }

    return res.json({
      success: true,
      message: "Payment receiving account fetched successfully.",
      data: account,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching payment receiving account."));
  }
};

// POST /api/payment-receiving (admin)
const createAccount = async (req, res, next) => {
  try {
    const { isDefault, ...rest } = req.body;

    if (isDefault) {
      await paymentReceivingModel.updateMany({}, { $set: { isDefault: false } });
    }

    const account = await paymentReceivingModel.create({
      ...rest,
      isDefault: Boolean(isDefault),
      createdBy: req.adminId,
    });

    const changes = AUDITED_FIELDS.filter((field) => account[field] !== undefined && account[field] !== "").map(
      (field) => ({ field, oldValue: null, newValue: account[field] })
    );
    await paymentReceivingAuditLogModel.create({
      accountId: account._id,
      action: "created",
      changedBy: req.adminId,
      changes,
      ...captureRequestMeta(req),
    });

    return res.status(201).json({
      success: true,
      message: "Payment receiving account created successfully.",
      data: account,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while creating payment receiving account."));
  }
};

// PATCH /api/payment-receiving/:id (admin)
const updateAccount = async (req, res, next) => {
  try {
    const existing = await paymentReceivingModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!existing) {
      return next(createHttpError(404, "Payment receiving account not found."));
    }

    const { isDefault, ...rest } = req.body;

    if (isDefault) {
      await paymentReceivingModel.updateMany(
        { _id: { $ne: req.params.id } },
        { $set: { isDefault: false } }
      );
    }

    const updates = { ...rest };
    if (isDefault !== undefined) updates.isDefault = isDefault;

    const changes = [];
    for (const field of AUDITED_FIELDS) {
      if (updates[field] === undefined) continue;
      const oldValue = existing[field] ?? null;
      const newValue = updates[field] ?? null;
      if (String(oldValue) !== String(newValue)) {
        changes.push({ field, oldValue, newValue });
      }
    }

    const account = await paymentReceivingModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!account) {
      return next(createHttpError(404, "Payment receiving account not found."));
    }

    if (changes.length > 0) {
      await paymentReceivingAuditLogModel.create({
        accountId: account._id,
        action: "updated",
        changedBy: req.adminId,
        changes,
        ...captureRequestMeta(req),
      });
    }

    // QR code replaced with a different one — the old file is no longer
    // referenced anywhere, so it can be removed from disk.
    if (updates.qrCode !== undefined && existing.qrCode && existing.qrCode !== updates.qrCode) {
      deleteUploadedFile(existing.qrCode);
    }

    return res.json({
      success: true,
      message: "Payment receiving account updated successfully.",
      data: account,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while updating payment receiving account."));
  }
};

// DELETE /api/payment-receiving/:id (admin, soft delete)
const deleteAccount = async (req, res, next) => {
  try {
    const inUse = await campaignModel.countDocuments({
      paymentReceivingAccountId: req.params.id,
      isDeleted: false,
    });

    if (inUse > 0) {
      return next(
        createHttpError(
          409,
          "This payment receiving account is still assigned to one or more campaigns."
        )
      );
    }

    const account = await paymentReceivingModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: { isDeleted: true, isDefault: false } },
      { new: true }
    );

    if (!account) {
      return next(createHttpError(404, "Payment receiving account not found."));
    }

    await paymentReceivingAuditLogModel.create({
      accountId: account._id,
      action: "deleted",
      changedBy: req.adminId,
      changes: [{ field: "isDeleted", oldValue: false, newValue: true }],
      ...captureRequestMeta(req),
    });

    return res.json({
      success: true,
      message: "Payment receiving account deleted successfully.",
    });
  } catch (err) {
    return next(createHttpError(500, "Error while deleting payment receiving account."));
  }
};

// DELETE /api/payment-receiving/:id/qr-code (admin)
const removeQrCode = async (req, res, next) => {
  try {
    const existing = await paymentReceivingModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!existing) {
      return next(createHttpError(404, "Payment receiving account not found."));
    }

    if (!existing.qrCode) {
      return next(createHttpError(400, "This account has no QR code to remove."));
    }

    const oldQrCode = existing.qrCode;

    const account = await paymentReceivingModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $unset: { qrCode: "" } },
      { new: true }
    );

    await paymentReceivingAuditLogModel.create({
      accountId: account._id,
      action: "qr_code_removed",
      changedBy: req.adminId,
      changes: [{ field: "qrCode", oldValue: oldQrCode, newValue: null }],
      ...captureRequestMeta(req),
    });

    deleteUploadedFile(oldQrCode);

    return res.json({
      success: true,
      message: "QR code removed successfully.",
      data: account,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while removing QR code."));
  }
};

// GET /api/payment-receiving/audit-logs (admin)
const adminListAuditLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const { action, accountId, search } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (accountId && mongoose.isValidObjectId(String(accountId))) {
      filter.accountId = accountId;
    }
    if (search) {
      const admins = await adminModel
        .find({
          $or: [
            { name: { $regex: String(search), $options: "i" } },
            { email: { $regex: String(search), $options: "i" } },
          ],
        })
        .select("_id")
        .lean();
      filter.changedBy = { $in: admins.map((a) => a._id) };
    }

    const [logs, total] = await Promise.all([
      paymentReceivingAuditLogModel
        .find(filter)
        .populate("changedBy", "name email")
        .populate("accountId", "accountName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      paymentReceivingAuditLogModel.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      message: "Audit logs fetched successfully.",
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching audit logs."));
  }
};

export {
  getDefaultAccount,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  removeQrCode,
  adminListAuditLogs,
};
