import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import cors from "cors";
import errorHandler from "./middleware/error.middleware.js";
import notFound from "./middleware/notFound.js";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import morgan from "morgan";

const app = express();
const PORT = 3000;

// db connection
app.use(morgan("dev"));
await connectDB();

// Allow requests from your frontend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express + ES Modules!");
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/assignment", assignmentRoutes);
// 404 Handler
app.use(notFound);

//globel error handeler
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
