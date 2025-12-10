import express from "express";
import {
  getKelulusanBalita,
  autoLulusBalita,
  setKelulusanBalita,
  setPindahBalita,
  getRiwayatPindah,
  getSemuaBalitaLulus,
  getSemuaBalitaStatus,
  deleteKelulusanBalita
} from "../controllers/kelulusanController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/all-status", authenticateToken, getSemuaBalitaStatus);
router.get("/lulus", authenticateToken, getSemuaBalitaLulus);
router.get("/:nik", authenticateToken, getKelulusanBalita);
router.post("/:nik/auto", authenticateToken, autoLulusBalita);
router.post("/:nik/set-lulus", authenticateToken, setKelulusanBalita);
router.post("/:nik/pindah", authenticateToken, setPindahBalita);
router.delete('/:nik', authenticateToken, deleteKelulusanBalita);

export default router;