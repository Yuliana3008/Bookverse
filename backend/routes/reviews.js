import express from "express";
import pool from "../config/db.js";
import multer from "multer";
import natural from "natural";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

/* =========================================================
   1. CONFIGURACIÓN DE CLOUDINARY (Subida Remota)
========================================================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bookverse_reviews",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
  },
});

const upload = multer({ storage });

/* =========================================================
   2. IA DE DETECCIÓN DE SPOILERS
========================================================= */
async function detectSpoilerWithIA(text) {
  if (!text) return false;
  try {
    const apiUrl = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `¿Esta reseña tiene spoilers del final? Responde solo SI o NO: "${text}"`,
        options: { wait_for_model: true }
      }),
    });
    const result = await response.json();
    const verdict = result[0]?.generated_text?.toUpperCase() || "";
    return verdict.includes("SI") || verdict.includes("SPOILER");
  } catch (error) {
    const spoilerKeywords = ["muere", "final", "asesino", "revela", "termina", "descubre", "traicion"];
    return spoilerKeywords.some((word) => text.toLowerCase().includes(word));
  }
}

/* =========================================================
   3. IA DE GÉNEROS (Scoring Ponderado)
========================================================= */
const classifier = new natural.BayesClassifier();
classifier.addDocument("miedo fantasma sangre muerte oscuro asesino terror aterrador horror", "Terror");
classifier.addDocument("amor beso enamorados corazón relación pareja romántico boda pasión", "Romance");
classifier.addDocument("crimen detective pista misterio secreto culpable investigación", "Suspenso");
classifier.addDocument("magia dragón espada reino rey héroe leyenda épico aventura", "Fantasía");
classifier.addDocument("nave espacio planeta alienígena robot tecnología galaxia", "Ciencia Ficción");
classifier.addDocument("superación bienestar hábito mentalidad motivación éxito resiliencia", "Autoayuda");
classifier.train();

function getEnhancedGenre(text) {
  const reglas = [
    { nombre: "Terror", regex: /miedo|sangre|asesin|terror|muert|fantasma/gi },
    { nombre: "Romance", regex: /amor|beso|pareja|romance|pasi[óo]n/gi },
    { nombre: "Suspenso", regex: /misterio|detective|crimen|secreto|intriga/gi },
    { nombre: "Fantasía", regex: /magia|drag[óo]n|espada|reino/gi },
    { nombre: "Ciencia Ficción", regex: /nave|espacio|robot|futuro|tecnolog[íi]a/gi },
    { nombre: "Autoayuda", regex: /superaci[óo]n|bienestar|motivaci[óo]n/gi },
  ];
  const aiScores = classifier.getClassifications(text.toLowerCase());
  const finalScores = aiScores.map(ai => {
    const regla = reglas.find(r => r.nombre === ai.label);
    const coincidencias = (text.match(regla.regex) || []).length;
    return { label: ai.label, score: ai.value + (coincidencias * 0.5) };
  }).sort((a, b) => b.score - a.score);

  const principal = finalScores[0];
  const secundario = finalScores[1];

  if (principal.score < 0.1) return "General";
  if (secundario && secundario.score > principal.score * 0.6) {
    return `Híbrido: ${principal.label} y ${secundario.label}`;
  }
  return principal.label;
}

/* =========================================================
   4. RUTAS
========================================================= */

router.post("/", upload.single("image"), async (req, res) => {
  const { usuarios_id, book_title, book_id, rating, review_text, author } = req.body;
  
  // AQUÍ ESTÁ EL CAMBIO: Ahora image_url será "https://res.cloudinary.com/..."
  const image_url = req.file ? req.file.path : null; 

  const categoriaFinal = getEnhancedGenre(review_text);
  const isSpoiler = await detectSpoilerWithIA(review_text);

  try {
    const query = `
      INSERT INTO reviews (usuarios_id, book_title, book_id, rating, review_text, author, image_url, categoria_ia, is_spoiler)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    const result = await pool.query(query, [usuarios_id, book_title, book_id, rating, review_text, author, image_url, categoriaFinal, isSpoiler]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RUTA DE BÚSQUEDA ---
router.get("/search", async (req, res) => {
  try {
    const { q, rating, genre, sort } = req.query;
    let query = `SELECT r.*, u.name AS user FROM reviews r JOIN usuarios u ON u.id = r.usuarios_id WHERE 1=1`;
    const values = [];

    if (q) {
      values.push(`%${q}%`);
      query += ` AND (r.book_title ILIKE $${values.length} OR r.author ILIKE $${values.length})`;
    }
    if (genre && genre !== "Todas") {
      values.push(`%${genre}%`);
      query += ` AND r.categoria_ia ILIKE $${values.length}`;
    }
    if (rating && rating !== "Todas") {
      values.push(parseInt(rating));
      query += ` AND r.rating = $${values.length}`;
    }
    query += sort === "asc" ? " ORDER BY r.created_at ASC" : " ORDER BY r.created_at DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en la búsqueda" });
  }
});

// --- OBTENER TODAS ---
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name AS user FROM reviews r 
      JOIN usuarios u ON u.id = r.usuarios_id 
      ORDER BY r.created_at DESC LIMIT 9;
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- OBTENER POR ID ---
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name FROM reviews r 
       JOIN usuarios u ON u.id = r.usuarios_id WHERE r.id = $1`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ELIMINAR ---
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM reviews WHERE id = $1", [req.params.id]);
    res.json({ message: "Reseña eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;