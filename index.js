import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import balitaRoutes from "./routes/balitaRoutes.js";
import perkembanganRoutes from "./routes/perkembanganRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import vaksinRoutes from "./routes/vaksinRoutes.js"; 
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use("/api/vaksin", vaksinRoutes); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.send("Backend Posyandu App is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server berjalan di http://localhost:${PORT}`)
);
