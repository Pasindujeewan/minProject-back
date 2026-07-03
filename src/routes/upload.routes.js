import { Router } from "express";
import upload from "../middleware/multer.middleware.js";
import { analyzeController } from "../controllers/assignment.controller.js";
const router = Router();

router.post("/assignment-pdf", upload.single("pdf"), analyzeController);

export default router;
