import express from "express";
import {
  tambahPerkembangan,
  getPerkembangan,
  getPerkembanganByNIK,
  updatePerkembangan,
  deletePerkembangan,
} from "../controllers/perkembanganController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua route perkembangan butuh token login
router.post("/", authenticateToken, tambahPerkembangan);
router.get("/", authenticateToken, getPerkembangan);
router.get("/:nik", authenticateToken, getPerkembanganByNIK);
router.put("/:id", authenticateToken, updatePerkembangan);
router.delete("/:id", authenticateToken, deletePerkembangan);

export default router;
