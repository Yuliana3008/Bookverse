import express from "express";
import pool from "../config/db.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Groq from "groq-sdk";

const router = express.Router();

/* =========================================================
    1. CONFIGURACIÓN DE MIDDLEWARES Y CLIENTES
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
    3. RUTAS DE BÚSQUEDA Y FILTRADO (LA CLAVE)
========================================================= */

// BÚSQUEDA AVANZADA (Para SearchPage.jsx)
router.get("/search", async (req, res) => {
  try {
    const { q, genre, rating, sort } = req.query;
    
    // Importante: u.name AS name para que el frontend lo reconozca
    let query = `
      SELECT r.*, u.name AS name 
      FROM reviews r 
      JOIN usuarios u ON u.id = r.usuarios_id 
      WHERE 1=1
    `;
    const values = [];

    // Búsqueda por texto (Título, Autor o Reseña)
    if (q && q.trim() !== "") {
      values.push(`%${q}%`);
      query += ` AND (r.book_title ILIKE $${values.length} OR r.author ILIKE $${values.length} OR r.review_text ILIKE $${values.length})`;
    }

    // Filtro por Género IA
    if (genre && genre !== "" && genre !== "Todas") {
      values.push(`%${genre}%`);
      query += ` AND r.categoria_ia ILIKE $${values.length}`;
    }

    // Filtro por Calificación (Rating)
    if (rating && rating !== "") {
      values.push(parseInt(rating));
      query += ` AND r.rating = $${values.length}`;
    }

    // Ordenamiento
    query += sort === "asc" ? " ORDER BY r.created_at ASC" : " ORDER BY r.created_at DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error en ruta /search:", error.message);
    res.status(500).json({ error: "Error interno al buscar en el catálogo" });
  }
});

/* =========================================================
    4. RUTAS CRUD DE RESEÑAS
========================================================= */

// OBTENER TODAS (O ÚLTIMAS 9)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name AS name FROM reviews r 
      JOIN usuarios u ON u.id = r.usuarios_id 
      ORDER BY r.created_at DESC LIMIT 9;
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OBTENER RESEÑAS DE UN USUARIO ESPECÍFICO
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT r.*, u.name AS name 
       FROM reviews r 
       JOIN usuarios u ON u.id = r.usuarios_id 
       WHERE r.usuarios_id = $1 
       ORDER BY r.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reseñas del usuario" });
  }
});

// OBTENER UNA SOLA POR ID
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name FROM reviews r JOIN usuarios u ON u.id = r.usuarios_id WHERE r.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Reseña no hallada" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREAR NUEVA RESEÑA
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

// EDITAR RESEÑA
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

// ELIMINAR RESEÑA COMPLETA
router.delete("/full/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM comments WHERE review_id = $1", [id]);
    const result = await pool.query("DELETE FROM reviews WHERE id = $1 RETURNING id", [id]);

    if (result.rowCount === 0) return res.status(404).json({ error: "Reseña no encontrada" });
    res.json({ message: "Crónica eliminada correctamente", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
    5. RUTAS DE COMENTARIOS
========================================================= */

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
    res.status(500).json({ error: "Error al obtener comentarios" });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const { id } = req.params; 
    const { text, usuarios_id } = req.body; 

    if (!text || !usuarios_id) return res.status(400).json({ error: "Faltan datos" });

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
    res.status(500).json({ error: error.message });
  }
});

router.delete("/comments/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const result = await pool.query("DELETE FROM comments WHERE id = $1 RETURNING id", [commentId]);
    if (result.rowCount === 0) return res.status(404).json({ error: "No existe" });
    res.json({ message: "Eliminado", id: commentId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/* =========================================================
    6. RUTA DE RECOMENDACIONES CON IA
    Agregar ANTES de: export default router;
========================================================= */

router.post("/recommend", async (req, res) => {
  try {
    const { userDescription } = req.body;

    if (!userDescription) {
      return res.status(400).json({ error: 'Se requiere una descripción' });
    }

    console.log("🔍 Buscando recomendaciones para:", userDescription);

    // 1. Obtener recomendaciones de Groq
    const prompt = `Eres un experto en literatura. Un usuario busca un libro con estas características:

"${userDescription}"

Recomienda EXACTAMENTE 2 libros que coincidan con esta descripción. 
Responde ÚNICAMENTE en formato JSON sin texto adicional:
{
  "libros": [
    {
      "titulo": "Título exacto del libro",
      "autor": "Nombre del autor",
      "isbn": "ISBN si lo conoces, sino null",
      "genero": "Género literario",
      "anio": año de publicación,
      "razon": "Breve explicación de por qué este libro coincide (máximo 100 palabras)"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un bibliotecario experto que recomienda libros. Respondes únicamente en formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    let recomendaciones;
    try {
      recomendaciones = JSON.parse(completion.choices[0]?.message?.content || '{}');
      console.log("✅ Recomendaciones obtenidas:", recomendaciones);
    } catch (parseError) {
      console.error('❌ Error parseando JSON de Groq:', parseError);
      return res.status(500).json({ error: 'Error procesando la respuesta de la IA' });
    }

    // 2. Verificar si los libros están en la BD
    const librosConInfo = await Promise.all(
      recomendaciones.libros.map(async (libro) => {
        try {
          // Buscar por título en la tabla reviews
          const result = await pool.query(
            `SELECT DISTINCT ON (book_title) 
              r.id, 
              r.book_title, 
              r.author, 
              r.image_url,
              r.book_id,
              r.categoria_ia as genero,
              COUNT(*) OVER (PARTITION BY r.book_title) as review_count
             FROM reviews r 
             WHERE LOWER(r.book_title) LIKE LOWER($1) 
             LIMIT 1`,
            [`%${libro.titulo}%`]
          );

          if (result.rows.length > 0) {
            // El libro existe en la BD
            const libroEnBD = result.rows[0];
            
            // Obtener las reseñas del libro
            const reviewsResult = await pool.query(
              `SELECT r.*, u.name AS user_name 
               FROM reviews r 
               JOIN usuarios u ON r.usuarios_id = u.id 
               WHERE LOWER(r.book_title) = LOWER($1) 
               ORDER BY r.created_at DESC 
               LIMIT 5`,
              [libroEnBD.book_title]
            );

            return {
              ...libro,
              enBD: true,
              bookTitle: libroEnBD.book_title,
              detalles: {
                titulo: libroEnBD.book_title,
                autor: libroEnBD.author,
                genero: libroEnBD.genero || libro.genero,
                imagen: libroEnBD.image_url,
                reviewCount: libroEnBD.review_count
              },
              reviews: reviewsResult.rows
            };
          } else {
            // El libro NO está en la BD
            return {
              ...libro,
              enBD: false,
              detalles: {
                titulo: libro.titulo,
                autor: libro.autor,
                genero: libro.genero,
                isbn: libro.isbn,
                anio: libro.anio
              }
            };
          }
        } catch (error) {
          console.error('❌ Error consultando libro:', error);
          return {
            ...libro,
            enBD: false,
            error: true
          };
        }
      })
    );

    console.log("📚 Resultados finales:", librosConInfo);

    res.json({
      success: true,
      recomendaciones: librosConInfo
    });

  } catch (error) {
    console.error('❌ Error en recomendación:', error);
    res.status(500).json({ 
      error: 'Error generando recomendaciones',
      details: error.message 
    });
  }
});

export default router;