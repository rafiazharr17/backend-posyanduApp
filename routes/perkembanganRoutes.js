import express from "express";
import {
  tambahPerkembangan,
  getPerkembangan,
  getPerkembanganByNIK,
  updatePerkembangan,
  deletePerkembangan,
  getStatistikPerkembangan,
  getDetailPerkembangan
} from "../controllers/perkembanganController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get("/statistik/bulan",authenticateToken,getStatistikPerkembangan);
router.get("/bulanan/detail", getDetailPerkembangan); 
router.post("/", authenticateToken, tambahPerkembangan);
router.get("/", authenticateToken, getPerkembangan);
router.get("/:nik", authenticateToken, getPerkembanganByNIK);
router.put("/:id", authenticateToken, updatePerkembangan);
router.delete("/:id", authenticateToken, deletePerkembangan);


export default router;
