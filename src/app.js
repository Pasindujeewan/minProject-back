import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import errorHandler from "./middleware/error.middleware.js";
import notFound from "./middleware/notFound.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = 3000;

// db connection
await connectDB();

// Allow requests from your frontend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express + ES Modules!");
});
app.use("/api/v1/auth", authRoutes);
// 404 Handler
app.use(notFound);

//globel error handeler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
