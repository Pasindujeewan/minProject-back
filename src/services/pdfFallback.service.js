import fs from "fs/promises";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const analyzePdfFallback = async (filePath) => {
  const buffer = await fs.readFile(filePath);

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
  });

  const pdf = await loadingTask.promise;

  let text = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    const pageText = content.items.map((item) => item.str).join(" ");
    text += pageText + "\n";
  }

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const title = (lines[0] || "Untitled Assignment")
    .split(/\s+/)
    .slice(0, 12)
    .join(" ");

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const shortSummary = text.split(/\s+/).slice(0, 50).join(" ");

  const estimatedTime = Math.max(1, Math.ceil(wordCount / 200));

  let difficulty = 2;

  if (wordCount > 500) difficulty = 4;
  if (wordCount > 1000) difficulty = 6;
  if (wordCount > 2000) difficulty = 8;
  if (wordCount > 3000) difficulty = 10;

  // 👉 NEW FIELD EXTRACTION (simple regex-based approach)

  const deadlineMatch = text.match(/deadline[:\-]?\s*(.+)/i);

  const moduleMatch = text.match(/(module|course|subject)[:\-]?\s*(.+)/i);

  const deadline = deadlineMatch
    ? deadlineMatch[1].split("\n")[0].trim()
    : "Not found";

  const module = moduleMatch
    ? moduleMatch[2].split("\n")[0].trim()
    : "Not found";

  return {
    title,
    summary: shortSummary,
    difficultyScore: difficulty,
    estimatedTime,
    deadline,
    module,
  };
};
