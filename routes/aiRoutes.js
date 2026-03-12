import express from "express";
import { extractMetadata } from "../controllers/aiController.js";

const router = express.Router();

router.post("/extract-metadata", extractMetadata);

export default router;