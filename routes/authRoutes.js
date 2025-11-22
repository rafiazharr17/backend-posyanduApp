import express from "express";
import { register, login, updateUsername, updatePassword, updateFotoProfile, getMe, deleteFotoProfile  } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { uploadFotoProfile } from "../middlewares/uploadFotoProfile.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);
router.put("/update-username", authenticateToken, updateUsername);
router.put("/update-password", authenticateToken, updatePassword);
router.delete("/delete-photo", authenticateToken, deleteFotoProfile);
router.post(
    "/update-photo",
    authenticateToken,
    uploadFotoProfile.single("foto"),
    updateFotoProfile
);

export default router;
