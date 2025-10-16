import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { getLaporanPerkembangan } from "../controllers/reportController.js";

const router = express.Router();

// Ambil laporan perkembangan berdasarkan NIK balita
router.get("/:nik_balita", authenticateToken, getLaporanPerkembangan);

export default router;
