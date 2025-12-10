import db from "../db.js";

// Hitung progress vaksin balita
const hitungProgressVaksin = (nik) => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT COUNT(*) AS total FROM vaksin`, (errTotal, totalRows) => {
      if (errTotal) return reject(errTotal);

      const total = totalRows[0].total;

      const sql = `
        SELECT vb.id
        FROM vaksin_balita vb
        WHERE vb.nik_balita = ?
      `;

      db.query(sql, [nik], (errTaken, taken) => {
        if (errTaken) return reject(errTaken);

        resolve({
          total_vaksin: total,
          sudah_diambil: taken.length,
          progress_vaksin: total > 0 ? (taken.length / total) : 0
        });
      });
    });
  });
};

// Hitung progress umur (0 - 60 bulan)
const hitungProgressUmur = (nik) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT tanggal_lahir FROM balita WHERE nik_balita = ?",
      [nik],
      (err, rows) => {
        if (err) return reject(err);
        if (rows.length === 0) return resolve(null);

        const tglLahir = new Date(rows[0].tanggal_lahir);
        const now = new Date();

        const umurBulan = Math.floor(
          (now - tglLahir) / (1000 * 60 * 60 * 24 * 30)
        );

        const totalBulan = 60; // 5 tahun
        const progressUmur =
          umurBulan >= totalBulan ? 1 : (umurBulan / totalBulan);

        resolve({
          umur_bulan: umurBulan,
          progress_umur: progressUmur
        });
      }
    );
  });
};

// GET kelulusan balita (status + progres)
export const getKelulusanBalita = async (req, res) => {
  const nik = req.params.nik;

  try {
    const vaksin = await hitungProgressVaksin(nik);
    const umur = await hitungProgressUmur(nik);
    
    if (!umur) {
      return res.json({ success: false, message: "Data balita tidak ditemukan." });
    }

    const sql = `
      SELECT 
        status, 
        keterangan,
        DATE_FORMAT(tanggal_lulus, '%Y-%m-%d') as tanggal_lulus 
      FROM kelulusan_balita 
      WHERE nik_balita = ?
    `;

    db.query(sql, [nik], (err, gradRows) => {
      if (err) return res.status(500).json({ success: false, message: err.message });

      let status = "BELUM LULUS";
      let tanggal_lulus = null;
      let keterangan = null;

      if (gradRows.length > 0) {
        status = gradRows[0].status;
        tanggal_lulus = gradRows[0].tanggal_lulus; 
        keterangan = gradRows[0].keterangan;
      }

      return res.json({
        success: true,
        status,
        tanggal_lulus, 
        keterangan,
        vaksin,
        umur,
        siap_lulus: vaksin.progress_vaksin === 1 && umur.progress_umur === 1
      });
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// AUTO set kelulusan (hanya jika kedua progress penuh)
export const autoLulusBalita = async (req, res) => {
  const nik = req.params.nik;

  try {
    const vaksin = await hitungProgressVaksin(nik);
    const umur = await hitungProgressUmur(nik);

    if (vaksin.progress_vaksin < 1 || umur.progress_umur < 1) {
      return res.json({
        success: false,
        message: "Belum memenuhi syarat kelulusan."
      });
    }

    const today = new Date().toISOString().split("T")[0];

    // Cek record
    db.query(
      "SELECT id FROM kelulusan_balita WHERE nik_balita = ?",
      [nik],
      (err, rows) => {
        if (err)
          return res.status(500).json({ success: false, message: err.message });

        if (rows.length > 0) {
          // Update
          db.query(
            `UPDATE kelulusan_balita 
             SET status='LULUS', tanggal_lulus=?, keterangan='Lulus otomatis'
             WHERE nik_balita=?`,
            [today, nik]
          );
        } else {
          // Insert baru
          db.query(
            `INSERT INTO kelulusan_balita (nik_balita, status, tanggal_lulus, keterangan)
             VALUES (?, 'LULUS', ?, 'Lulus otomatis')`,
            [nik, today]
          );
        }

        return res.json({
          success: true,
          message: "Balita sudah dinyatakan LULUS."
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Set kelulusan manual (LULUS/PINDAH)
export const setKelulusanBalita = (req, res) => {
  const nik = req.params.nik;
  const { status, keterangan } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status wajib diisi."
    });
  }

  // Validasi status yang diperbolehkan
  const allowedStatus = ["LULUS", "PINDAH"];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status harus LULUS atau PINDAH."
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const defaultKeterangan = status === "LULUS" 
    ? "Lulus manual oleh kader" 
    : "Pindah lokasi oleh kader";

  db.query(
    "SELECT id FROM kelulusan_balita WHERE nik_balita = ?",
    [nik],
    (err, rows) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });

      if (rows.length > 0) {
        // Update
        db.query(
          `UPDATE kelulusan_balita 
           SET status=?, tanggal_lulus=?, keterangan=? 
           WHERE nik_balita=?`,
          [status, today, keterangan || defaultKeterangan, nik]
        );
      } else {
        // Insert baru
        db.query(
          `INSERT INTO kelulusan_balita (nik_balita, status, tanggal_lulus, keterangan) 
           VALUES (?, ?, ?, ?)`,
          [nik, status, today, keterangan || defaultKeterangan]
        );
      }

      const message = status === "LULUS" 
        ? "Balita berhasil diluluskan secara manual." 
        : "Balita berhasil dipindahkan.";

      return res.json({
        success: true,
        message: message
      });
    }
  );
};

// DELETE batalkan kelulusan (Hapus data kelulusan)
export const deleteKelulusanBalita = (req, res) => {
  const nik = req.params.nik;

  db.query(
    `DELETE FROM kelulusan_balita WHERE nik_balita = ?`,
    [nik],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Data kelulusan tidak ditemukan atau sudah dihapus.",
        });
      }

      return res.json({
        success: true,
        message: "Status kelulusan berhasil dibatalkan. Balita kembali aktif.",
      });
    }
  );
};

// Set pindah manual untuk balita (alternatif route)
export const setPindahBalita = (req, res) => {
  const nik = req.params.nik;
  const { keterangan } = req.body;

  const today = new Date().toISOString().split("T")[0];
  const defaultKeterangan = "Pindah lokasi oleh kader";

  // Cek apakah balita ada
  db.query(
    "SELECT nama_balita FROM balita WHERE nik_balita = ?",
    [nik],
    (err, balitaRows) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });

      if (balitaRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Data balita tidak ditemukan."
        });
      }

      // Cek record kelulusan
      db.query(
        "SELECT id FROM kelulusan_balita WHERE nik_balita = ?",
        [nik],
        (err, gradRows) => {
          if (err)
            return res.status(500).json({ success: false, message: err.message });

          if (gradRows.length > 0) {
            // Update status menjadi PINDAH
            db.query(
              `UPDATE kelulusan_balita 
               SET status='PINDAH', tanggal_lulus=?, keterangan=?
               WHERE nik_balita=?`,
              [today, keterangan || defaultKeterangan, nik]
            );
          } else {
            // Insert baru dengan status PINDAH
            db.query(
              `INSERT INTO kelulusan_balita (nik_balita, status, tanggal_lulus, keterangan) 
               VALUES (?, 'PINDAH', ?, ?)`,
              [nik, today, keterangan || defaultKeterangan]
            );
          }

          return res.json({
            success: true,
            message: "Balita berhasil dipindahkan."
          });
        }
      );
    }
  );
};

// GET riwayat pindah balita
export const getRiwayatPindah = (req, res) => {
  const nik = req.params.nik;

  const sql = `
    SELECT 
      ph.*,
      b.nama_balita
    FROM pindah_history ph
    JOIN balita b ON b.nik_balita = ph.nik_balita
    WHERE ph.nik_balita = ?
    ORDER BY ph.tanggal_pindah DESC
  `;

  db.query(sql, [nik], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    return res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  });
};

// GET semua balita yang sudah lulus
export const getSemuaBalitaLulus = (req, res) => {
  const sql = `
    SELECT 
      k.nik_balita,
      k.status,
      k.tanggal_lulus,
      k.keterangan,
      b.nama_balita,
      b.jenis_kelamin,
      b.tanggal_lahir,
      -- Hitung usia saat lulus dalam bulan
      FLOOR(
        TIMESTAMPDIFF(DAY, b.tanggal_lahir, k.tanggal_lulus) / 30
      ) AS umur_lulus_bulan
    FROM kelulusan_balita k
    JOIN balita b ON b.nik_balita = k.nik_balita
    WHERE k.status = 'LULUS'
    ORDER BY k.tanggal_lulus DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    return res.json({
      success: true,
      total_lulus: rows.length,
      data: rows,
    });
  });
};

// GET semua balita + status kelulusan
export const getSemuaBalitaStatus = async (req, res) => {
  try {
    db.query(
      `SELECT 
        b.nik_balita, 
        b.nama_balita, 
        b.tanggal_lahir,
        COALESCE(k.status, 'BELUM LULUS') as status
       FROM balita b
       LEFT JOIN kelulusan_balita k ON b.nik_balita = k.nik_balita
       ORDER BY b.nama_balita ASC`,
      async (err, balitaRows) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message,
          });
        }

        let hasil = [];

        for (const b of balitaRows) {
          const nik = b.nik_balita;

          const vaksin = await hitungProgressVaksin(nik);
          const umur = await hitungProgressUmur(nik);

          // Jika status dari database adalah LULUS atau PINDAH, gunakan itu
          // Jika tidak, hitung berdasarkan progress
          let status = b.status;
          if (status === "BELUM LULUS" && vaksin.progress_vaksin === 1 && umur.progress_umur === 1) {
            status = "LULUS";
          }

          hasil.push({
            nik_balita: b.nik_balita,
            nama_balita: b.nama_balita,
            tanggal_lahir: b.tanggal_lahir,
            umur_bulan: umur.umur_bulan,
            progress_vaksin: vaksin.progress_vaksin,
            progress_umur: umur.progress_umur,
            status,
          });
        }

        return res.json({
          success: true,
          total: hasil.length,
          data: hasil,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};