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

// STATISTIK PERKEMBANGAN (CONTROLLER LAMA)
// export const getStatistikPerkembangan = (req, res) => {
//   try {
//     const bulan = parseInt(req.query.bulan);
//     const tahun = parseInt(req.query.tahun) || null;

//     if (!bulan || bulan < 1 || bulan > 12) {
//       return res.status(400).json({ message: "Bulan tidak valid (1–12)" });
//     }

//     const sqlTahun = `SELECT YEAR(MAX(tanggal_perubahan)) AS tahun_terbaru FROM perkembangan_balita`;

//     db.query(sqlTahun, (err, result) => {
//       if (err) {
//         console.error("[ERROR] Gagal ambil tahun:", err);
//         return res.status(500).json({ message: "Gagal mengambil tahun terbaru" });
//       }

//       const tahunDipakai = tahun || result[0]?.tahun_terbaru;
//       if (!tahunDipakai) {
//         return res.status(404).json({ message: "Tidak ada data perkembangan" });
//       }

//       const sql = `
//         SELECT p.kms, b.jenis_kelamin
//         FROM perkembangan_balita p
//         JOIN balita b ON p.nik_balita = b.nik_balita
//         WHERE MONTH(p.tanggal_perubahan) = ? AND YEAR(p.tanggal_perubahan) = ?
//       `;

//       db.query(sql, [bulan, tahunDipakai], (err, results) => {
//         if (err) {
//           console.error("[ERROR] Query statistik:", err);
//           return res.status(500).json({ message: "Gagal mengambil data perkembangan" });
//         }

//         if (results.length === 0) {
//           return res.status(200).json({
//             bulan,
//             tahun: tahunDipakai,
//             normal: 0,
//             kurang: 0,
//             obesitas: 0,
//             total: 0,
//             total_laki: 0,
//             total_perempuan: 0,
//             laki_laki: { kurang: 0, normal: 0, obesitas: 0 },
//             perempuan: { kurang: 0, normal: 0, obesitas: 0 },
//           });
//         }

//         let normal = 0, kurang = 0, obesitas = 0;
//         let totalLaki = 0, totalPerempuan = 0;
//         const detailLaki = { kurang: 0, normal: 0, obesitas: 0 };
//         const detailPerempuan = { kurang: 0, normal: 0, obesitas: 0 };

//         results.forEach((r) => {
//           const kms = (r.kms || "").toLowerCase().trim();
//           let kategori = "";

//           if (kms === "merah") {
//             kategori = "kurang";
//             kurang++;
//           } else if (kms === "hijau") {
//             kategori = "normal";
//             normal++;
//           } else if (kms === "kuning") {
//             kategori = "obesitas";
//             obesitas++;
//           }

//           if (r.jenis_kelamin === "L") {
//             totalLaki++;
//             if (kategori) detailLaki[kategori]++;
//           } else if (r.jenis_kelamin === "P") {
//             totalPerempuan++;
//             if (kategori) detailPerempuan[kategori]++;
//           }
//         });

//         res.status(200).json({
//           bulan,
//           tahun: tahunDipakai,
//           normal,
//           kurang,
//           obesitas,
//           total: normal + kurang + obesitas,
//           total_laki: totalLaki,
//           total_perempuan: totalPerempuan,
//           laki_laki: detailLaki,
//           perempuan: detailPerempuan,
//         });
//       });
//     });
//   } catch (error) {
//     console.error("[ERROR] Statistik perkembangan:", error);
//     res.status(500).json({ message: "Terjadi kesalahan pada server" });
//   }
// };

// DATA STANDAR WHO 

const boysData = {
    0: [2.1, 2.5, 4.4, 5.0],
    1: [2.9, 3.4, 5.8, 6.6],
    2: [3.8, 4.3, 7.1, 8.0],
    3: [4.4, 5.0, 8.0, 9.0],
    4: [4.9, 5.6, 8.7, 9.7],
    5: [5.3, 6.0, 9.3, 10.4],
    6: [5.7, 6.4, 9.8, 10.9],
    7: [5.9, 6.7, 10.3, 11.4],
    8: [6.2, 6.9, 10.7, 11.9],
    9: [6.4, 7.1, 11.0, 12.3],
    10: [6.6, 7.4, 11.4, 12.7],
    11: [6.8, 7.6, 11.7, 13.0],
    12: [6.9, 7.7, 12.0, 13.3],
    13: [7.1, 7.9, 12.3, 13.7],
    14: [7.2, 8.1, 12.6, 14.0],
    15: [7.4, 8.3, 12.8, 14.3],
    16: [7.5, 8.4, 13.1, 14.6],
    17: [7.7, 8.6, 13.3, 14.9],
    18: [7.8, 8.8, 13.5, 15.1],
    19: [8.0, 8.9, 13.7, 15.4],
    20: [8.1, 9.1, 14.0, 15.6],
    21: [8.2, 9.2, 14.2, 15.9],
    22: [8.4, 9.4, 14.4, 16.2],
    23: [8.5, 9.5, 14.6, 16.4],
    24: [8.6, 9.7, 14.8, 16.6],
    25: [8.8, 9.8, 15.0, 16.9],
    26: [8.9, 10.0, 15.2, 17.1],
    27: [9.0, 10.1, 15.4, 17.3],
    28: [9.1, 10.2, 15.6, 17.5],
    29: [9.2, 10.4, 15.8, 17.8],
    30: [9.4, 10.5, 16.0, 18.0],
    31: [9.5, 10.7, 16.2, 18.2],
    32: [9.6, 10.8, 16.4, 18.4],
    33: [9.7, 10.9, 16.6, 18.6],
    34: [9.8, 11.0, 16.8, 18.8],
    35: [9.9, 11.2, 17.0, 19.0],
    36: [10.0, 11.3, 17.2, 19.3],
    37: [10.1, 11.4, 17.4, 19.5],
    38: [10.2, 11.5, 17.6, 19.7],
    39: [10.3, 11.6, 17.8, 19.9],
    40: [10.4, 11.8, 18.0, 20.2],
    41: [10.5, 11.9, 18.2, 20.4],
    42: [10.6, 12.0, 18.4, 20.6],
    43: [10.7, 12.1, 18.6, 20.9],
    44: [10.8, 12.2, 18.8, 21.1],
    45: [10.9, 12.4, 19.0, 21.3],
    46: [11.0, 12.5, 19.2, 21.6],
    47: [11.1, 12.6, 19.4, 21.8],
    48: [11.2, 12.7, 19.6, 22.0],
    49: [11.3, 12.8, 19.8, 22.3],
    50: [11.4, 12.9, 20.0, 22.5],
    51: [11.5, 13.1, 20.2, 22.7],
    52: [11.6, 13.2, 20.4, 23.0],
    53: [11.7, 13.3, 20.6, 23.2],
    54: [11.8, 13.4, 20.8, 23.5],
    55: [11.9, 13.5, 21.0, 23.7],
    56: [12.0, 13.6, 21.2, 24.0],
    57: [12.1, 13.7, 21.4, 24.2],
    58: [12.2, 13.8, 21.6, 24.5],
    59: [12.3, 14.0, 21.8, 24.7],
    60: [12.4, 14.1, 22.0, 25.0],
};

const girlsData = {
    0: [2.0, 2.4, 4.2, 4.8],
    1: [2.7, 3.2, 5.5, 6.2],
    2: [3.4, 3.9, 6.6, 7.5],
    3: [4.0, 4.5, 7.5, 8.5],
    4: [4.4, 5.0, 8.2, 9.3],
    5: [4.8, 5.4, 8.8, 9.9],
    6: [5.1, 5.7, 9.3, 10.5],
    7: [5.3, 6.0, 9.8, 11.0],
    8: [5.6, 6.3, 10.2, 11.5],
    9: [5.8, 6.5, 10.5, 11.9],
    10: [5.9, 6.7, 10.9, 12.4],
    11: [6.1, 6.9, 11.2, 12.7],
    12: [6.3, 7.0, 11.5, 13.0],
    13: [6.4, 7.2, 11.8, 13.3],
    14: [6.6, 7.4, 12.1, 13.6],
    15: [6.7, 7.6, 12.4, 13.9],
    16: [6.9, 7.7, 12.6, 14.2],
    17: [7.0, 7.9, 12.9, 14.5],
    18: [7.2, 8.1, 13.2, 14.8],
    19: [7.3, 8.2, 13.4, 15.1],
    20: [7.5, 8.4, 13.7, 15.4],
    21: [7.6, 8.6, 13.9, 15.7],
    22: [7.8, 8.7, 14.2, 16.0],
    23: [7.9, 8.9, 14.4, 16.3],
    24: [8.1, 9.0, 14.8, 16.6],
    25: [8.2, 9.2, 15.0, 16.9],
    26: [8.4, 9.4, 15.3, 17.2],
    27: [8.5, 9.5, 15.5, 17.5],
    28: [8.6, 9.7, 15.7, 17.8],
    29: [8.8, 9.8, 16.0, 18.1],
    30: [8.9, 10.0, 16.2, 18.3],
    31: [9.0, 10.1, 16.4, 18.6],
    32: [9.1, 10.3, 16.6, 18.9],
    33: [9.3, 10.4, 16.8, 19.1],
    34: [9.4, 10.5, 17.0, 19.4],
    35: [9.5, 10.7, 17.2, 19.6],
    36: [9.6, 10.8, 17.4, 19.9],
    37: [9.7, 10.9, 17.6, 20.1],
    38: [9.8, 11.1, 17.8, 20.4],
    39: [9.9, 11.2, 18.0, 20.6],
    40: [10.0, 11.3, 18.2, 20.9],
    41: [10.1, 11.5, 18.4, 21.1],
    42: [10.2, 11.6, 18.6, 21.4],
    43: [10.3, 11.7, 18.8, 21.6],
    44: [10.4, 11.8, 19.0, 21.9],
    45: [10.5, 12.0, 19.2, 22.1],
    46: [10.6, 12.1, 19.4, 22.4],
    47: [10.7, 12.2, 19.6, 22.6],
    48: [10.8, 12.3, 19.8, 22.9],
    49: [10.9, 12.4, 20.0, 23.1],
    50: [11.0, 12.6, 20.2, 23.4],
    51: [11.1, 12.7, 20.4, 23.6],
    52: [11.2, 12.8, 20.6, 23.9],
    53: [11.3, 12.9, 20.8, 24.1],
    54: [11.4, 13.0, 21.0, 24.4],
    55: [11.5, 13.2, 21.2, 24.6],
    56: [11.6, 13.3, 21.4, 24.9],
    57: [11.7, 13.4, 21.6, 25.1],
    58: [11.8, 13.5, 21.8, 25.4],
    59: [11.9, 13.6, 22.0, 25.6],
    60: [12.0, 13.7, 22.3, 25.9],
};

// Helper function untuk hitung umur bulan
const hitungUmurBulan = (tglLahir, tglUkur) => {
    const lahir = new Date(tglLahir);
    const ukur = new Date(tglUkur);

    let months = (ukur.getFullYear() - lahir.getFullYear()) * 12;
    months -= lahir.getMonth();
    months += ukur.getMonth();

    if (ukur.getDate() < lahir.getDate()) {
        months--;
    }
    return months < 0 ? 0 : months;
};

// CEK apakah balita sudah input perkembangan bulan ini
export const cekPerkembanganBulanIni = (req, res) => {
    try {
        const nik = req.query.nik;
        const bulan = parseInt(req.query.bulan);
        const tahun = parseInt(req.query.tahun);

        if (!nik || !bulan || !tahun) {
            return res.status(400).json({
                success: false,
                message: "Parameter nik, bulan, dan tahun diperlukan"
            });
        }

        const sql = `
      SELECT id 
      FROM perkembangan_balita
      WHERE nik_balita = ?
      AND MONTH(tanggal_perubahan) = ?
      AND YEAR(tanggal_perubahan) = ?
      LIMIT 1
    `;

        db.query(sql, [nik, bulan, tahun], (err, results) => {
            if (err) {
                console.error("[ERROR CEK PERKEMBANGAN]", err);
                return res.status(500).json({
                    success: false,
                    message: "Gagal mengecek data perkembangan"
                });
            }

            return res.status(200).json({
                success: true,
                sudah_input: results.length > 0
            });
        });

    } catch (error) {
        console.error("[ERROR CEK PERKEMBANGAN]", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server"
        });
    }
};

// Fungsi Klasifikasi Status Gizi
const getKategoriStatus = (berat, gender, umurBulan) => {
    const umurCheck = umurBulan > 60 ? 60 : umurBulan;
    const standards = (gender === 'L') ? boysData[umurCheck] : girlsData[umurCheck];

    const sdMin3 = standards[0];
    const sdMin2 = standards[1];
    const sdPlus2 = standards[2];
    const sdPlus3 = standards[3];

    if (berat < sdMin3) return "Merah_Buruk";
    if (berat >= sdMin3 && berat < sdMin2) return "Kuning_Kurang";
    if (berat >= sdMin2 && berat <= sdPlus2) return "Hijau";
    if (berat > sdPlus2 && berat <= sdPlus3) return "Kuning_Lebih";
    return "Merah_Obesitas";
};

// Fungsi Ranking untuk menentukan penurunan status
const getRank = (kategori) => {
    if (kategori === "Hijau") return 3;
    if (kategori.includes("Kuning")) return 2;
    if (kategori.includes("Merah")) return 1;
    return 3;
};

// Get Balita Perlu Diperhatikan
export const getBalitaPerluDiperhatikan = (req, res) => {
    try {
        const sql = `
      SELECT 
        b.nama_balita AS nama,
        b.nik_balita AS nik,
        b.jenis_kelamin,
        b.tanggal_lahir,
        p.berat_badan,
        p.tanggal_perubahan AS tanggal_terakhir,
        (
          SELECT p2.berat_badan 
          FROM perkembangan_balita p2
          WHERE p2.nik_balita = b.nik_balita
          ORDER BY p2.tanggal_perubahan DESC
          LIMIT 1 OFFSET 1
        ) AS berat_lalu,
        (
          SELECT p2.tanggal_perubahan
          FROM perkembangan_balita p2
          WHERE p2.nik_balita = b.nik_balita
          ORDER BY p2.tanggal_perubahan DESC
          LIMIT 1 OFFSET 1
        ) AS tanggal_lalu
      FROM balita b
      LEFT JOIN (
        SELECT p1.*
        FROM perkembangan_balita p1
        INNER JOIN (
          SELECT nik_balita, MAX(tanggal_perubahan) AS max_tanggal
          FROM perkembangan_balita
          GROUP BY nik_balita
        ) latest ON latest.nik_balita = p1.nik_balita 
                AND latest.max_tanggal = p1.tanggal_perubahan
      ) p ON p.nik_balita = b.nik_balita
      LEFT JOIN kelulusan_balita k ON k.nik_balita = b.nik_balita
      WHERE k.status IS NULL 
      ORDER BY p.tanggal_perubahan DESC;
    `;

        db.query(sql, (err, results) => {
            if (err) {
                console.error("[ERROR] getBalitaPerluDiperhatikan:", err);
                return res.status(500).json({
                    success: false,
                    message: "Gagal mengambil data balita perlu diperhatikan"
                });
            }

            const now = new Date();
            const bulanIni = now.getMonth() + 1;
            const tahunIni = now.getFullYear();

            const output = results.map((r) => {
                let prioritas = null;
                let alasan = null;
                let displayKMS = "Hijau";

                if (
                    !r.tanggal_terakhir ||
                    new Date(r.tanggal_terakhir).getMonth() + 1 !== bulanIni ||
                    new Date(r.tanggal_terakhir).getFullYear() !== tahunIni
                ) {
                    prioritas = 3;
                    alasan = "Belum diukur bulan ini";
                    displayKMS = "Abu-abu";
                } else {
                    const beratNow = parseFloat(r.berat_badan);
                    const umurNow = hitungUmurBulan(r.tanggal_lahir, r.tanggal_terakhir);
                    const statusNow = getKategoriStatus(beratNow, r.jenis_kelamin, umurNow);

                    if (statusNow === "Merah_Obesitas") {
                        prioritas = 1;
                        alasan = "Mengalami Obesitas (> +3 SD)";
                        displayKMS = "Merah";
                    } else if (statusNow === "Merah_Buruk") {
                        prioritas = 1;
                        alasan = "Gizi Buruk (< -3 SD)";
                        displayKMS = "Merah";
                    } else if (statusNow === "Kuning_Lebih") {
                        prioritas = 2;
                        alasan = "Risiko Gizi Lebih";
                        displayKMS = "Kuning";
                    } else if (statusNow === "Kuning_Kurang") {
                        prioritas = 2;
                        alasan = "Gizi Kurang";
                        displayKMS = "Kuning";
                    } else {
                        displayKMS = "Hijau";

                        if (r.berat_lalu && r.tanggal_lalu) {
                            const beratLalu = parseFloat(r.berat_lalu);
                            const umurLalu = hitungUmurBulan(r.tanggal_lahir, r.tanggal_lalu);
                            const statusLalu = getKategoriStatus(beratLalu, r.jenis_kelamin, umurLalu);

                            const rankNow = getRank(statusNow);
                            const rankLalu = getRank(statusLalu);

                            if (rankNow < rankLalu) {
                                prioritas = 4;
                                alasan = "Status gizi menurun dari bulan lalu";
                            }
                        }
                    }
                }

                return {
                    nama: r.nama,
                    nik: r.nik,
                    kms: displayKMS,
                    tanggal_terakhir: r.tanggal_terakhir,
                    prioritas,
                    alasan,
                };
            }).filter((d) => d.prioritas !== null);

            output.sort((a, b) => a.prioritas - b.prioritas);

            res.status(200).json({
                success: true,
                data: output
            });
        });

    } catch (error) {
        console.error("[ERROR getBalitaPerluDiperhatikan]", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server"
        });
    }
};


// Hitung SKDN
export const getSKDN = async (req, res) => {
    try {
        const bulan = parseInt(req.query.bulan);
        const tahun = parseInt(req.query.tahun);

        if (!bulan || !tahun) {
            return res.status(400).json({
                success: false,
                message: "Parameter bulan dan tahun diperlukan"
            });
        }

        // Helper untuk membungkus db.query ke dalam Promise agar bisa pakai async/await
        const query = (sql, params) => {
            return new Promise((resolve, reject) => {
                db.query(sql, params, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        };

        // 1. HITUNG S (Total Balita - Sasaran) — hanya yang BELUM LULUS
        const sqlS = `
            SELECT COUNT(*) AS S
            FROM balita b
            LEFT JOIN kelulusan_balita k ON k.nik_balita = b.nik_balita
            WHERE k.status IS NULL
        `;
        const resultS = await query(sqlS);
        const S = resultS[0].S;

        // 2. HITUNG K (Memiliki KMS)
        const sqlK = `
            SELECT COUNT(DISTINCT b.nik_balita) AS K_PERSISTEN
            FROM balita b
            LEFT JOIN kelulusan_balita k ON k.nik_balita = b.nik_balita
            INNER JOIN perkembangan_balita p ON b.nik_balita = p.nik_balita
            WHERE (p.kms = 'Ada' OR p.kms = 'ada')
            AND k.status IS NULL
        `;
        const resultK = await query(sqlK);
        const K = resultK[0].K_PERSISTEN;

        // 3. HITUNG D (Datang Ditimbang)
        const sqlD = `
            SELECT COUNT(DISTINCT p.nik_balita) AS D
            FROM perkembangan_balita p
            LEFT JOIN kelulusan_balita k ON k.nik_balita = p.nik_balita
            WHERE MONTH(p.tanggal_perubahan) = ?
            AND YEAR(p.tanggal_perubahan) = ?
            AND k.status IS NULL
        `;
        const resultD = await query(sqlD, [bulan, tahun]);
        const D = resultD[0].D;

        // 4. HITUNG N (Naik Berat Badan)
        const sqlN = `
            SELECT 
                p1.nik_balita,
                p1.berat_badan AS bb_sekarang,
                (
                    SELECT p2.berat_badan
                    FROM perkembangan_balita p2
                    WHERE p2.nik_balita = p1.nik_balita
                    AND p2.tanggal_perubahan < p1.tanggal_perubahan
                    ORDER BY p2.tanggal_perubahan DESC
                    LIMIT 1
                ) AS bb_lalu
            FROM perkembangan_balita p1
            LEFT JOIN kelulusan_balita k ON k.nik_balita = p1.nik_balita
            WHERE MONTH(p1.tanggal_perubahan) = ?
            AND YEAR(p1.tanggal_perubahan) = ?
            AND k.status IS NULL
        `;
        const resultN = await query(sqlN, [bulan, tahun]);
        const N = resultN.filter(r => r.bb_lalu !== null && r.bb_sekarang > r.bb_lalu).length;

        // 5. HITUNG JUMLAH LULUS PER BULAN (NEW)
        const sqlLulus = `
            SELECT COUNT(*) AS total_lulus
            FROM kelulusan_balita
            WHERE MONTH(tanggal_lulus) = ? 
            AND YEAR(tanggal_lulus) = ?
        `;
        const resultLulus = await query(sqlLulus, [bulan, tahun]);
        const jumlahLulus = resultLulus[0].total_lulus;

        // 6. HITUNG S YANG UMURNYA 36 BULAN (NEW)
        // Menggunakan logika: (TahunCek * 12 + BulanCek) - (TahunLahir * 12 + BulanLahir) = 36
        const sqlS36 = `
            SELECT COUNT(*) AS s_36
            FROM balita b
            LEFT JOIN kelulusan_balita k ON k.nik_balita = b.nik_balita
            WHERE k.status IS NULL
            AND ((? * 12 + ?) - (YEAR(b.tanggal_lahir) * 12 + MONTH(b.tanggal_lahir))) = 36
        `;
        const resultS36 = await query(sqlS36, [tahun, bulan]);
        const jumlahS36 = resultS36[0].s_36;

        // HITUNG PERSENTASE
        const K_S = S > 0 ? (K / S * 100).toFixed(2) : "0.00";
        const D_S = S > 0 ? (D / S * 100).toFixed(2) : "0.00";
        const N_D = D > 0 ? (N / D * 100).toFixed(2) : "0.00";
        const N_S = S > 0 ? (N / S * 100).toFixed(2) : "0.00"; // (NEW)

        return res.status(200).json({
            success: true,
            bulan,
            tahun,
            S,
            K,
            D,
            N,
            jumlah_lulus: jumlahLulus, // Data baru
            jumlah_s_36: jumlahS36,    // Data baru
            persentase: { 
                K_S, 
                D_S, 
                N_D,
                N_S // Data baru
            }
        });

    } catch (error) {
        console.error("[ERROR SKDN]", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server: " + error.message
        });
    }
};


// STATISTIK PERKEMBANGAN (AKTIF)
export const getStatistikPerkembangan = (req, res) => {
    try {
        const bulan = parseInt(req.query.bulan);
        const tahun = parseInt(req.query.tahun) || null;

        if (!bulan || bulan < 1 || bulan > 12) {
            return res.status(400).json({ message: "Bulan tidak valid (1–12)" });
        }

        const sqlTahun = `
            SELECT YEAR(MAX(tanggal_perubahan)) AS tahun_terbaru 
            FROM perkembangan_balita
        `;

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
                SELECT 
                    p.berat_badan,
                    p.tanggal_perubahan,
                    b.jenis_kelamin,
                    b.tanggal_lahir
                FROM perkembangan_balita p
                JOIN balita b ON p.nik_balita = b.nik_balita
                LEFT JOIN kelulusan_balita k ON k.nik_balita = b.nik_balita
                WHERE MONTH(p.tanggal_perubahan) = ?
                AND YEAR(p.tanggal_perubahan) = ?
                AND k.status IS NULL
            `;

            db.query(sql, [bulan, tahunDipakai], (err, results) => {
                if (err) {
                    console.error("[ERROR] Query statistik:", err);
                    return res.status(500).json({ message: "Gagal mengambil data perkembangan" });
                }

                let buruk = 0, kurang = 0, normal = 0, lebih = 0, obesitas = 0;
                let totalLaki = 0, totalPerempuan = 0;

                const detailLaki = { buruk: 0, kurang: 0, normal: 0, lebih: 0, obesitas: 0 };
                const detailPerempuan = { buruk: 0, kurang: 0, normal: 0, lebih: 0, obesitas: 0 };

                if (results.length > 0) {
                    results.forEach((r) => {
                        const berat = parseFloat(r.berat_badan);
                        const gender = r.jenis_kelamin;
                        const umurBulan = hitungUmurBulan(r.tanggal_lahir, r.tanggal_perubahan);
                        const umurCheck = umurBulan > 60 ? 60 : umurBulan;

                        const standards = (gender === 'L') ? boysData[umurCheck] : girlsData[umurCheck];
                        const sdMin3 = standards[0];
                        const sdMin2 = standards[1];
                        const sdPlus2 = standards[2];
                        const sdPlus3 = standards[3];

                        let kategori = "";

                        if (berat < sdMin3) {
                            kategori = "buruk";
                            buruk++;
                        } else if (berat >= sdMin3 && berat < sdMin2) {
                            kategori = "kurang";
                            kurang++;
                        } else if (berat >= sdMin2 && berat <= sdPlus2) {
                            kategori = "normal";
                            normal++;
                        } else if (berat > sdPlus2 && berat <= sdPlus3) {
                            kategori = "lebih";
                            lebih++;
                        } else {
                            kategori = "obesitas";
                            obesitas++;
                        }

                        if (gender === "L") {
                            totalLaki++;
                            detailLaki[kategori]++;
                        } else if (gender === "P") {
                            totalPerempuan++;
                            detailPerempuan[kategori]++;
                        }
                    });
                }

                res.status(200).json({
                    bulan,
                    tahun: tahunDipakai,
                    buruk,
                    kurang,
                    normal,
                    lebih,
                    obesitas,
                    total: results.length,
                    total_laki: totalLaki,
                    total_perempuan: totalPerempuan,
                    laki_laki: detailLaki,
                    perempuan: detailPerempuan
                });
            });
        });

    } catch (error) {
        console.error("[ERROR] Statistik perkembangan:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

// GET LIST BALITA BY KATEGORI
export const getListBalitaByKategori = (req, res) => {
    try {
        const bulan = parseInt(req.query.bulan);
        const tahun = parseInt(req.query.tahun);
        const kategoriDicari = req.query.kategori; 

        if (!bulan || !tahun || !kategoriDicari) {
            return res.status(400).json({ message: "Parameter bulan, tahun, dan kategori diperlukan" });
        }

        const sql = `
            SELECT 
                p.berat_badan,
                p.tinggi_badan,
                p.tanggal_perubahan,
                b.nama_balita,
                b.nik_balita,
                b.jenis_kelamin,
                b.tanggal_lahir,
                b.nama_ortu,
                b.alamat
            FROM perkembangan_balita p
            JOIN balita b ON p.nik_balita = b.nik_balita
            LEFT JOIN kelulusan_balita k ON k.nik_balita = b.nik_balita
            WHERE MONTH(p.tanggal_perubahan) = ?
            AND YEAR(p.tanggal_perubahan) = ?
            AND k.status IS NULL
            ORDER BY b.nama_balita ASC
        `;

        db.query(sql, [bulan, tahun], (err, results) => {
            if (err) {
                console.error("[ERROR] Query detail kategori:", err);
                return res.status(500).json({ message: "Gagal mengambil data" });
            }

            const filteredData = [];

            results.forEach((r) => {
                const berat = parseFloat(r.berat_badan);
                const gender = r.jenis_kelamin;
                const umurBulan = hitungUmurBulan(r.tanggal_lahir, r.tanggal_perubahan);
                const umurCheck = umurBulan > 60 ? 60 : umurBulan;

                const standards = (gender === 'L') ? boysData[umurCheck] : girlsData[umurCheck];
                const sdMin3 = standards[0];
                const sdMin2 = standards[1];
                const sdPlus2 = standards[2];
                const sdPlus3 = standards[3];

                let kategori = "";

                if (berat < sdMin3) {
                    kategori = "buruk";
                } else if (berat >= sdMin3 && berat < sdMin2) {
                    kategori = "kurang";
                } else if (berat >= sdMin2 && berat <= sdPlus2) {
                    kategori = "normal";
                } else if (berat > sdPlus2 && berat <= sdPlus3) {
                    kategori = "lebih";
                } else {
                    kategori = "obesitas";
                }

                if (kategori === kategoriDicari.toLowerCase()) {
                    filteredData.push({
                        nama_balita: r.nama_balita,
                        nik_balita: r.nik_balita,
                        jenis_kelamin: r.jenis_kelamin,
                        tanggal_lahir: r.tanggal_lahir,
                        umur_bulan: umurBulan,
                        berat_badan: berat,
                        tinggi_badan: r.tinggi_badan,
                        nama_ortu: r.nama_ortu,
                        alamat: r.alamat,
                        kategori_gizi: kategori
                    });
                }
            });

            res.status(200).json({
                success: true,
                data: filteredData
            });
        });

    } catch (error) {
        console.error("[ERROR] Statistik detail:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};
