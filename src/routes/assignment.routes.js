import express from "express";
import { getAssignments } from "../controllers/assignmentGet.controller.js";
import {
  completeAssignment,
  deleteAssignment,
  getSingleAssignment,
} from "../controllers/assignmentManage.controller.js";
import { deletePendingAssignment } from "../controllers/assignmentPendingDelete.controller.js";
const router = express.Router();

router.get("/getAssignments", getAssignments);
router.patch("/:assignmentId/complete", completeAssignment);
router.get("/:assignmentId/get", getSingleAssignment);

router.delete("/:assignmentId/delete", deleteAssignment);
router.delete("/:assignmentId/deletePending", deletePendingAssignment);

export default router;
