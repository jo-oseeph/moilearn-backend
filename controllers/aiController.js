import { extractPaperMetadata } from "../utils/ai/geminiVision.js";

/**
 * POST /api/ai/extract-metadata
 * Body: { fileUrl: string, schools: string[] }
 */
export const extractMetadata = async (req, res) => {
  try {
    const { fileUrl, schools = [] } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: "fileUrl is required" });
    }

    const metadata = await extractPaperMetadata(fileUrl, schools);

    res.json({ success: true, metadata });

  } catch (error) {
    console.error("Metadata extraction error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};