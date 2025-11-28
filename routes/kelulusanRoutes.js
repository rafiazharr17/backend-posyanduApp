import express from "express";
import {
  getKelulusanBalita,
  autoLulusBalita,
  setKelulusanBalita,
  setPindahBalita,
  getRiwayatPindah,
  getSemuaBalitaLulus,
  getSemuaBalitaStatus,
} from "../controllers/kelulusanController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET semua balita dengan status kelulusan
router.get("/all-status", authenticateToken, getSemuaBalitaStatus);

// GET semua balita yang sudah lulus
router.get("/lulus", authenticateToken, getSemuaBalitaLulus);

// GET detail kelulusan balita
router.get("/:nik", authenticateToken, getKelulusanBalita);

// POST auto lulus balita
router.post("/:nik/auto", authenticateToken, autoLulusBalita);

// POST set status kelulusan manual (LULUS/PINDAH)
router.post("/:nik/set-lulus", authenticateToken, setKelulusanBalita);

// POST set pindah manual (alternatif route)
router.post("/:nik/pindah", authenticateToken, setPindahBalita);

export default router;