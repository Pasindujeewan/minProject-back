import express from "express";
import { getAssignments } from "../controllers/assignmentGet.controller.js";
import {
  completeAssignment,
  deleteAssignment,
} from "../controllers/assignmentManage.controller.js";
const router = express.Router();

router.get("/getAssignments", getAssignments);
router.patch("/:assignmentId/complete", completeAssignment);

router.delete("/:assignmentId/delete", deleteAssignment);

export default router;
