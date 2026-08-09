import { analyzeAssignment } from "./gemini.service.js";
import { analyzePdfFallback } from "./pdfFallback.service.js";

export async function analyzeAssignmentDocument(filePath) {
  try {
    return await analyzeAssignment(filePath);
  } catch (error) {
    console.error("Gemini analysis failed; using PDF fallback:", error);
    return analyzePdfFallback(filePath);
  }
}
