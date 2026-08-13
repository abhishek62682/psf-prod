import createHttpError from "http-errors";
import contactModel from "./contactModel.js";
import { CONTACT_STATUSES } from "./contactConstants.js";

// POST /api/contact (public)
const submitContact = async (req, res, next) => {
  try {
    const { fullName, email, phone, subject, message, interest } = req.body;

    await contactModel.create({
      fullName,
      email,
      phone,
      subject,
      message,
      interest,
      status: "new",
    });

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully.",
    });
  } catch (err) {
    return next(createHttpError(500, "Error while submitting message."));
  }
};

// GET /api/contact (admin)
const listContactMessages = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const { status, interest, search } = req.query;

    const filter = {};

    if (status && CONTACT_STATUSES.includes(status)) {
      filter.status = status;
    }
    if (interest) {
      filter.interest = interest;
    }
    if (search) {
      filter.$or = [
        { fullName: { $regex: String(search), $options: "i" } },
        { email: { $regex: String(search), $options: "i" } },
        { subject: { $regex: String(search), $options: "i" } },
      ];
    }

    const [messages, total] = await Promise.all([
      contactModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      contactModel.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      message: "Messages fetched successfully.",
      data: {
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching messages."));
  }
};

// GET /api/contact/:id (admin)
const getContactMessage = async (req, res, next) => {
  try {
    const message = await contactModel.findById(req.params.id).lean();

    if (!message) {
      return next(createHttpError(404, "Message not found."));
    }

    return res.json({
      success: true,
      message: "Message fetched successfully.",
      data: message,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching message."));
  }
};

// PATCH /api/contact/:id (admin) — triage: new -> read -> responded
const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const message = await contactModel.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!message) {
      return next(createHttpError(404, "Message not found."));
    }

    return res.json({
      success: true,
      message: "Message status updated successfully.",
      data: message,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while updating message status."));
  }
};

// DELETE /api/contact/:id (admin)
const deleteContactMessage = async (req, res, next) => {
  try {
    const message = await contactModel.findByIdAndDelete(req.params.id);

    if (!message) {
      return next(createHttpError(404, "Message not found."));
    }

    return res.json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (err) {
    return next(createHttpError(500, "Error while deleting message."));
  }
};

export {
  submitContact,
  listContactMessages,
  getContactMessage,
  updateContactStatus,
  deleteContactMessage,
};
