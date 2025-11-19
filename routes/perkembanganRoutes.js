import express from "express";
import {
  tambahPerkembangan,
  getPerkembangan,
  getPerkembanganByNIK,
  updatePerkembangan,
  deletePerkembangan,
  getStatistikPerkembangan,
  getDetailPerkembangan,
  getLaporanKhusus,
  cekPerkembanganBulanIni
} from "../controllers/perkembanganController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get("/statistik/bulan",authenticateToken,getStatistikPerkembangan);
router.get("/bulanan/detail", authenticateToken,getDetailPerkembangan); 
router.get("/laporan/khusus", authenticateToken, getLaporanKhusus);
router.get("/cek", authenticateToken, cekPerkembanganBulanIni);
router.post("/", authenticateToken, tambahPerkembangan);
router.get("/", authenticateToken, getPerkembangan);
router.get("/:nik", authenticateToken, getPerkembanganByNIK);
router.put("/:id", authenticateToken, updatePerkembangan);
router.delete("/:id", authenticateToken, deletePerkembangan);


export default router;
