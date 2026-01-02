import express from "express";
import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import natural from "natural";

const router = express.Router();

/* =========================================================
   1. IA DE DETECCIÓN DE SPOILERS (Hugging Face)
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
        options: { wait_for_model: true, use_cache: false }
      }),
    });

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const result = await response.json();
    let verdict = Array.isArray(result) 
      ? result[0]?.generated_text?.toUpperCase() || "" 
      : result.generated_text?.toUpperCase() || "";
    
    console.log("🤖 Respuesta de la IA Spoilers:", verdict);
    return verdict.includes("SI") || verdict.includes("SPOILER");

  } catch (error) {
    console.warn(`⚠️ IA no disponible (${error.message}). Usando filtro local.`);
    const spoilerKeywords = ["muere", "muerte", "final", "asesino", "giro", "revela", "termina", "descubre", "traicion"];
    const lowerText = text.toLowerCase();
    return spoilerKeywords.some((word) => lowerText.includes(word));
  }
}

/* =========================================================
   2. IA LOCAL (CLASIFICADOR DE GÉNERO - Natural)
========================================================= */
const classifier = new natural.BayesClassifier();
classifier.addDocument("miedo fantasma sangre muerte oscuro asesino terror aterrador espectro horror", "Terror");
classifier.addDocument("amor beso enamorados corazón relación pareja romántico boda pasión dulce", "Romance");
classifier.addDocument("crimen detective pista misterio secreto culpable investigación sospechoso enigma", "Suspenso");
classifier.addDocument("magia dragón espada reino rey héroe leyenda épico aventura hechicero", "Fantasía");
classifier.addDocument("nave espacio planeta alienígena robot tecnología galaxia estelar ciborg", "Ciencia Ficción");
classifier.addDocument("superación bienestar hábito mentalidad motivación éxito meditación resiliencia autoayuda", "Autoayuda");
classifier.train();

/* =========================================================
   3. CONFIGURACIÓN MULTER (IMÁGENES)
========================================================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/* =========================================================
   4. RUTAS DE ACCIÓN (POST / DELETE)
========================================================= */

// --- CREAR RESEÑA ---
router.post("/", upload.single("image"), async (req, res) => {
  const { usuarios_id, book_title, book_id, rating, review_text, author } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  // Lógica de Géneros por Reglas + Bayes
  const reglas = [
    { nombre: "Terror", regex: /miedo|sangre|asesin|terror|muert|fantasma/gi },
    { nombre: "Romance", regex: /amor|beso|pareja|romance|pasi[óo]n/gi },
    { nombre: "Suspenso", regex: /misterio|detective|crimen|secreto|intriga/gi },
    { nombre: "Fantasía", regex: /magia|drag[óo]n|espada|reino|hechicero/gi },
    { nombre: "Ciencia Ficción", regex: /nave|espacio|robot|futuro|tecnolog[íi]a/gi },
    { nombre: "Autoayuda", regex: /superaci[óo]n|bienestar|motivaci[óo]n/gi },
  ];

  let generosDetectados = reglas.filter((r) => r.regex.test(review_text)).map((r) => r.nombre);
  let categoriaFinal;

  if (generosDetectados.length >= 2) {
    const ultimo = generosDetectados.pop();
    categoriaFinal = `Híbrido: ${generosDetectados.join(", ")} y ${ultimo}`;
  } else {
    const clasificaciones = classifier.getClassifications(review_text).sort((a, b) => b.value - a.value);
    const principal = clasificaciones[0];
    const secundario = clasificaciones[1];
    categoriaFinal = secundario && secundario.value > principal.value * 0.3
        ? `Híbrido: ${principal.label} y ${secundario.label}`
        : principal.label;
  }

  const isSpoiler = await detectSpoilerWithIA(review_text);

  try {
    const query = `
      INSERT INTO reviews (usuarios_id, book_title, book_id, rating, review_text, author, image_url, categoria_ia, is_spoiler)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;
    `;
    const result = await pool.query(query, [usuarios_id, book_title, book_id, rating, review_text, author, image_url, categoriaFinal, isSpoiler]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ELIMINAR RESEÑA ---
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM reviews WHERE id = $1", [id]);
    res.json({ message: "Reseña eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
   5. RUTAS DE CONSULTA (EL ORDEN AQUÍ ES CRÍTICO)
========================================================= */

// --- BUSCADOR (DEBE IR ANTES DE /:id) ---
router.get("/search", async (req, res) => {
  try {
    const { q, rating, genre, sort } = req.query;
    let query = `
      SELECT r.*, u.name AS user 
      FROM reviews r 
      JOIN usuarios u ON u.id = r.usuarios_id 
      WHERE 1=1
    `;
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
      const numRating = parseInt(rating);
      if (!isNaN(numRating)) {
        values.push(numRating);
        query += ` AND r.rating = $${values.length}`;
      }
    }
    query += sort === "asc" ? " ORDER BY r.created_at ASC" : " ORDER BY r.created_at DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error en la búsqueda" });
  }
});

// --- OBTENER RESEÑAS DE UN USUARIO ---
router.get("/user/:usuarios_id", async (req, res) => {
  const { usuarios_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS user FROM reviews r 
       JOIN usuarios u ON u.id = r.usuarios_id 
       WHERE r.usuarios_id = $1 ORDER BY r.created_at DESC`,
      [usuarios_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- OBTENER TODAS (HOME) ---
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

// --- OBTENER POR ID (AL FINAL PARA EVITAR CONFLICTOS) ---
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: "ID no válido" });

  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name FROM reviews r 
       JOIN usuarios u ON u.id = r.usuarios_id WHERE r.id = $1`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/comments", async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ error: "ID de reseña no válido" });

  try {
    const query = `
      SELECT c.*, u.name AS user_name 
      FROM comments c 
      JOIN usuarios u ON c.usuarios_id = u.id 
      WHERE c.review_id = $1 
      ORDER BY c.created_at DESC;
    `;
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    res.status(500).json({ error: "Error al obtener comentarios" });
  }
});

// --- PUBLICAR UN NUEVO COMENTARIO ---
router.post("/:id/comments", async (req, res) => {
  const { id } = req.params; 
  const { text, userId } = req.body; 

  if (!text || !userId) {
    return res.status(400).json({ error: "El texto y el ID de usuario son obligatorios" });
  }

  try {
    const query = `
      INSERT INTO comments (review_id, usuarios_id, comment_text) 
      VALUES ($1, $2, $3) 
      RETURNING *, (SELECT name FROM usuarios WHERE id = $2) AS user_name;
    `;
    const result = await pool.query(query, [id, userId, text]);
    
    // Mapeamos para que el frontend reciba los nombres correctos
    const nuevoComentario = {
      id: result.rows[0].id,
      user_name: result.rows[0].user_name,
      text: result.rows[0].comment_text,
      created_at: result.rows[0].created_at
    };

    res.status(201).json(nuevoComentario);
  } catch (error) {
    console.error("Error al publicar comentario:", error);
    res.status(500).json({ error: "Error al guardar el comentario" });
  }
});

export default router;