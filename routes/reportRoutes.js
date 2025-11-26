import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { getLaporanPerkembangan, getDetailPerkembangan, getLaporanKhusus } from "../controllers/reportController.js";

const router = express.Router();

router.get("/:nik_balita", authenticateToken, getLaporanPerkembangan);
router.get("/bulanan/detail", authenticateToken,getDetailPerkembangan); 
router.get("/laporan/khusus", authenticateToken, getLaporanKhusus);

export default router;
