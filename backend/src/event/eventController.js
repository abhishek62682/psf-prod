import createHttpError from "http-errors";
import eventModel from "./eventModel.js";
import { deleteUploadedFile } from "../middlewares/upload.js";

// GET /api/events (public) — active, non-deleted events, in admin-defined order.
const listEvents = async (req, res, next) => {
  try {
    const events = await eventModel
      .find({ isDeleted: false, status: "active" })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      message: "Events fetched successfully.",
      data: events,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching events."));
  }
};

// GET /api/events/admin (admin) — every non-deleted event, any status, for the management table.
const adminListEvents = async (req, res, next) => {
  try {
    const events = await eventModel
      .find({ isDeleted: false })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      message: "Events fetched successfully.",
      data: events,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching events."));
  }
};

// GET /api/events/:id (admin) — one event, for the edit form.
const getEventById = async (req, res, next) => {
  try {
    const event = await eventModel.findOne({ _id: req.params.id, isDeleted: false }).lean();

    if (!event) {
      return next(createHttpError(404, "Event not found."));
    }

    return res.json({
      success: true,
      message: "Event fetched successfully.",
      data: event,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching event."));
  }
};

// POST /api/events (admin) — new events append to the end of the display order.
const createEvent = async (req, res, next) => {
  try {
    const order = await eventModel.countDocuments({ isDeleted: false });
    const event = await eventModel.create({ ...req.body, order, createdBy: req.adminId });

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: event,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while creating event."));
  }
};

// PATCH /api/events/:id (admin)
const updateEvent = async (req, res, next) => {
  try {
    const existing = await eventModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!existing) {
      return next(createHttpError(404, "Event not found."));
    }

    const event = await eventModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Images replaced/removed by this update are no longer referenced —
    // clean up the ones that dropped off.
    if (req.body.images !== undefined) {
      const removed = existing.images.filter((url) => !req.body.images.includes(url));
      removed.forEach((url) => deleteUploadedFile(url));
    }

    return res.json({
      success: true,
      message: "Event updated successfully.",
      data: event,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while updating event."));
  }
};

// DELETE /api/events/:id (admin, soft delete)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await eventModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!event) {
      return next(createHttpError(404, "Event not found."));
    }

    return res.json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (err) {
    return next(createHttpError(500, "Error while deleting event."));
  }
};

// PATCH /api/events/reorder (admin) — body: { ids: string[] } in the new
// display order; each event's `order` becomes its index in that array.
const reorderEvents = async (req, res, next) => {
  try {
    const { ids } = req.body;

    await Promise.all(
      ids.map((id, index) =>
        eventModel.updateOne({ _id: id, isDeleted: false }, { $set: { order: index } })
      )
    );

    return res.json({
      success: true,
      message: "Events reordered successfully.",
    });
  } catch (err) {
    return next(createHttpError(500, "Error while reordering events."));
  }
};

export {
  listEvents,
  adminListEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  reorderEvents,
};
