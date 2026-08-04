import fs from "fs";
import ai from "../config/gemini.js";

export const analyzeAssignment = async (filePath) => {
  const pdfBuffer = fs.readFileSync(filePath);
  const base64Pdf = pdfBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Pdf,
            },
          },
          {
            text: `
Analyze the uploaded assignment document and return ONLY valid JSON.
Do not include markdown, code fences, explanations, or additional text.

Evaluation guidelines:
- Identify the assignment title.
- Write a concise summary using no more than 2 sentences.
- The summary MUST be 400 characters or fewer, including spaces.
- Do not repeat instructions, grading criteria, or long lists in the summary.
- Estimate overall difficulty from 0 to 10, where 0 is extremely easy,
  5 is moderate, and 10 is extremely difficult.
- Estimate completion time for an average university student in minutes only.
  Include reading, research, implementation, testing, documentation, and writing.
- Extract or infer the deadline as YYYY-MM-DD. Use "Not found" if unavailable.
- Identify the module or course name. Use "Not found" if unavailable.

Return exactly this JSON structure:
{
  "title": "string",
  "summary": "string (maximum 400 characters)",
  "difficultyScore": 0,
  "estimatedTime": 0,
  "deadline": "YYYY-MM-DD or Not found",
  "module": "string"
}
            `,
          },
        ],
      },
    ],
  });

  const cleanJson = response.text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanJson);
};
