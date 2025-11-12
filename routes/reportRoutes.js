import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { getLaporanPerkembangan } from "../controllers/reportController.js";

const router = express.Router();

router.get("/:nik_balita", authenticateToken, getLaporanPerkembangan);

export default router;
