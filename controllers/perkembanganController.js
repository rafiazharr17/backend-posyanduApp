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
  try {
    const bulan = parseInt(req.query.bulan);
    const tahun = parseInt(req.query.tahun) || null;

    if (!bulan || bulan < 1 || bulan > 12) {
      return res.status(400).json({ message: "Bulan tidak valid (1–12)" });
    }

    const sqlTahun = `SELECT YEAR(MAX(tanggal_perubahan)) AS tahun_terbaru FROM perkembangan_balita`;

    db.query(sqlTahun, (err, result) => {
      if (err) {
        console.error("[ERROR] Gagal ambil tahun:", err);
        return res.status(500).json({ message: "Gagal mengambil tahun terbaru" });
      }

      const tahunDipakai = tahun || result[0]?.tahun_terbaru;
      if (!tahunDipakai) {
        return res.status(404).json({ message: "Tidak ada data perkembangan" });
      }

      const sql = `
        SELECT p.kms, b.jenis_kelamin
        FROM perkembangan_balita p
        JOIN balita b ON p.nik_balita = b.nik_balita
        WHERE MONTH(p.tanggal_perubahan) = ? AND YEAR(p.tanggal_perubahan) = ?
      `;

      db.query(sql, [bulan, tahunDipakai], (err, results) => {
        if (err) {
          console.error("[ERROR] Query statistik:", err);
          return res.status(500).json({ message: "Gagal mengambil data perkembangan" });
        }

        if (results.length === 0) {
          return res.status(200).json({
            bulan,
            tahun: tahunDipakai,
            normal: 0,
            kurang: 0,
            obesitas: 0,
            total: 0,
            total_laki: 0,
            total_perempuan: 0,
            laki_laki: { kurang: 0, normal: 0, obesitas: 0 },
            perempuan: { kurang: 0, normal: 0, obesitas: 0 },
          });
        }

        let normal = 0, kurang = 0, obesitas = 0;
        let totalLaki = 0, totalPerempuan = 0;
        const detailLaki = { kurang: 0, normal: 0, obesitas: 0 };
        const detailPerempuan = { kurang: 0, normal: 0, obesitas: 0 };

        results.forEach((r) => {
          const kms = (r.kms || "").toLowerCase().trim();
          let kategori = "";

          if (kms === "merah") {
            kategori = "kurang";
            kurang++;
          } else if (kms === "hijau") {
            kategori = "normal";
            normal++;
          } else if (kms === "kuning") {
            kategori = "obesitas";
            obesitas++;
          }

          if (r.jenis_kelamin === "L") {
            totalLaki++;
            if (kategori) detailLaki[kategori]++;
          } else if (r.jenis_kelamin === "P") {
            totalPerempuan++;
            if (kategori) detailPerempuan[kategori]++;
          }
        });

        res.status(200).json({
          bulan,
          tahun: tahunDipakai,
          normal,
          kurang,
          obesitas,
          total: normal + kurang + obesitas,
          total_laki: totalLaki,
          total_perempuan: totalPerempuan,
          laki_laki: detailLaki,
          perempuan: detailPerempuan,
        });
      });
    });
  } catch (error) {
    console.error("[ERROR] Statistik perkembangan:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};