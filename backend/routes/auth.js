import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// =========================================================
// 🚪 REGISTRO (POST /api/auth/register)
// =========================================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        error: "Datos incompletos o la contraseña debe tener al menos 6 caracteres.",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, password_hash]
    );

    res.status(201).json({
      message: "Registro exitoso.",
      user: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ error: "El correo ya está registrado en BookVerse." });
    }
    console.error("Error en el registro:", err);
    res
      .status(500)
      .json({ error: "Error interno del servidor durante el registro." });
  }
});

// =========================================================
// 🔑 LOGIN (POST /api/auth/login) ✅ CREA COOKIE httpOnly
// =========================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan email o contraseña." });
    }

    const result = await pool.query(
      "SELECT id, name, email, password_hash FROM usuarios WHERE email = $1",
      [email]
    );

    // ✅ mensaje genérico (evita enumeración)
    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    // ✅ JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // ✅ Cookie httpOnly (DEPLOY-PROOF para Render + Vercel)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true en deploy HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // ✅ IMPORTANTE: mayúsculas
      path: "/", // ✅ IMPORTANTE: asegura que aplique en todas las rutas
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login exitoso.",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Error en el login:", err);
    res.status(500).json({ error: "Error interno del servidor durante el login." });
  }
});

// =========================================================
// 👤 SESIÓN ACTUAL (GET /api/auth/me) ✅
// El frontend lo usa para saber si hay sesión real (cookie)
// =========================================================
router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

// =========================================================
// 🚪 LOGOUT (POST /api/auth/logout) ✅ BORRA COOKIE
// =========================================================
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // ✅ IMPORTANTE: mayúsculas
    path: "/", // ✅ IMPORTANTE
  });

  res.json({ message: "Sesión cerrada." });
});

// =========================================================
// ✏️ EDITAR PERFIL (PUT /api/auth/update-profile) ✅ PROTEGIDA
// ✅ Ya NO lleva :id (evita IDOR)
// =========================================================
router.put("/update-profile", auth, async (req, res) => {
  const { name, email } = req.body;
  const id = req.user.id; // ✅ del token

  try {
    if (!name || !email) {
      return res
        .status(400)
        .json({ error: "El nombre y el email son obligatorios." });
    }

    const query = `
      UPDATE usuarios
      SET name = $1, email = $2
      WHERE id = $3
      RETURNING id, name, email;
    `;

    const result = await pool.query(query, [name, email, id]);

    res.json({
      message: "Perfil actualizado con éxito.",
      user: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Este correo electrónico ya está en uso por otro usuario.",
      });
    }
    console.error("Error al actualizar perfil:", err.message);
    res
      .status(500)
      .json({ error: "Error interno del servidor al actualizar el perfil." });
  }
});

export default router;
