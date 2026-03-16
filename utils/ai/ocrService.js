import axios from "axios";
import FormData from "form-data";

/**
 * Downloads file and extracts text using OCR.space
 */
async function extractTextWithOCR(fileUrl) {
  const fileResponse = await axios.get(fileUrl, { responseType: "arraybuffer" });
  const fileBuffer = Buffer.from(fileResponse.data);

  const isPDF = fileUrl.includes(".pdf");
  const fileName = isPDF ? "paper.pdf" : "paper.jpg";
  const mimeType = isPDF ? "application/pdf" : "image/jpeg";

  const formData = new FormData();
  formData.append("file", fileBuffer, { filename: fileName, contentType: mimeType });
  formData.append("apikey", process.env.OCR_SPACE_API_KEY);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("detectOrientation", "true");
  formData.append("scale", "true");
  formData.append("OCREngine", "2");

  const response = await axios.post("https://api.ocr.space/parse/image", formData, {
    headers: formData.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });

  const result = response.data;

  if (result.IsErroredOnProcessing) {
    throw new Error(result.ErrorMessage?.[0] || "OCR processing failed");
  }

  const text = result.ParsedResults?.[0]?.ParsedText;
  if (!text) throw new Error("No text extracted from document");

  return text;
}

/**
 * Parses raw OCR text into structured metadata
 */
function parseMetadataFromText(text, schoolsList = []) {
  const upper = text.toUpperCase();

  // Course code — matches INF 440, INS 322 etc
  const courseCodeMatch = text.match(/\b([A-Z]{2,4})\s*(\d{3})\b/);
  const courseCode = courseCodeMatch
    ? `${courseCodeMatch[1]} ${courseCodeMatch[2]}`
    : null;

  // Course title — text after "INF 440:" or "INS 322:" pattern
  const titleMatch = text.match(/[A-Z]{2,4}\s*\d{3}\s*:\s*(.+)/);
  const courseTitle = titleMatch ? titleMatch[1].trim() : null;

  // Exam year — 4 digit year
  const yearMatch = text.match(/\b(20[0-9]{2})\b/);
  const examYear = yearMatch ? yearMatch[1] : null;

  // Year of study — matches "FOURTH YEAR", "YEAR 4", "4TH YEAR" etc
  const yearWordMap = {
    FIRST: "1", SECOND: "2", THIRD: "3", FOURTH: "4", FIFTH: "5",
    "1ST": "1", "2ND": "2", "3RD": "3", "4TH": "4", "5TH": "5",
    ONE: "1", TWO: "2", THREE: "3", FOUR: "4", FIVE: "5"
  };
  let yearOfStudy = null;
  const yearOfStudyMatch = upper.match(
    /(FIRST|SECOND|THIRD|FOURTH|FIFTH|1ST|2ND|3RD|4TH|5TH|ONE|TWO|THREE|FOUR|FIVE)\s+YEAR|YEAR\s*[:\-]?\s*([1-5])/
  );
  if (yearOfStudyMatch) {
    yearOfStudy = yearWordMap[yearOfStudyMatch[1]] || yearOfStudyMatch[2] || null;
  }

  // Semester — matches "FIRST SEMESTER", "SECOND SEMESTER", "SEMESTER 1/2"
  const semesterWordMap = { FIRST: "1", SECOND: "2" };
  let semester = null;
  const semesterMatch = upper.match(
    /(FIRST|SECOND)\s+SEMESTER|SEMESTER\s*[:\-]?\s*([12])/
  );
  if (semesterMatch) {
    semester = semesterWordMap[semesterMatch[1]] || semesterMatch[2] || null;
  }

  // School — fuzzy match against provided list
  let school = null;
  let schoolConfidence = "low";
  if (schoolsList.length > 0) {
    for (const s of schoolsList) {
      const words = s.toUpperCase().split(" ").filter(w => w.length > 3);
      const matchCount = words.filter(w => upper.includes(w)).length;
      if (matchCount >= 2) {
        school = s;
        schoolConfidence = matchCount >= 3 ? "high" : "medium";
        break;
      }
    }
  }

  // Paper type
  let paperType = null;
  if (upper.includes("CAT") || upper.includes("CONTINUOUS ASSESSMENT")) paperType = "CAT";
  else if (upper.includes("SUPPLEMENTARY")) paperType = "Supplementary";
  else if (
    upper.includes("END OF SEMESTER") ||
    upper.includes("FINAL EXAMINATION") ||
    upper.includes("SEMESTER EXAMINATION")
  ) paperType = "Main Exam";

  return {
    course_code: { value: courseCode, confidence: courseCode ? "high" : "low" },
    course_title: { value: courseTitle, confidence: courseTitle ? "high" : "low" },
    exam_year: { value: examYear, confidence: examYear ? "high" : "low" },
    year_of_study: { value: yearOfStudy, confidence: yearOfStudy ? "high" : "low" },
    semester: { value: semester, confidence: semester ? "high" : "low" },
    school: { value: school, confidence: schoolConfidence },
    paper_type: { value: paperType, confidence: paperType ? "high" : "low" }
  };
}

/**
 * Main export — extracts and parses metadata from a Cloudinary file
 */
export async function extractPaperMetadata(fileUrl, schoolsList = []) {
  const rawText = await extractTextWithOCR(fileUrl);
  console.log("OCR Raw Text:", rawText);
  const metadata = parseMetadataFromText(rawText, schoolsList);
  return metadata;
}