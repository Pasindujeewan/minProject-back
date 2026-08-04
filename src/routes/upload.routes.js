import { Router } from "express";
import upload from "../middleware/multer.middleware.js";
import {
  analyzeController,
  completePendingAssignment,
} from "../controllers/assignment.controller.js";
const router = Router();

router.post("/assignment-pdf", upload.single("pdf"), analyzeController);
router.post("/assignment-pending/:pendingId/complete", completePendingAssignment);

export default router;
