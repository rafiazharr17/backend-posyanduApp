import db from "../db.js";

// Tambah data perkembangan balita
export const tambahPerkembangan = (req, res) => {
  const {
    nik_balita,
    lingkar_lengan,
    lingkar_kepala,
    tinggi_badan,
    berat_badan,
    cara_ukur,
    vitamin_a,
    kms,
    imd,
    asi_eks,
    tanggal_perubahan,
  } = req.body;

  const sql = `
    INSERT INTO perkembangan_balita (
      nik_balita, lingkar_lengan, lingkar_kepala, tinggi_badan,
      berat_badan, cara_ukur, vitamin_a, kms, imd, asi_eks, tanggal_perubahan
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      nik_balita,
      lingkar_lengan,
      lingkar_kepala,
      tinggi_badan,
      berat_badan,
      cara_ukur,
      vitamin_a,
      kms,
      imd,
      asi_eks,
      tanggal_perubahan,
    ],
    (err) => {
      if (err) {
        console.error("Gagal menambah data perkembangan:", err);
        return res.status(500).json({ message: "Gagal menambahkan data perkembangan" });
      }
      res.status(201).json({ message: "Data perkembangan berhasil ditambahkan" });
    }
  );
};

// Ambil semua data perkembangan
export const getPerkembangan = (req, res) => {
  const sql = `
    SELECT p.*, b.nama_balita, b.jenis_kelamin, b.tanggal_lahir
    FROM perkembangan_balita p
    JOIN balita b ON p.nik_balita = b.nik_balita
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Gagal mengambil data:", err);
      return res.status(500).json({ message: "Gagal mengambil data perkembangan" });
    }
    res.status(200).json(results);
  });
};

// Ambil data berdasarkan NIK balita
export const getPerkembanganByNIK = (req, res) => {
  const nik = req.params.nik;
  const sql = `
    SELECT * FROM perkembangan_balita
    WHERE nik_balita = ?
    ORDER BY tanggal_perubahan DESC
  `;
  db.query(sql, [nik], (err, results) => {
    if (err) {
      console.error("Gagal mengambil data:", err);
      return res.status(500).json({ message: "Gagal mengambil data perkembangan" });
    }
    if (results.length === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    res.status(200).json(results);
  });
};

// Update data perkembangan
export const updatePerkembangan = (req, res) => {
  const id = req.params.id;
  const {
    lingkar_lengan,
    lingkar_kepala,
    tinggi_badan,
    berat_badan,
    cara_ukur,
    vitamin_a,
    kms,
    imd,
    asi_eks,
    tanggal_perubahan,
  } = req.body;

  const sql = `
    UPDATE perkembangan_balita SET
      lingkar_lengan=?, lingkar_kepala=?, tinggi_badan=?, berat_badan=?,
      cara_ukur=?, vitamin_a=?, kms=?, imd=?, asi_eks=?, tanggal_perubahan=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      lingkar_lengan,
      lingkar_kepala,
      tinggi_badan,
      berat_badan,
      cara_ukur,
      vitamin_a,
      kms,
      imd,
      asi_eks,
      tanggal_perubahan,
      id,
    ],
    (err) => {
      if (err) {
        console.error("Gagal memperbarui data:", err);
        return res.status(500).json({ message: "Gagal memperbarui data perkembangan" });
      }
      res.status(200).json({ message: "Data perkembangan berhasil diperbarui" });
    }
  );
};

// Hapus data perkembangan
export const deletePerkembangan = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM perkembangan_balita WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Gagal menghapus data:", err);
      return res.status(500).json({ message: "Gagal menghapus data perkembangan" });
    }
    res.status(200).json({ message: "Data perkembangan berhasil dihapus" });
  });
};

// STATISTIK PERKEMBANGAN + TOTAL JENIS KELAMIN
export const getStatistikPerkembangan = (req, res) => {
  // Query utama untuk menghitung status gizi berdasarkan jenis kelamin
  const sqlStatistik = `
    SELECT 
      b.jenis_kelamin, 
      p.kms AS status_gizi,
      COUNT(*) AS total
    FROM perkembangan_balita p
    JOIN balita b ON p.nik_balita = b.nik_balita
    GROUP BY b.jenis_kelamin, p.kms
  `;

  db.query(sqlStatistik, (err, statistikResults) => {
    if (err) {
      console.error("Gagal mengambil data statistik:", err);
      return res.status(500).json({ message: "Gagal mengambil data statistik perkembangan" });
    }

    // Query kedua untuk menghitung total laki-laki dan perempuan
    const sqlTotalJK = `
      SELECT jenis_kelamin, COUNT(*) AS total
      FROM balita
      GROUP BY jenis_kelamin
    `;

    db.query(sqlTotalJK, (err2, totalResults) => {
      if (err2) {
        console.error("Gagal mengambil total jenis kelamin:", err2);
        return res.status(500).json({ message: "Gagal mengambil total jenis kelamin" });
      }

      const totalLaki = totalResults.find(r => r.jenis_kelamin === "L")?.total || 0;
      const totalPerempuan = totalResults.find(r => r.jenis_kelamin === "P")?.total || 0;

      res.status(200).json({
        statistik_gizi: statistikResults,
        total_jenis_kelamin: {
          laki_laki: totalLaki,
          perempuan: totalPerempuan,
          total_semua: totalLaki + totalPerempuan
        }
      });
    });
  });
};
