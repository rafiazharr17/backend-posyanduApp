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
