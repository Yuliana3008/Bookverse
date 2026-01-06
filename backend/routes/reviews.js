import express from "express";
import pool from "../config/db.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Groq from "groq-sdk";

const router = express.Router();

/* =========================================================
   CONFIGURACIÓN
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

// Inicializar Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* =========================================================
   ANÁLISIS CON GROQ
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

TAREA 1 - GÉNERO:
Identifica el género literario principal entre:
- Terror/Horror
- Romance
- Suspenso/Thriller
- Fantasía
- Ciencia Ficción
- Autoayuda
- Aventura
- Drama
- Histórico
- Biografía
- Humor
- General

Si detectas 2 géneros igual de prominentes, márcalo como híbrido.

TAREA 2 - SPOILERS:
Detecta si contiene SPOILERS que arruinen la experiencia:
- Revela el final o desenlace
- Menciona muertes importantes
- Revela identidades secretas
- Describe giros argumentales clave

NO son spoilers:
- Opiniones generales
- Descripciones vagas
- Recomendaciones generales

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
    
    // Formatear género
    let generoFinal;
    if (result.es_hibrido && result.genero_secundario) {
      generoFinal = `Híbrido: ${result.genero_principal} y ${result.genero_secundario}`;
    } else {
      generoFinal = result.genero_principal;
    }

    console.log(`✅ Groq Completado:`);
    console.log(`   📚 Género: ${generoFinal} (${result.confianza_genero}%)`);
    console.log(`   🚨 Spoiler: ${result.tiene_spoiler} (${result.confianza_spoiler}%)`);
    console.log(`   💬 Razón: ${result.razon_spoiler}`);

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
    
    // FALLBACK: Sistema local
    console.log("⚠️ Usando detección local como respaldo...");
    return {
      genre: detectGenreLocal(reviewText),
      isSpoiler: detectSpoilerLocal(reviewText),
      genreConfidence: 75,
      spoilerConfidence: 75,
      reason: "Análisis local (Groq no disponible)",
      keywords: []
    };
  }
}

/* =========================================================
   DETECCIÓN LOCAL (BACKUP)
========================================================= */
function detectSpoilerLocal(text) {
  if (!text) return false;
  
  const criticalPatterns = [
    /al final.*muere/i,
    /muere (al|en el|en la) final/i,
    /el (asesino|culpable|traidor) es/i,
    /resulta (que|ser)/i,
    /se revela que.*(es|era)/i,
    /spoiler alert/i,
  ];
  
  for (const pattern of criticalPatterns) {
    if (pattern.test(text)) {
      console.log(`🚨 [LOCAL] Spoiler: ${pattern.source}`);
      return true;
    }
  }
  
  console.log(`✅ [LOCAL] Sin spoilers`);
  return false;
}

function detectGenreLocal(text) {
  const lowerText = text.toLowerCase();
  
  const genres = [
    { name: "Terror", words: ["miedo", "sangre", "terror", "horror", "fantasma"] },
    { name: "Romance", words: ["amor", "beso", "romance", "pasión", "pareja"] },
    { name: "Fantasía", words: ["magia", "dragón", "espada", "reino", "héroe"] },
    { name: "Suspenso", words: ["misterio", "detective", "crimen", "secreto"] },
    { name: "Ciencia Ficción", words: ["espacio", "robot", "futuro", "nave", "tecnología"] },
  ];
  
  for (const genre of genres) {
    const matches = genre.words.filter(word => lowerText.includes(word)).length;
    if (matches >= 2) {
      console.log(`📚 [LOCAL] Género: ${genre.name}`);
      return genre.name;
    }
  }
  
  return "General";
}

/* =========================================================
   RUTAS
========================================================= */

// CREAR RESEÑA
router.post("/", upload.single("image"), async (req, res) => {
  const { usuarios_id, book_title, book_id, rating, review_text, author } = req.body;
  const image_url = req.file ? req.file.path : null;

  try {
    console.log("\n" + "=".repeat(70));
    console.log(`📖 NUEVA RESEÑA: "${book_title}" por ${author}`);
    console.log("=".repeat(70));

    // Verificar si Groq está configurado
    let analysis;
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_')) {
      analysis = await analyzeReviewWithGroq(review_text, book_title, author);
    } else {
      console.log("⚡ Groq no configurado, usando detección local");
      analysis = {
        genre: detectGenreLocal(review_text),
        isSpoiler: detectSpoilerLocal(review_text),
        genreConfidence: 75,
        spoilerConfidence: 75,
        reason: "Detección local",
        keywords: []
      };
    }

    const query = `
      INSERT INTO reviews (usuarios_id, book_title, book_id, rating, review_text, author, image_url, categoria_ia, is_spoiler)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    
    const result = await pool.query(query, [
      usuarios_id, book_title, book_id, rating, review_text, 
      author, image_url, analysis.genre, analysis.isSpoiler
    ]);
    
    console.log(`\n✅ GUARDADO | Género: ${analysis.genre} | Spoiler: ${analysis.isSpoiler}`);
    console.log("=".repeat(70) + "\n");
    
    res.status(201).json({
      ...result.rows[0],
      ai_analysis: {
        genre_confidence: analysis.genreConfidence,
        spoiler_confidence: analysis.spoilerConfidence,
        reason: analysis.reason
      }
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// BÚSQUEDA
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
    res.status(500).json({ error: "Error en búsqueda" });
  }
});

// OBTENER TODAS
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

// OBTENER POR ID
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

// ELIMINAR
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM reviews WHERE id = $1", [req.params.id]);
    res.json({ message: "Reseña eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;