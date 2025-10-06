import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import balitaRoutes from "./routes/balitaRoutes.js";
import perkembanganRoutes from "./routes/perkembanganRoutes.js";

dotenv.config();

const app = express();

// === Middleware ===
app.use(cors());
app.use(express.json());

// === Tes koneksi ke database ===
db.connect((err) => {
  if (err) {
    console.error("❌ Gagal terhubung ke database:", err);
  } else {
    console.log("✅ Terhubung ke database MySQL!");
  }
});

// === Routes utama ===
app.use("/api/auth", authRoutes);     // ✅ route auth
app.use("/api/balita", balitaRoutes); // ✅ route balita
app.use("/api/perkembangan", perkembanganRoutes); // ✅ route perkembangan

// === Route default ===
app.get("/", (req, res) => {
  res.send("Backend Posyandu App is running...");
});

// === Jalankan server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`)
);
