import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    shortSummary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    difficulty: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    estimatedTime: {
      type: Number, // in minutes
      required: true,
      min: 1,
    },

    pdfUrl: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Assignment", assignmentSchema);
