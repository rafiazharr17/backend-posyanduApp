import express from "express";
import {
  tambahBalita,
  getBalita,
  getBalitaByNIK,
  updateBalita,
  deleteBalita,
} from "../controllers/balitaController.js";

const router = express.Router();

router.post("/", tambahBalita);
router.get("/", getBalita);
router.get("/:nik", getBalitaByNIK);
router.put("/:nik", updateBalita);
router.delete("/:nik", deleteBalita);

export default router;
