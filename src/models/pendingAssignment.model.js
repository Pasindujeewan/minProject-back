import mongoose from "mongoose";

const pendingAssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, default: null, trim: true },
    shortSummary: { type: String, default: null, trim: true },
    module: { type: String, default: null, trim: true },
    difficulty: { type: Number, default: null },
    estimatedTime: { type: Number, default: null },
    deadline: { type: Date, default: null },
    pdfUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    missingFields: [{ type: String, required: true }],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000),
      expires: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("PendingAssignment", pendingAssignmentSchema);
