import multer from "multer";
import path from "path";
import fs from "fs";

// Pastikan folder uploads ada
const folderPath = "./uploads";
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + ext);
    },
});

export const uploadFotoProfile = multer({
    storage: storage,
});
