const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const port = 3000;
const db = mysql
  .createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "nusantara_flix",
  })
  .promise(); // Mengaktifkan promise untuk penggunaan async/await
app.use(cors());
app.use(express.json());
// GET /api/media: Mengambil SEMUA movie
app.get("/api/media", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM media");
    res.status(200).json(rows); // 'rows' berisi data dari tabel
  } catch (error) {
    res.status(500).json({ message: "Kesalahan Server" });
  }
});
// GET /api/media/:id_media: Mengambil movie berdasarkan ID_media
app.get("/api/media/:id_media", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM media WHERE id_media = ?", [
      req.params.id_media,
    ]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: "media tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ message: "Kesalahan Server" });
  }
});
// POST /api/media: Membuat media baru
app.post("/api/media", async (req, res) => {
  const { judul, tahun_rilis, genre } = req.body;
  if (!judul || !tahun_rilis || !genre) {
    return res
      .status(400)
      .json({ message: "judul, genre dan tahun_rilis harus diisi" });
  }
  try {
    const sql =
      "INSERT INTO media (judul, tahun_rilis, genre) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [judul, tahun_rilis, genre]);
    const newMedia = { id_media: result.insertId, judul, tahun_rilis, genre };
    res.status(201).json(newMedia);
  } catch (error) {
    res.status(500).json({ message: "Kesalahan Server" });
  }
});

// PUT /api/media/:id_media: Memperbarui seluruh media
app.put("/api/media/:id_media", async (req, res) => {
  const id_media = req.params.id_media;
  const { judul, tahun_rilis, genre } = req.body;
  if (!judul || !tahun_rilis || !genre) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }
  try {
    const sql =
      "UPDATE media SET judul = ?, tahun_rilis = ?, genre = ? WHERE id_media = ?";
    const [result] = await db.query(sql, [judul, tahun_rilis, genre, id_media]);
    if (result.affectedRows === 0) {
      // Jika 0 baris terpengaruh, berarti ID tidak ditemukan
      return res
        .status(404)
        .json({ message: "media tidak ditemukan untuk diperbarui" });
    }
    const updatedMedia = {
      id_media: parseInt(id_media),
      judul,
      tahun_rilis,
      genre,
    };
    res.status(200).json(updatedMedia);
  } catch (error) {
    res.status(500).json({ message: "Kesalahan Server" });
  }
});
// DELETE /api/media/:id_media: Menghapus media
app.delete("/api/media/:id_media", async (req, res) => {
  const id_media = req.params.id_media;
  try {
    const [result] = await db.query("DELETE FROM media WHERE id_media = ?", [
      id_media,
    ]);
    if (result.affectedRows === 0) {
      // Jika 0 baris terpengaruh, berarti ID tidak ditemukan
      return res
        .status(404)
        .json({ message: "media tidak ditemukan untuk dihapus" });
    }
    // Status 204: No Content (Sukses, tanpa body respons)
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Kesalahan Server" });
  }
});
// --- Menjalankan Server ---
app.listen(port, () => {
  console.log(`Server REST API berjalan di http://localhost:${port}`);
});
//============================Selesai=======================================
