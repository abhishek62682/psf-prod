import mongoose from "mongoose";

const eventStatSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const eventActivitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Free-text category set by the admin, e.g. "Environment & Sustainability".
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // 1-6 photos, enforced in eventValidation.js (not here) so the error
    // message can be a clean 400 instead of a Mongoose ValidatorError.
    images: {
      type: [String],
      default: [],
    },
    // Optional impact numbers shown on the event card, e.g. { value: "1000+", label: "Trees Planted" }.
    stats: {
      type: [eventStatSchema],
      default: [],
    },
    // Key activities under this event, e.g. { title: "Tree Plantation Drives", description: "..." }.
    activities: {
      type: [eventActivitySchema],
      default: [],
    },
    eventStartDate: {
      type: Date,
    },
    eventEndDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    // Admin-controlled display order (lower = shown first, ascending).
    // New events append to the end; drag-and-drop reordering rewrites this.
    order: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ isDeleted: 1, status: 1, order: 1 });

export default mongoose.model("Event", eventSchema, "events");
