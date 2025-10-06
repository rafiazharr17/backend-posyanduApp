import db from "../db.js";

// Tambah data balita
export const tambahBalita = (req, res) => {
  const {
    nik_balita,
    nama_balita,
    jenis_kelamin,
    tanggal_lahir,
    anak_ke_berapa,
    nomor_kk,
    nama_ortu,
    nik_ortu,
    nomor_telp_ortu,
    alamat,
    rt,
    rw,
  } = req.body;

  const sql = `
    INSERT INTO balita (
      nik_balita, nama_balita, jenis_kelamin, tanggal_lahir,
      anak_ke_berapa, nomor_kk, nama_ortu, nik_ortu,
      nomor_telp_ortu, alamat, rt, rw
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      nik_balita,
      nama_balita,
      jenis_kelamin,
      tanggal_lahir,
      anak_ke_berapa,
      nomor_kk,
      nama_ortu,
      nik_ortu,
      nomor_telp_ortu,
      alamat,
      rt,
      rw,
    ],
    (err) => {
      if (err) {
        console.error("❌ Error saat tambah data:", err);
        return res.status(500).json({ message: "Gagal menambahkan data balita" });
      }
      res.status(201).json({ message: "✅ Data balita berhasil ditambahkan" });
    }
  );
};

// Ambil semua data balita
export const getBalita = (req, res) => {
  const sql = "SELECT * FROM balita ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Gagal mengambil data" });
    }
    res.status(200).json(results);
  });
};

// Ambil satu data berdasarkan NIK
export const getBalitaByNIK = (req, res) => {
  const nik = req.params.nik;
  const sql = "SELECT * FROM balita WHERE nik_balita = ?";
  db.query(sql, [nik], (err, result) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil data" });
    if (result.length === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    res.status(200).json(result[0]);
  });
};

// Update data balita
export const updateBalita = (req, res) => {
  const nik = req.params.nik;
  const {
    nama_balita,
    jenis_kelamin,
    tanggal_lahir,
    anak_ke_berapa,
    nomor_kk,
    nama_ortu,
    nik_ortu,
    nomor_telp_ortu,
    alamat,
    rt,
    rw,
  } = req.body;

  const sql = `
    UPDATE balita SET
      nama_balita=?, jenis_kelamin=?, tanggal_lahir=?, anak_ke_berapa=?,
      nomor_kk=?, nama_ortu=?, nik_ortu=?, nomor_telp_ortu=?,
      alamat=?, rt=?, rw=?
    WHERE nik_balita=?
  `;

  db.query(
    sql,
    [
      nama_balita,
      jenis_kelamin,
      tanggal_lahir,
      anak_ke_berapa,
      nomor_kk,
      nama_ortu,
      nik_ortu,
      nomor_telp_ortu,
      alamat,
      rt,
      rw,
      nik,
    ],
    (err) => {
      if (err) return res.status(500).json({ message: "Gagal memperbarui data" });
      res.status(200).json({ message: "✅ Data balita berhasil diperbarui" });
    }
  );
};

// Hapus data balita
export const deleteBalita = (req, res) => {
  const nik = req.params.nik;
  const sql = "DELETE FROM balita WHERE nik_balita = ?";
  db.query(sql, [nik], (err) => {
    if (err) return res.status(500).json({ message: "Gagal menghapus data" });
    res.status(200).json({ message: "🗑️ Data balita berhasil dihapus" });
  });
};
