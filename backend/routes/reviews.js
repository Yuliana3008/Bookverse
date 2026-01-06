import express from "express";
import pool from "../config/db.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Groq from "groq-sdk";

const router = express.Router();

/* =========================================================
   1. CONFIGURACIÓN DE SERVICIOS (CLOUDINARY & GROQ)
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

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* =========================================================
   2. LÓGICA DE ANÁLISIS CON GROQ AI
========================================================= */
async function analyzeReviewWithGroq(reviewText, bookTitle, bookAuthor) {
  try {
    console.log("🤖 Consultando Groq AI...");
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Eres un experto bibliotecario y crítico literario. Analizas reseñas de libros para detectar el género y spoilers. Respondes SOLO en formato JSON válido."
        },
        {
          role: "user",
          content: `Analiza esta reseña de libro:
          LIBRO: "${bookTitle}" por ${bookAuthor}
          RESEÑA: "${reviewText}"
          Responde en este formato JSON EXACTO:
          {
            "genero_principal": "nombre del género",
            "genero_secundario": "nombre o null",
            "es_hibrido": true/false,
            "tiene_spoiler": true/false,
            "confianza_genero": 0-100,
            "confianza_spoiler": 0-100,
            "razon_spoiler": "explicación breve",
            "keywords": ["palabra1", "palabra2"]
          }`
        }
      ],
      temperature: 0.3,
      max_tokens: 400,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    let generoFinal = result.es_hibrido && result.genero_secundario 
      ? `Híbrido: ${result.genero_principal} y ${result.genero_secundario}` 
      : result.genero_principal;

    return {
      genre: generoFinal,
      isSpoiler: result.tiene_spoiler,
      genreConfidence: result.confianza_genero,
      spoilerConfidence: result.confianza_spoiler,
      reason: result.razon_spoiler,
      keywords: result.keywords || []
    };

  } catch (error) {
    console.error("❌ Error en Groq:", error.message);
    return {
      genre: detectGenreLocal(reviewText),
      isSpoiler: detectSpoilerLocal(reviewText),
      genreConfidence: 75,
      spoilerConfidence: 75,
      reason: "Análisis local (Backup)",
      keywords: []
    };
  }
}

/* =========================================================
   3. DETECCIÓN LOCAL (BACKUP / FALLBACK)
========================================================= */
function detectSpoilerLocal(text) {
  if (!text) return false;
  const criticalPatterns = [/al final.*muere/i, /el asesino es/i, /spoiler alert/i, /muere al final/i];
  return criticalPatterns.some(pattern => pattern.test(text));
}

function detectGenreLocal(text) {
  const lowerText = text.toLowerCase();
  const genres = [
    { name: "Terror", words: ["miedo", "terror", "fantasma", "sangre"] },
    { name: "Romance", words: ["amor", "pareja", "beso", "pasión"] },
    { name: "Fantasía", words: ["magia", "dragón", "espada", "reino"] },
    { name: "Suspenso", words: ["misterio", "crimen", "detective"] }
  ];
  for (const genre of genres) {
    if (genre.words.filter(word => lowerText.includes(word)).length >= 2) return genre.name;
  }
  return "General";
}

/* =========================================================
   4. RUTAS DE RESEÑAS
========================================================= */

// CREAR RESEÑA
router.post("/", upload.single("image"), async (req, res) => {
  const { usuarios_id, book_title, book_id, rating, review_text, author } = req.body;
  const image_url = req.file ? req.file.path : null;

  try {
    let analysis;
    if (process.env.GROQ_API_KEY?.startsWith('gsk_')) {
      analysis = await analyzeReviewWithGroq(review_text, book_title, author);
    } else {
      analysis = { genre: detectGenreLocal(review_text), isSpoiler: detectSpoilerLocal(review_text) };
    }

    const query = `
      INSERT INTO reviews (usuarios_id, book_title, book_id, rating, review_text, author, image_url, categoria_ia, is_spoiler)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    const result = await pool.query(query, [usuarios_id, book_title, book_id, rating, review_text, author, image_url, analysis.genre, analysis.isSpoiler]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OBTENER POR ID
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name FROM reviews r JOIN usuarios u ON u.id = r.usuarios_id WHERE r.id = $1`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- EDITAR CRÓNICA (RESEÑA PRINCIPAL) ---
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { review_text, rating, book_title, author } = req.body;

    const result = await pool.query(
      `UPDATE reviews 
       SET review_text = $1, rating = $2, book_title = $3, author = $4 
       WHERE id = $5 RETURNING *`,
      [review_text, rating, book_title, author, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Reseña no encontrada" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ELIMINAR RESEÑA Y COMENTARIOS ASOCIADOS ---
router.delete("/full/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Primero borramos los comentarios por integridad de la base de datos
    await pool.query("DELETE FROM comments WHERE review_id = $1", [id]);
    
    // Luego borramos la reseña
    const result = await pool.query("DELETE FROM reviews WHERE id = $1 RETURNING id", [id]);

    if (result.rowCount === 0) return res.status(404).json({ error: "Reseña no encontrada" });
    res.json({ message: "Crónica eliminada correctamente", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
   5. RUTAS DE COMENTARIOS (CRUD COMPLETO)
========================================================= */

// OBTENER COMENTARIOS DE UNA RESEÑA
router.get("/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.id, c.comment_text AS text, c.created_at, c.usuarios_id, u.name AS user_name 
       FROM comments c 
       JOIN usuarios u ON c.usuarios_id = u.id 
       WHERE c.review_id = $1 
       ORDER BY c.created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener comentarios:", error.message);
    res.status(500).json({ error: "Error al obtener comentarios" });
  }
});

// CREAR COMENTARIO
router.post("/:id/comments", async (req, res) => {
  try {
    const { id } = req.params; 
    const { text, usuarios_id } = req.body; 

    if (!text || !usuarios_id) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const insertResult = await pool.query(
      `INSERT INTO comments (review_id, comment_text, usuarios_id, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING id`,
      [id, text, usuarios_id]
    );
    
    const finalResult = await pool.query(
      `SELECT c.id, c.comment_text AS text, c.created_at, c.usuarios_id, u.name AS user_name 
       FROM comments c 
       JOIN usuarios u ON c.usuarios_id = u.id 
       WHERE c.id = $1`,
      [insertResult.rows[0].id]
    );

    res.status(201).json(finalResult.rows[0]);
  } catch (error) {
    console.error("❌ Error al guardar comentario:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GUARDAR EDICIÓN DE COMENTARIO 
router.post("/comments/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: "El texto es requerido" });

    const result = await pool.query(
      `UPDATE comments 
       SET comment_text = $1 
       WHERE id = $2 
       RETURNING id, comment_text AS text, created_at, usuarios_id`,
      [text, commentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al editar comentario:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ELIMINAR COMENTARIO
router.delete("/comments/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const result = await pool.query("DELETE FROM comments WHERE id = $1 RETURNING id", [commentId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    res.json({ message: "Comentario eliminado correctamente", id: commentId });
  } catch (error) {
    console.error("❌ Error al eliminar comentario:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
   6. OTRAS RUTAS (BÚSQUEDA, LISTADO)
========================================================= */

// BUSCADOR
router.get("/search", async (req, res) => {
  try {
    const { q, genre, sort } = req.query;
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
    query += sort === "asc" ? " ORDER BY r.created_at ASC" : " ORDER BY r.created_at DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en búsqueda" });
  }
});

// FEED GLOBAL
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

export default router;