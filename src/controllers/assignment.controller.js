import fs from "fs/promises";
import asyncHandler from "../utils/asyncHandler.js";
import { analyzeAssignment } from "../services/gemini.service.js";

export const analyzeController = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error("No PDF uploaded");
  }

  const analysis = await analyzeAssignment(req.file.path);
  console.log("Analysis result:", analysis);
  // TODO
  // Upload to Cloudinary
  // Save to database

  await fs.unlink(req.file.path);

  res.json({
    success: true,
    analysis,
  });
});
