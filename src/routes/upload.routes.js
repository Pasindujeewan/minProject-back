import { Router } from "express";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.post("/assignment-pdf", upload.single("pdf"), (req, res) => {
  console.log(req.file);

  res.json({
    message: "File uploaded locally",
    file: req.file,
  });
});

export default router;
