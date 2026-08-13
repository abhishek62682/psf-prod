import createHttpError from "http-errors";
import careerModel from "./careerModel.js";

// GET /api/careers (public) — active, non-deleted postings only, newest first.
const listCareers = async (req, res, next) => {
  try {
    const careers = await careerModel
      .find({ status: "active", isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      message: "Careers fetched successfully.",
      data: careers,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching careers."));
  }
};

// GET /api/careers/admin (admin) — every non-deleted posting, any status
// (active/closed), for the management table.
const adminListCareers = async (req, res, next) => {
  try {
    const careers = await careerModel
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      message: "Careers fetched successfully.",
      data: careers,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching careers."));
  }
};

// GET /api/careers/:id (admin) — one posting, for the edit form.
const getCareerById = async (req, res, next) => {
  try {
    const career = await careerModel.findOne({ _id: req.params.id, isDeleted: false }).lean();

    if (!career) {
      return next(createHttpError(404, "Career posting not found."));
    }

    return res.json({
      success: true,
      message: "Career posting fetched successfully.",
      data: career,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching career posting."));
  }
};

// POST /api/careers (admin)
const createCareer = async (req, res, next) => {
  try {
    const career = await careerModel.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Career posting created successfully.",
      data: career,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while creating career posting."));
  }
};

// PATCH /api/careers/:id (admin) — including status toggle
// (active ⇄ closed), so admin can hide/show a posting without deleting it.
const updateCareer = async (req, res, next) => {
  try {
    const career = await careerModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!career) {
      return next(createHttpError(404, "Career posting not found."));
    }

    return res.json({
      success: true,
      message: "Career posting updated successfully.",
      data: career,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while updating career posting."));
  }
};

// DELETE /api/careers/:id (admin, soft delete)
const deleteCareer = async (req, res, next) => {
  try {
    const career = await careerModel.findByIdAndUpdate(
      req.params.id,
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!career) {
      return next(createHttpError(404, "Career posting not found."));
    }

    return res.json({
      success: true,
      message: "Career posting deleted successfully.",
    });
  } catch (err) {
    return next(createHttpError(500, "Error while deleting career posting."));
  }
};

export { listCareers, adminListCareers, getCareerById, createCareer, updateCareer, deleteCareer };
