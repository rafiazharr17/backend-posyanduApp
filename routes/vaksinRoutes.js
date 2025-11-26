import express from "express";
import {
  getAllVaksin,
  getVaksinBalita,
  tambahVaksinBalita,
  deleteVaksinBalita,
  getRekomendasiVaksin,
  createVaksin,
  getVaksinById,
  updateVaksin,
  deleteVaksin,
  updateVaksinBalita
} from "../controllers/vaksinController.js";

import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// MASTER VAKSIN
router.get("/master", authenticateToken, getAllVaksin);
router.post("/master", authenticateToken, createVaksin);
router.get("/master/:id", authenticateToken, getVaksinById);
router.put("/master/:id", authenticateToken, updateVaksin);
router.delete("/master/:id", authenticateToken, deleteVaksin);

// VAKSIN BALITA
router.get("/riwayat/:nik", authenticateToken, getVaksinBalita);
router.post("/balita", authenticateToken, tambahVaksinBalita);
router.put('/balita/:id',authenticateToken, updateVaksinBalita);
router.delete("/balita/:id", authenticateToken, deleteVaksinBalita);
router.get("/rekomendasi/:nik", authenticateToken, getRekomendasiVaksin);

export default router;
