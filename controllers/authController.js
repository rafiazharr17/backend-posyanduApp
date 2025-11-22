import db from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER USER
export const register = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi" });
  }

  const checkQuery = "SELECT * FROM user WHERE username = ?";
  db.query(checkQuery, [username], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length > 0) {
      return res.status(400).json({ message: "Username sudah terdaftar" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const insertQuery = "INSERT INTO user (username, password) VALUES (?, ?)";
    db.query(insertQuery, [username, hashedPassword], (err2) => {
      if (err2) return res.status(500).json({ message: "Gagal mendaftar" });
      res.status(201).json({ message: "Registrasi berhasil" });
    });
  });
};

// LOGIN USER
export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi" });
  }

  const query = "SELECT * FROM user WHERE username = ?";
  db.query(query, [username], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const user = result[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  });
};

//update username
export const updateUsername = (req, res) => {
  const userId = req.user.id;
  const { username } = req.body;

  if (!username || username.trim() === "") {
    return res.status(400).json({ message: "Username tidak boleh kosong" });
  }

  const checkQuery = "SELECT * FROM user WHERE username = ? AND id != ?";
  db.query(checkQuery, [username, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    const sql = "UPDATE user SET username = ? WHERE id = ?";
    db.query(sql, [username, userId], (err2) => {
      if (err2) return res.status(500).json({ message: "Gagal mengubah username" });
      res.status(200).json({ message: "Username berhasil diperbarui" });
    });
  });
};

//update password
export const updatePassword = (req, res) => {
  const userId = req.user.id;
  const { password_lama, password_baru } = req.body;

  if (!password_lama || !password_baru) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  const sql = "SELECT * FROM user WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    const user = result[0];
    const isValid = bcrypt.compareSync(password_lama, user.password);

    if (!isValid) {
      return res.status(401).json({ message: "Password lama salah" });
    }

    const hashed = bcrypt.hashSync(password_baru, 10);
    const updateSql = "UPDATE user SET password = ? WHERE id = ?";
    db.query(updateSql, [hashed, userId], (err2) => {
      if (err2) return res.status(500).json({ message: "Gagal mengubah password" });

      res.status(200).json({ message: "Password berhasil diperbarui" });
    });
  });
};

//update foto
export const updateFotoProfile = (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diupload" });
  }

  const filePath = req.file.filename;

  const sql = "UPDATE user SET foto_profile = ? WHERE id = ?";
  db.query(sql, [filePath, userId], (err) => {
    if (err) return res.status(500).json({ message: "Gagal menyimpan foto profil" });

    res.status(200).json({
      message: "Foto profil berhasil diperbarui",
      foto_profile: filePath,
    });
  });
};

//get me
export const getMe = (req, res) => {
  const userId = req.user.id;

  const sql = "SELECT id, username, foto_profile FROM user WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

    res.status(200).json(result[0]);
  });
};

export const deleteFotoProfile = (req, res) => {
  const userId = req.user.id;

  const sqlSelect = "SELECT foto_profile FROM user WHERE id = ?";
  db.query(sqlSelect, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    const currentPhoto = result[0]?.foto_profile;

    if (!currentPhoto) {
      return res.status(400).json({ message: "Tidak ada foto untuk dihapus" });
    }

    const fs = require("fs");
    const path = `uploads/${currentPhoto}`;
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }

    const sql = "UPDATE user SET foto_profile = NULL WHERE id = ?";
    db.query(sql, [userId], (err2) => {
      if (err2) return res.status(500).json({ message: "Gagal menghapus foto" });

      res.status(200).json({ message: "Foto berhasil dihapus" });
    });
  });
};



