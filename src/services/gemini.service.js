import fs from "fs";
import path from "path";
import ai from "../config/gemini.js";

export const analyzeAssignment = async (filePath) => {
  // Read PDF
  const pdfBuffer = fs.readFileSync(filePath);

  // Convert to Base64
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

Evaluation Guidelines:
- Identify the assignment title.
- Write a concise summary in 2–3 sentences(100 character limit).
- Estimate the overall difficulty on a scale from 0 to 10:
  - 0 = Extremely easy
  - 5 = Moderate difficulty
  - 10 = Extremely difficult
- Estimate the time required for an average university student to complete the assignment.
  - Express the value only in minutes
  - Consider reading, research, implementation, testing, documentation, and report writing.
- Extract or infer the assignment deadline.(ex="2023-12-31" or "Not found")
- Identify the module/course name the assignment belongs to.

Return exactly this JSON structure:
follow under format mandotory
{
  "title": "string",
  "summary": "string",
  "difficultyScore": 0,
  "estimatedTime": 0,
  "deadline": "string", // ex-"2023-12-31"
  "module": "string"
}
}
            `,
          },
        ],
      },
    ],
  });
  const text = response.text;

  const cleanJson = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const analysis = JSON.parse(cleanJson);
  return analysis;
};
