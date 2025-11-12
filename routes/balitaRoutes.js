import express from "express";
import {
  tambahBalita,
  getBalita,
  getBalitaByNIK,
  updateBalita,
  deleteBalita,
} from "../controllers/balitaController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, tambahBalita);
router.get("/", authenticateToken, getBalita);
router.get("/:nik", authenticateToken, getBalitaByNIK);
router.put("/:nik", authenticateToken, updateBalita);
router.delete("/:nik", authenticateToken, deleteBalita);

export default router;
