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
    completeStatus: {
      type: Boolean,
      required: true,
      default: false,
    },

    difficulty: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    priority: {
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
    deadline: {
      type: Date,
      required: true,
      default: null,
    },
    module: {
      type: String,
      required: true,
      trim: true,
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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Assignment", assignmentSchema);
