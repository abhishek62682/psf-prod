import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import adminModel from "../auth/adminModel.js";
import { deleteUploadedFile } from "../middlewares/upload.js";

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const admin = await adminModel.findById(req.adminId);

    if (!admin) {
      return next(createHttpError(404, "Administrator not found."));
    }

    return res.json({
      success: true,
      message: "Profile fetched successfully.",
      data: admin,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching profile."));
  }
};

// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;

    const existing = await adminModel.findById(req.adminId);
    if (!existing) {
      return next(createHttpError(404, "Administrator not found."));
    }

    const admin = await adminModel.findByIdAndUpdate(
      req.adminId,
      {
        $set: {
          ...(name && { name }),
          ...(email && { email }),
          ...(avatar !== undefined && { avatar }),
        },
      },
      { new: true, runValidators: true }
    );

    if (!admin) {
      return next(createHttpError(404, "Administrator not found."));
    }

    // Avatar replaced or cleared — the old file is no longer referenced.
    if (avatar !== undefined && existing.avatar && existing.avatar !== avatar) {
      deleteUploadedFile(existing.avatar);
    }

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      data: admin,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while updating profile."));
  }
};

// POST /api/profile/avatar
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createHttpError(400, "Avatar image is required."));
    }

    const avatar = `/uploads/profile/${req.file.filename}`;

    const existing = await adminModel.findById(req.adminId);
    if (!existing) {
      return next(createHttpError(404, "Administrator not found."));
    }

    const admin = await adminModel.findByIdAndUpdate(
      req.adminId,
      { $set: { avatar } },
      { new: true }
    );

    if (!admin) {
      return next(createHttpError(404, "Administrator not found."));
    }

    if (existing.avatar && existing.avatar !== avatar) {
      deleteUploadedFile(existing.avatar);
    }

    return res.status(201).json({
      success: true,
      message: "Avatar uploaded successfully.",
      data: { avatar: admin.avatar },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while uploading avatar."));
  }
};

// PUT /api/profile/password
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await adminModel.findById(req.adminId).select("+password");
    if (!admin) {
      return next(createHttpError(404, "Administrator not found."));
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return next(createHttpError(401, "Current password is incorrect."));
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return res.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    return next(createHttpError(500, "Error while updating password."));
  }
};

export { getProfile, updateProfile, updatePassword, uploadAvatar };
