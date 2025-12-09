import db from "../db.js";

// GET semua master vaksin
export const getAllVaksin = (req, res) => {
  db.query(`
    SELECT id, kode, nama_vaksin, usia_bulan, keterangan 
    FROM vaksin 
    ORDER BY usia_bulan ASC
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    return res.json({
      success: true,
      data: rows,
    });
  });
};


// GET vaksin yang sudah diambil balita + progress
export const getVaksinBalita = (req, res) => {
  const nik = req.params.nik;

  db.query(`SELECT COUNT(*) AS total FROM vaksin`, (errTotal, totalRows) => {
    if (errTotal) {
      return res.status(500).json({
        success: false,
        message: errTotal.message,
      });
    }

    const total = totalRows[0].total;

    const sql = `
      SELECT 
        vb.id,
        vb.vaksin_id,
        v.nama_vaksin,
        v.kode,
        v.usia_bulan,
        vb.tanggal_vaksin AS tanggal,
        vb.petugas,
        vb.batch_no,
        vb.lokasi
      FROM vaksin_balita vb
      JOIN vaksin v ON v.id = vb.vaksin_id
      WHERE vb.nik_balita = ?
      ORDER BY v.usia_bulan ASC
    `;


    db.query(sql, [nik], (errTaken, taken) => {
      if (errTaken) {
        return res.status(500).json({
          success: false,
          message: errTaken.message,
        });
      }

      return res.json({
        success: true,
        total_vaksin: total,
        sudah_diambil: taken.length,
        progress: total > 0 ? (taken.length / total) : 0,
        data: taken,
      });
    });
  });
};

// POST tambah vaksin balita 
export const tambahVaksinBalita = (req, res) => {
  const { nik_balita, vaksin_id, tanggal, petugas, batch_no, lokasi } = req.body;

  if (!nik_balita || !vaksin_id || !tanggal) {
    return res.status(400).json({
      success: false,
      message: "Data tidak lengkap",
    });
  }

  db.query(`
    SELECT id FROM vaksin_balita 
    WHERE nik_balita = ? AND vaksin_id = ?
  `, [nik_balita, vaksin_id], (errCek, cek) => {
    if (errCek) {
      return res.status(500).json({
        success: false,
        message: errCek.message,
      });
    }

    if (cek.length > 0) {
      return res.json({
        success: false,
        message: "Vaksin ini sudah pernah diambil balita",
      });
    }

    db.query(`
      INSERT INTO vaksin_balita (nik_balita, vaksin_id, tanggal_vaksin, petugas, batch_no, lokasi)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [nik_balita, vaksin_id, tanggal, petugas, batch_no || null, lokasi || null], (errInsert) => {
      if (errInsert) {
        return res.status(500).json({
          success: false,
          message: errInsert.message,
        });
      }

      return res.json({
        success: true,
        message: "Data vaksin berhasil ditambahkan",
      });
    });
  });
};

// PUT update vaksin balita dengan cek duplikat
export const updateVaksinBalita = (req, res) => {
  const id = req.params.id; 
  const { vaksin_id, tanggal, petugas, batch_no, lokasi } = req.body;

  if (!vaksin_id || !tanggal) {
    return res.status(400).json({
      success: false,
      message: "Data vaksin_id dan tanggal wajib diisi",
    });
  }

  db.query(`
    SELECT id
    FROM vaksin_balita 
    WHERE id = ?
  `, [id], (errCek, cek) => {
    if (errCek) {
      return res.status(500).json({
        success: false,
        message: errCek.message,
      });
    }

    if (cek.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data vaksin tidak ditemukan",
      });
    }

    const sql = `
      UPDATE vaksin_balita 
      SET 
        vaksin_id = ?,
        tanggal_vaksin = ?, 
        petugas = ?, 
        batch_no = ?, 
        lokasi = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        vaksin_id,
        tanggal,
        petugas || null,
        batch_no || null,
        lokasi || null,
        id
      ],
      (errUpdate) => {
        if (errUpdate) {
          return res.status(500).json({
            success: false,
            message: errUpdate.message,
          });
        }

        return res.json({
          success: true,
          message: "Data vaksin berhasil diupdate",
        });
      }
    );
  });
};


// DELETE vaksin balita
export const deleteVaksinBalita = (req, res) => {
  const id = req.params.id;

  db.query(`DELETE FROM vaksin_balita WHERE id = ?`, [id], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    return res.json({
      success: true,
      message: "Data vaksin berhasil dihapus",
    });
  });
};


// GET rekomendasi vaksin selanjutnya
export const getRekomendasiVaksin = (req, res) => {
  const nik = req.params.nik;

  db.query(`
    SELECT tanggal_lahir 
    FROM balita 
    WHERE nik_balita = ?
  `, [nik], (errBalita, balita) => {
    if (errBalita) {  
      return res.status(500).json({
        success: false,
        message: errBalita.message,
      });
    }

    if (balita.length === 0) {
      return res.json({ success: false, message: "Balita tidak ditemukan" });
    }

    const tanggalLahir = new Date(balita[0].tanggal_lahir);
    const now = new Date();
    const usiaBulan = Math.floor((now - tanggalLahir) / (1000 * 60 * 60 * 24 * 30));

    const sql = `
      SELECT v.*
      FROM vaksin v
      WHERE v.id NOT IN (
        SELECT vaksin_id FROM vaksin_balita WHERE nik_balita = ?
      )
      ORDER BY v.usia_bulan ASC
    `;

    db.query(sql, [nik], (errVaksin, belum) => {
      if (errVaksin) {
        return res.status(500).json({
          success: false,
          message: errVaksin.message,
        });
      }

      return res.json({
        success: true,
        usia_bulan: usiaBulan,
        vaksin_selanjutnya: belum,
      });
    });
  });
};



// VAKSIN

// CREATE master vaksin
export const createVaksin = (req, res) => {
  const { kode, nama_vaksin, usia_bulan, keterangan } = req.body;

  if (
    !kode ||
    !nama_vaksin ||
    usia_bulan === undefined ||
    usia_bulan === null ||
    usia_bulan === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "Data vaksin tidak lengkap",
    });
  }

  db.query(`
    INSERT INTO vaksin (kode, nama_vaksin, usia_bulan, keterangan)
    VALUES (?, ?, ?, ?)
  `, [kode, nama_vaksin, usia_bulan, keterangan], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    return res.json({
      success: true,
      message: "Vaksin berhasil ditambahkan",
    });
  });
};


// UPDATE master vaksin
export const updateVaksin = (req, res) => {
  const id = req.params.id;
  const { kode, nama_vaksin, usia_bulan, keterangan } = req.body;

  db.query(`
    UPDATE vaksin 
    SET kode=?, nama_vaksin=?, usia_bulan=?, keterangan=?
    WHERE id = ?
  `, [kode, nama_vaksin, usia_bulan, keterangan, id], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    return res.json({
      success: true,
      message: "Vaksin berhasil diperbarui",
    });
  });
};


// DELETE master vaksin
export const deleteVaksin = (req, res) => {
  const id = req.params.id;

  db.query(`DELETE FROM vaksin WHERE id = ?`, [id], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    return res.json({
      success: true,
      message: "Vaksin berhasil dihapus",
    });
  });
};


// GET detail master vaksin
export const getVaksinById = (req, res) => {
  const id = req.params.id;

  db.query(`SELECT * FROM vaksin WHERE id=?`, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data vaksin tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  });
};
