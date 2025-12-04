import db from "../db.js";

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split("T")[0];
};

export const getLaporanPerkembangan = (req, res) => {
  const { nik_balita } = req.params;

  const query = `
    SELECT 
      b.nik_balita,
      b.nama_balita,
      b.jenis_kelamin,
      b.tanggal_lahir,
      b.anak_ke_berapa,
      b.nomor_kk,
      b.nama_ortu,
      b.nik_ortu,
      b.nomor_telp_ortu,
      b.alamat,
      b.rt,
      b.rw,
      b.created_at AS tanggal_input_balita,
      pb.id AS id_perkembangan,
      pb.lingkar_lengan,
      pb.lingkar_kepala,
      pb.tinggi_badan,
      pb.berat_badan,
      pb.cara_ukur,
      pb.vitamin_a,
      pb.kms,
      pb.imd,
      pb.asi_eks,
      pb.tanggal_perubahan,
      pb.created_at AS tanggal_input_perkembangan
    FROM balita b
    LEFT JOIN perkembangan_balita pb 
      ON b.nik_balita = pb.nik_balita
    WHERE b.nik_balita = ?
    ORDER BY pb.tanggal_perubahan ASC
  `;

  db.query(query, [nik_balita], (err, result) => {
    if (err) {
      console.error("Gagal mengambil data laporan:", err);
      return res.status(500).json({ message: "Gagal mengambil data laporan" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Data balita tidak ditemukan" });
    }

    const balita = {
      nik_balita: result[0].nik_balita,
      nama_balita: result[0].nama_balita,
      jenis_kelamin: result[0].jenis_kelamin,
      tanggal_lahir: formatDate(result[0].tanggal_lahir),
      anak_ke_berapa: result[0].anak_ke_berapa,
      nomor_kk: result[0].nomor_kk,
      nama_ortu: result[0].nama_ortu,
      nik_ortu: result[0].nik_ortu,
      nomor_telp_ortu: result[0].nomor_telp_ortu,
      alamat: result[0].alamat,
      rt: result[0].rt,
      rw: result[0].rw,
      tanggal_input_balita: formatDate(result[0].tanggal_input_balita),
    };

    const perkembangan = result
      .filter((r) => r.id_perkembangan)
      .map((r) => ({
        id_perkembangan: r.id_perkembangan,
        lingkar_lengan: r.lingkar_lengan,
        lingkar_kepala: r.lingkar_kepala,
        tinggi_badan: r.tinggi_badan,
        berat_badan: r.berat_badan,
        cara_ukur: r.cara_ukur,
        vitamin_a: r.vitamin_a,
        kms: r.kms,
        imd: r.imd,
        asi_eks: r.asi_eks,
        tanggal_perubahan: formatDate(r.tanggal_perubahan),
        tanggal_input_perkembangan: formatDate(r.tanggal_input_perkembangan),
      }));

    res.status(200).json({
      message: "Laporan lengkap balita dan perkembangan berhasil diambil",
      balita,
      perkembangan,
    });
  });
};

//Detail perkembangan bulanan untuk PDF
export const getDetailPerkembangan = (req, res) => {
  try {
    const bulan = parseInt(req.query.bulan);
    const tahun = parseInt(req.query.tahun);

    if (!bulan || bulan < 1 || bulan > 12) {
      return res.status(400).json({ message: "Bulan tidak valid (1–12)" });
    }

    const semesterStart = bulan <= 6 ? 1 : 7;
    const semesterEnd = bulan <= 6 ? 6 : 12;

    const sql = `
      SELECT
        b.nik_balita AS nik,
        b.nama_balita AS nama,
        b.jenis_kelamin,
        b.tanggal_lahir,
        b.anak_ke_berapa,
        b.nama_ortu,
        b.nik_ortu,
        b.nomor_telp_ortu,
        b.alamat,
        b.rt,
        b.rw,

        MONTH(p.tanggal_perubahan) AS bulan,
        p.lingkar_lengan,
        p.lingkar_kepala,
        p.tinggi_badan,
        p.berat_badan

      FROM perkembangan_balita p
      JOIN balita b ON p.nik_balita = b.nik_balita
      WHERE YEAR(p.tanggal_perubahan) = ?
      AND MONTH(p.tanggal_perubahan) BETWEEN ? AND ?
      ORDER BY b.nama_balita ASC
    `;

    db.query(sql, [tahun, semesterStart, semesterEnd], (err, results) => {
      if (err) {
        console.error("[ERROR]", err);
        return res.status(500).json({ message: "Gagal mengambil data" });
      }

      const grouped = {};

      results.forEach(row => {
        if (!grouped[row.nik]) {
          grouped[row.nik] = {
            nik: row.nik,
            nama: row.nama,
            jenis_kelamin: row.jenis_kelamin === 'L' ? "Laki-laki" : "Perempuan",
            tanggal_lahir: row.tanggal_lahir,
            anak_ke: row.anak_ke_berapa,
            nama_ortu: row.nama_ortu,
            nik_ortu: row.nik_ortu,
            nomor_hp_ortu: row.nomor_telp_ortu,
            alamat: row.alamat,
            rt: row.rt,
            rw: row.rw,
            bulan: {}
          };
        }

        grouped[row.nik].bulan[row.bulan] = {
          ll: parseFloat(row.lingkar_lengan),
          lk: parseFloat(row.lingkar_kepala),
          tb: parseFloat(row.tinggi_badan),
          bb: parseFloat(row.berat_badan),
        };
      });

      return res.status(200).json({
        success: true,
        tahun,
        bulan_mulai: semesterStart,
        bulan_selesai: semesterEnd,
        data: Object.values(grouped)
      });
    });

  } catch (error) {
    console.error("[ERROR] Semester perkembangan:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server"
    });
  }
};

// LAPORAN KHUSUS (FEB & AGUSTUS)
export const getLaporanKhusus = (req, res) => {
  try {
    const bulan = parseInt(req.query.bulan);
    const tahun = parseInt(req.query.tahun);

    // Hanya Februari (2) dan Agustus (8)
    if (![2, 8].includes(bulan)) {
      return res.status(400).json({
        message: "Laporan khusus hanya tersedia untuk bulan Februari dan Agustus"
      });
    }

    const sql = `
      SELECT
        b.nik_balita AS nik,
        b.nomor_kk AS no_kk,
        b.nama_balita AS nama,
        b.jenis_kelamin,
        b.tanggal_lahir,
        b.anak_ke_berapa,
        b.nama_ortu,
        b.nik_ortu,
        b.nomor_telp_ortu,
        b.alamat,
        b.rt,
        b.rw,

        b.bb_lahir,     
        b.tb_lahir,     

        p.berat_badan AS bb_bulan_ini,
        p.tinggi_badan AS tb_bulan_ini,
        p.cara_ukur,
        p.kms,
        p.imd,
        p.asi_eks,
        p.vitamin_a

      FROM balita b
      LEFT JOIN perkembangan_balita p
        ON b.nik_balita = p.nik_balita
        AND MONTH(p.tanggal_perubahan) = ?
        AND YEAR(p.tanggal_perubahan) = ?

      ORDER BY b.nama_balita ASC
    `;

    db.query(sql, [bulan, tahun], (err, results) => {
      if (err) {
        console.error("[ERROR LAPORAN KHUSUS]", err);
        return res.status(500).json({
          message: "Gagal mengambil data laporan khusus"
        });
      }

      return res.status(200).json({
        success: true,
        bulan,
        tahun,
        data: results
      });
    });

  } catch (error) {
    console.error("[ERROR LAPORAN KHUSUS]", error);
    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};
