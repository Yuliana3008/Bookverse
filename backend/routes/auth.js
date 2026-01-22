import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../config/db.js";
import { auth } from "../middlewares/auth.js";
import { sendVerificationEmail } from "../utils/mailer.js";

const router = express.Router();

/* =========================================================
   🚪 REGISTRO
   👉 NO inicia sesión
   👉 Requiere confirmación por correo
========================================================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        error: "Datos incompletos o la contraseña debe tener al menos 6 caracteres.",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // 1️⃣ Crear usuario (NO verificado)
    const result = await pool.query(
      `INSERT INTO usuarios (name, email, password_hash, email_verified)
       VALUES ($1, $2, $3, FALSE)
       RETURNING id, name, email`,
      [name, email, password_hash]
    );

    const user = result.rows[0];

    // 2️⃣ Generar token
    const token = crypto.randomBytes(32).toString("hex");

    // 3️⃣ Guardar token (24h)
    await pool.query(
      `INSERT INTO email_verifications (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [user.id, token]
    );

    // 4️⃣ Enviar correo
    await sendVerificationEmail(user.email, token);

    return res.status(201).json({
      success: true,
      message: "Cuenta creada. Revisa tu correo para confirmar tu cuenta.",
    });
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ error: "El correo ya está registrado en MyBookCompass." });
    }

    console.error("Error en el registro:", err);
    res.status(500).json({
      error: "Error interno del servidor durante el registro.",
    });
  }
});

/* =========================================================
   🔑 LOGIN
========================================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan email o contraseña." });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, email_verified
       FROM usuarios
       WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

    // 🚫 Bloquear si no está verificado
    if (!user.email_verified) {
      return res.status(403).json({
        error: "Debes confirmar tu correo electrónico antes de iniciar sesión.",
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login exitoso.",
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Error en el login:", err);
    res.status(500).json({
      error: "Error interno del servidor durante el login.",
    });
  }
});

/* =========================================================
   👤 SESIÓN ACTUAL
========================================================= */
router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

/* =========================================================
   🚪 LOGOUT
========================================================= */
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });

  res.json({ message: "Sesión cerrada." });
});

/* =========================================================
   ✏️ EDITAR PERFIL
========================================================= */
router.put("/update-profile", auth, async (req, res) => {
  const { name, email } = req.body;
  const id = req.user.id;

  try {
    if (!name || !email) {
      return res.status(400).json({
        error: "El nombre y el email son obligatorios.",
      });
    }

    const result = await pool.query(
      `UPDATE usuarios
       SET name = $1, email = $2
       WHERE id = $3
       RETURNING id, name, email`,
      [name, email, id]
    );

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

    console.error("Error al actualizar perfil:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar el perfil.",
    });
  }
});

/* =========================================================
   ✉️ VERIFICAR EMAIL (CORREGIDO)
========================================================= */
router.get("/verify-email/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const result = await pool.query(
      `SELECT user_id
       FROM email_verifications
       WHERE token = $1
         AND expires_at > NOW()`,
      [token]
    );

    // ✅ Token ya usado o inexistente → correo ya verificado
    if (result.rowCount === 0) {
      return res.json({
        success: true,
        alreadyVerified: true,
        message: "El correo ya fue verificado anteriormente.",
      });
    }

    const userId = result.rows[0].user_id;

    await pool.query(
      `UPDATE usuarios
       SET email_verified = TRUE
       WHERE id = $1`,
      [userId]
    );

    await pool.query(
      `DELETE FROM email_verifications
       WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      message: "Correo verificado correctamente. Ya puedes iniciar sesión.",
    });
  } catch (err) {
    console.error("Error verificando email:", err);
    res.status(500).json({
      error: "Error interno verificando el correo.",
    });
  }
});

/* =========================================================
   🔁 REENVIAR VERIFICACIÓN
========================================================= */
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: "Email requerido." });
    }

    const result = await pool.query(
      `SELECT id, email_verified
       FROM usuarios
       WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.json({
        message: "Si el correo existe, se enviará un nuevo enlace.",
      });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.json({
        message: "Este correo ya está verificado.",
      });
    }

    await pool.query(
      `DELETE FROM email_verifications
       WHERE user_id = $1`,
      [user.id]
    );

    const token = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `INSERT INTO email_verifications (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [user.id, token]
    );

    await sendVerificationEmail(email, token);

    res.json({
      success: true,
      message: "Se ha reenviado el correo de verificación.",
    });
  } catch (err) {
    console.error("Error reenviando verificación:", err);
    res.status(500).json({ error: "Error interno." });
  }
});

export default router;
