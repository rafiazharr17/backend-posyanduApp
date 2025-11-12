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
