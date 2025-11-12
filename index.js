import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import balitaRoutes from "./routes/balitaRoutes.js";
import perkembanganRoutes from "./routes/perkembanganRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

db.connect((err) => {
  if (err) {
    console.error("Gagal terhubung ke database:", err);
  } else {
    console.log("Terhubung ke database MySQL!");
  }
});

app.use("/api/auth", authRoutes);    
app.use("/api/balita", balitaRoutes); 
app.use("/api/perkembangan", perkembanganRoutes);
app.use("/api/report", reportRoutes);

app.get("/", (req, res) => {
  res.send("Backend Posyandu App is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server berjalan di http://localhost:${PORT}`)
);
