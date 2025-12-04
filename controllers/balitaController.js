import db from "../db.js";

const isNumeric = (value) => /^\d+$/.test(value);
const validateNumericFields = (fields) => {
  const rules = {
    nik_balita: { length: 16, label: "NIK Balita" },
    anak_ke_berapa: { label: "Anak ke berapa" },
    nomor_kk: { length: 16, label: "Nomor KK" },
    nik_ortu: { length: 16, label: "NIK Orang Tua" },
    nomor_telp_ortu: { label: "Nomor Telepon Orang Tua" },
    rt: { maxLength: 3, label: "RT" },
    rw: { maxLength: 3, label: "RW" },
  };

  for (const [key, value] of Object.entries(fields)) {
    if (!isNumeric(value)) {
      return `${rules[key]?.label || key} hanya boleh berisi angka`;
    }

    if (rules[key]?.length && value.length !== rules[key].length) {
      return `${rules[key].label} harus ${rules[key].length} digit`;
    }

    if (rules[key]?.maxLength && value.length > rules[key].maxLength) {
      return `${rules[key].label} maksimal ${rules[key].maxLength} digit`;
    }
  }

  return null;
};

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
    bb_lahir,   
    tb_lahir   
  } = req.body;

  const error = validateNumericFields({
    nik_balita,
    anak_ke_berapa,
    nomor_kk,
    nik_ortu,
    nomor_telp_ortu,
    rt,
    rw,
  });

  if (error) return res.status(400).json({ message: error });

  const sql = `
    INSERT INTO balita (
      nik_balita, nama_balita, jenis_kelamin, tanggal_lahir,
      anak_ke_berapa, nomor_kk, nama_ortu, nik_ortu,
      nomor_telp_ortu, alamat, rt, rw, bb_lahir, tb_lahir
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      bb_lahir,  
      tb_lahir   
    ],
    (err) => {
      if (err) {
        console.error("Error saat tambah data:", err);
        return res.status(500).json({ message: "Gagal menambahkan data balita" });
      }
      res.status(201).json({ message: "Data balita berhasil ditambahkan" });
    }
  );
};

// Ambil semua data balita
export const getBalita = (req, res) => {
  const sql = `
    SELECT b.* FROM balita b
    LEFT JOIN kelulusan_balita k ON b.nik_balita = k.nik_balita
    WHERE (k.status != 'LULUS' OR k.status IS NULL)
    ORDER BY b.created_at DESC
  `;

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
    bb_lahir,   
    tb_lahir  
  } = req.body;

  const error = validateNumericFields({
    anak_ke_berapa,
    nomor_kk,
    nik_ortu,
    nomor_telp_ortu,
    rt,
    rw,
  });

  if (error) return res.status(400).json({ message: error });

  const sql = `
    UPDATE balita SET
      nama_balita=?, jenis_kelamin=?, tanggal_lahir=?, anak_ke_berapa=?,
      nomor_kk=?, nama_ortu=?, nik_ortu=?, nomor_telp_ortu=?,
      alamat=?, rt=?, rw=?, bb_lahir=?, tb_lahir=?
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
      bb_lahir,  
      tb_lahir,  
      nik
    ],
    (err) => {
      if (err) return res.status(500).json({ message: "Gagal memperbarui data" });
      res.status(200).json({ message: "Data balita berhasil diperbarui" });
    }
  );
};

// Hapus data balita
export const deleteBalita = (req, res) => {
  const nik = req.params.nik;
  const sql = "DELETE FROM balita WHERE nik_balita = ?";
  db.query(sql, [nik], (err) => {
    if (err) return res.status(500).json({ message: "Gagal menghapus data" });
    res.status(200).json({ message: "Data balita berhasil dihapus" });
  });
};
