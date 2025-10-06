import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// Endpoint register
router.post("/register", register);

// Endpoint login
router.post("/login", login);

export default router;
