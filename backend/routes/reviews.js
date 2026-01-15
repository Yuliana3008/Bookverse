import express from "express";
import pool from "../config/db.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Groq from "groq-sdk";
import { auth } from "../middlewares/auth.js";

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
  cloudinary,
  params: {
    folder: "bookverse_reviews",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
  },
});

const upload = multer({ storage });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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
          content:
            "Eres un experto bibliotecario y crítico literario. Analizas reseñas de libros para detectar el género y spoilers. Respondes SOLO en formato JSON válido.",
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
}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    const generoFinal =
      result.es_hibrido && result.genero_secundario
        ? `Híbrido: ${result.genero_principal} y ${result.genero_secundario}`
        : result.genero_principal;

    return {
      genre: generoFinal,
      isSpoiler: result.tiene_spoiler,
      genreConfidence: result.confianza_genero,
      spoilerConfidence: result.confianza_spoiler,
      reason: result.razon_spoiler,
      keywords: result.keywords || [],
    };
  } catch (error) {
    console.error("❌ Error en Groq:", error.message);
    return {
      genre: detectGenreLocal(reviewText),
      isSpoiler: detectSpoilerLocal(reviewText),
      genreConfidence: 75,
      spoilerConfidence: 75,
      reason: "Análisis local (Backup)",
      keywords: [],
    };
  }
}

function detectSpoilerLocal(text) {
  if (!text) return false;
  const criticalPatterns = [
    /al final.*muere/i,
    /el asesino es/i,
    /spoiler alert/i,
    /muere al final/i,
  ];
  return criticalPatterns.some((pattern) => pattern.test(text));
}

function detectGenreLocal(text) {
  const lowerText = (text || "").toLowerCase();
  const genres = [
    { name: "Terror", words: ["miedo", "terror", "fantasma", "sangre"] },
    { name: "Romance", words: ["amor", "pareja", "beso", "pasión"] },
    { name: "Fantasía", words: ["magia", "dragón", "espada", "reino"] },
    { name: "Suspenso", words: ["misterio", "crimen", "detective"] },
  ];
  for (const genre of genres) {
    if (genre.words.filter((word) => lowerText.includes(word)).length >= 2)
      return genre.name;
  }
  return "General";
}

/* =========================================================
    3. RUTAS DE BÚSQUEDA Y FILTRADO (PÚBLICA)
========================================================= */

router.get("/search", async (req, res) => {
  try {
    const { q, genre, rating, sort } = req.query;

    let query = `
      SELECT r.*, u.name AS name 
      FROM reviews r 
      JOIN usuarios u ON u.id = r.usuarios_id 
      WHERE 1=1
    `;
    const values = [];

    if (q && q.trim() !== "") {
      values.push(`%${q}%`);
      query += ` AND (r.book_title ILIKE $${values.length} OR r.author ILIKE $${values.length} OR r.review_text ILIKE $${values.length})`;
    }

    if (genre && genre !== "" && genre !== "Todas") {
      values.push(`%${genre}%`);
      query += ` AND r.categoria_ia ILIKE $${values.length}`;
    }

    if (rating && rating !== "") {
      values.push(parseInt(rating));
      query += ` AND r.rating = $${values.length}`;
    }

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

// ✅ Recientes (PÚBLICA)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name AS name 
      FROM reviews r 
      JOIN usuarios u ON u.id = r.usuarios_id 
      ORDER BY r.created_at DESC;
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
    ✅ PRIVADA: MIS RESEÑAS (cookie)
    GET /api/reviews/me
========================================================= */
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;

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
    console.error("❌ Error en /reviews/me:", error.message);
    res.status(500).json({ error: "Error al obtener tus reseñas" });
  }
});

/* =========================================================
    ✅ PRIVADA: MIS FAVORITOS (cookie)
    GET /api/reviews/favorites/me
========================================================= */
router.get("/favorites/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT r.*
       FROM reviews r
       JOIN favoritos f ON r.id = f.review_id
       WHERE f.usuarios_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error en /favorites/me:", error.message);
    res.status(500).json({ error: "Error al obtener tus favoritos" });
  }
});

/* =========================================================
    🔒 (LEGACY) PERFIL POR ID
========================================================= */
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (Number(userId) !== Number(req.user.id)) {
      return res.status(403).json({ error: "No autorizado" });
    }

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

/* =========================================================
    ⚠️ DETALLE DE RESEÑA (PÚBLICA) + ✅ SUMA VISTAS
========================================================= */
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      WITH updated AS (
        UPDATE reviews
        SET views_count = COALESCE(views_count, 0) + 1
        WHERE id = $1
        RETURNING *
      )
      SELECT updated.*, u.name AS user_name
      FROM updated
      JOIN usuarios u ON u.id = updated.usuarios_id;
      `,
      [req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Reseña no hallada" });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
    ✅ CREAR RESEÑA (PRIVADA)
========================================================= */
router.post("/", auth, upload.single("image"), async (req, res) => {
  const usuarios_id = req.user.id;

  const { book_title, book_id, rating, review_text, author } = req.body;
  const image_url = req.file ? req.file.path : null;

  try {
    let analysis;
    if (process.env.GROQ_API_KEY?.startsWith("gsk_")) {
      analysis = await analyzeReviewWithGroq(review_text, book_title, author);
    } else {
      analysis = {
        genre: detectGenreLocal(review_text),
        isSpoiler: detectSpoilerLocal(review_text),
      };
    }

    const query = `
      INSERT INTO reviews (usuarios_id, book_title, book_id, rating, review_text, author, image_url, categoria_ia, is_spoiler)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    const result = await pool.query(query, [
      usuarios_id,
      book_title,
      book_id,
      rating,
      review_text,
      author,
      image_url,
      analysis.genre,
      analysis.isSpoiler,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
    ✅ EDITAR RESEÑA (PRIVADA + DUEÑO)
========================================================= */
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { review_text, rating, book_title, author } = req.body;

    const ownerCheck = await pool.query(
      "SELECT usuarios_id FROM reviews WHERE id = $1",
      [id]
    );
    if (ownerCheck.rowCount === 0)
      return res.status(404).json({ error: "Reseña no encontrada" });

    if (Number(ownerCheck.rows[0].usuarios_id) !== Number(req.user.id))
      return res.status(403).json({ error: "No autorizado" });

    const result = await pool.query(
      `UPDATE reviews 
       SET review_text = $1, rating = $2, book_title = $3, author = $4 
       WHERE id = $5 RETURNING *`,
      [review_text, rating, book_title, author, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
    ✅ ELIMINAR RESEÑA (PRIVADA + DUEÑO)
========================================================= */
router.delete("/full/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const ownerCheck = await pool.query(
      "SELECT usuarios_id FROM reviews WHERE id = $1",
      [id]
    );
    if (ownerCheck.rowCount === 0)
      return res.status(404).json({ error: "Reseña no encontrada" });

    if (Number(ownerCheck.rows[0].usuarios_id) !== Number(req.user.id))
      return res.status(403).json({ error: "No autorizado" });

    await pool.query("DELETE FROM comments WHERE review_id = $1", [id]);
    const result = await pool.query(
      "DELETE FROM reviews WHERE id = $1 RETURNING id",
      [id]
    );

    res.json({
      message: "Crónica eliminada correctamente",
      id: result.rows[0].id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
    5. COMENTARIOS + NOTIFICACIONES
========================================================= */

// Comentarios (PÚBLICO ver)
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

// Crear comentario (PRIVADO)
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const usuarios_id = req.user.id;
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: "Faltan datos" });

    const insertResult = await pool.query(
      `INSERT INTO comments (review_id, comment_text, usuarios_id, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING id`,
      [id, text, usuarios_id]
    );

    const finalResult = await pool.query(
      `SELECT c.id, c.comment_text AS text, c.created_at, c.usuarios_id, u.name AS user_name, r.usuarios_id AS owner_id, r.book_title 
       FROM comments c 
       JOIN usuarios u ON c.usuarios_id = u.id 
       JOIN reviews r ON c.review_id = r.id
       WHERE c.id = $1`,
      [insertResult.rows[0].id]
    );

    const data = finalResult.rows[0];

    // Notificación si no es tu propia reseña
    if (Number(data.owner_id) !== Number(usuarios_id)) {
      await pool.query(
        "INSERT INTO notificaciones (usuario_id, emisor_id, tipo, review_id) VALUES ($1, $2, 'comentario', $3)",
        [data.owner_id, usuarios_id, id]
      );

      const io = req.app.get("io");
      if (io) {
        io.to(`user_${data.owner_id}`).emit("nueva_notificacion", {
          id: Math.random(),
          tipo: "comentario",
          emisor_nombre: data.user_name,
          book_title: data.book_title,
          review_id: id,
          leido: false,
          created_at: new Date(),
        });
      }
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Borrar comentario (PRIVADO dueño del comentario)
router.delete("/comments/:commentId", auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const owner = await pool.query(
      "SELECT usuarios_id FROM comments WHERE id = $1",
      [commentId]
    );

    if (owner.rowCount === 0)
      return res.status(404).json({ error: "No existe" });

    if (Number(owner.rows[0].usuarios_id) !== Number(req.user.id))
      return res.status(403).json({ error: "No autorizado" });

    const result = await pool.query(
      "DELETE FROM comments WHERE id = $1 RETURNING id",
      [commentId]
    );

    res.json({ message: "Eliminado", id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
    6. RECOMENDACIONES CON IA (PÚBLICA)
========================================================= */

router.post("/recommend", async (req, res) => {
  try {
    const { userDescription } = req.body;

    if (!userDescription) {
      return res.status(400).json({ error: "Se requiere una descripción" });
    }

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
      "anio": 2024,
      "razon": "Breve explicación de por qué este libro coincide (máximo 100 palabras)"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Eres un bibliotecario experto que recomienda libros. Respondes únicamente en formato JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    let recomendaciones;
    try {
      recomendaciones = JSON.parse(completion.choices[0]?.message?.content || "{}");
    } catch (parseError) {
      console.error("❌ Error parseando JSON de Groq:", parseError);
      return res.status(500).json({ error: "Error procesando la respuesta de la IA" });
    }

    const librosConInfo = await Promise.all(
      (recomendaciones.libros || []).map(async (libro) => {
        try {
          const result = await pool.query(
            `SELECT DISTINCT ON (book_title) 
              r.id, r.book_title, r.author, r.image_url, r.book_id,
              r.categoria_ia as genero,
              COUNT(*) OVER (PARTITION BY r.book_title) as review_count
             FROM reviews r 
             WHERE LOWER(r.book_title) LIKE LOWER($1) 
             LIMIT 1`,
            [`%${libro.titulo}%`]
          );

          if (result.rows.length > 0) {
            const libroEnBD = result.rows[0];
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
                reviewCount: libroEnBD.review_count,
              },
              reviews: reviewsResult.rows,
            };
          }

          return {
            ...libro,
            enBD: false,
            detalles: {
              titulo: libro.titulo,
              autor: libro.autor,
              genero: libro.genero,
              isbn: libro.isbn,
              anio: libro.anio,
            },
          };
        } catch (error) {
          console.error("❌ Error consultando libro:", error);
          return { ...libro, enBD: false, error: true };
        }
      })
    );

    res.json({ success: true, recomendaciones: librosConInfo });
  } catch (error) {
    console.error("❌ Error en recomendación:", error);
    res.status(500).json({ error: "Error generando recomendaciones", details: error.message });
  }
});

/* =========================================================
    7. FAVORITOS (PRIVADO)
========================================================= */

// ✅ Check favorito (ruta correcta)
router.get("/favorites/check/:reviewId", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT 1 FROM favoritos WHERE usuarios_id = $1 AND review_id = $2",
      [userId, reviewId]
    );

    res.json({ isFavorite: result.rowCount > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Check favorito (compatibilidad con tu frontend viejo: /check/:userId/:reviewId)
router.get("/favorites/check/:userId/:reviewId", auth, async (req, res) => {
  try {
    const { userId, reviewId } = req.params;

    // seguridad: solo puedes checar tu propio userId
    if (Number(userId) !== Number(req.user.id)) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const result = await pool.query(
      "SELECT 1 FROM favoritos WHERE usuarios_id = $1 AND review_id = $2",
      [req.user.id, reviewId]
    );

    res.json({ isFavorite: result.rowCount > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Toggle favorito + NOTIFICACIÓN al dueño
router.post("/favorites/toggle", auth, async (req, res) => {
  try {
    const usuarios_id = req.user.id;
    const { review_id } = req.body;

    if (!review_id) {
      return res.status(400).json({ error: "Falta review_id" });
    }

    const exists = await pool.query(
      "SELECT id FROM favoritos WHERE usuarios_id = $1 AND review_id = $2",
      [usuarios_id, review_id]
    );

    // si existe -> quitar favorito (no notificamos)
    if (exists.rowCount > 0) {
      await pool.query(
        "DELETE FROM favoritos WHERE usuarios_id = $1 AND review_id = $2",
        [usuarios_id, review_id]
      );
      return res.json({ message: "Eliminado de favoritos", isFavorite: false });
    }

    // si no existe -> agregar favorito
    await pool.query(
      "INSERT INTO favoritos (usuarios_id, review_id) VALUES ($1, $2)",
      [usuarios_id, review_id]
    );

    // buscar dueño + título
    const ownerRes = await pool.query(
      `SELECT usuarios_id AS owner_id, book_title
       FROM reviews
       WHERE id = $1`,
      [review_id]
    );

    if (ownerRes.rowCount > 0) {
      const { owner_id, book_title } = ownerRes.rows[0];

      // no notificarte a ti mismo
      if (Number(owner_id) !== Number(usuarios_id)) {
        // nombre del emisor
        const emisorRes = await pool.query(
          "SELECT name FROM usuarios WHERE id = $1",
          [usuarios_id]
        );
        const emisor_nombre = emisorRes.rows[0]?.name || "Alguien";

        // guardar notificación
        await pool.query(
          "INSERT INTO notificaciones (usuario_id, emisor_id, tipo, review_id) VALUES ($1, $2, 'favorito', $3)",
          [owner_id, usuarios_id, review_id]
        );

        // socket emit
        const io = req.app.get("io");
        if (io) {
          io.to(`user_${owner_id}`).emit("nueva_notificacion", {
            id: Math.random(),
            tipo: "favorito",
            emisor_nombre,
            book_title,
            review_id,
            leido: false,
            created_at: new Date(),
          });
        }
      }
    }

    return res.json({ message: "Añadido a favoritos", isFavorite: true });
  } catch (error) {
    console.error("❌ Error toggle favoritos:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
    8. NOTIFICACIONES (PRIVADO)
========================================================= */

router.get("/notifications/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT n.*, u.name as emisor_nombre, r.book_title 
       FROM notificaciones n
       JOIN usuarios u ON n.emisor_id = u.id
       JOIN reviews r ON n.review_id = r.id
       WHERE n.usuario_id = $1 
       ORDER BY n.created_at DESC
       LIMIT 15`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/notifications/read-all/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query("UPDATE notificaciones SET leido = TRUE WHERE usuario_id = $1", [
      userId,
    ]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
