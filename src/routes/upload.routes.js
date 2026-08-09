import { Router } from "express";
import upload from "../middleware/multer.middleware.js";
import { analyzeAssignmentPdf } from "../controllers/assignmentUpload.controller.js";
import { finalizePendingAssignment } from "../controllers/pendingAssignment.controller.js";
const router = Router();

router.post("/assignment-pdf", upload.single("pdf"), analyzeAssignmentPdf);
router.post(
  "/assignment-pending/:pendingId/complete",
  finalizePendingAssignment,
);

export default router;
