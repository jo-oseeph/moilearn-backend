import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

/**
 * Downloads a file from a URL and returns base64
 */
async function urlToBase64(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data).toString("base64");
}

/**
 * Detects MIME type from Cloudinary URL
 */
function getMimeType(url) {
  if (url.includes(".pdf")) return "application/pdf";
  if (url.includes(".png")) return "image/png";
  if (url.includes(".webp")) return "image/webp";
  return "image/jpeg";
}

/**
 * Extracts exam paper metadata using Gemini Vision
 */
export async function extractPaperMetadata(fileUrl, schoolsList = []) {
  // Initialize inside the function so env is guaranteed to be loaded
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const base64Data = await urlToBase64(fileUrl);
  const mimeType = getMimeType(fileUrl);

  const prompt = `
You are analyzing a university exam past paper.
Extract the following metadata from the document.
${schoolsList.length > 0 ? `Match the school ONLY from this list: ${schoolsList.join(", ")}` : ""}

Return ONLY a valid JSON object, no markdown, no extra text:
{
  "course_code": { "value": "e.g. INS 322 or null", "confidence": "high|medium|low" },
  "course_title": { "value": "e.g. Information Systems or null", "confidence": "high|medium|low" },
  "exam_year": { "value": "e.g. 2023 or null", "confidence": "high|medium|low" },
  "year_of_study": { "value": "e.g. 3 or null", "confidence": "high|medium|low" },
  "semester": { "value": "e.g. 1 or null", "confidence": "high|medium|low" },
  "school": { "value": "exact match from list or null", "confidence": "high|medium|low" },
  "paper_type": { "value": "CAT|Main Exam|Supplementary or null", "confidence": "high|medium|low" }
}
  `.trim();

  const result = await model.generateContent([
    { inlineData: { mimeType, data: base64Data } },
    { text: prompt }
  ]);

  const rawText = result.response.text();
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}