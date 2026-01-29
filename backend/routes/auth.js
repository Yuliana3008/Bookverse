import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../config/db.js";
import { auth } from "../middlewares/auth.js";
import { sendVerificationEmail, sendPasswordResetEmail} from "../utils/mailer.js";

const router = express.Router();
/*registro*/
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Datos incompletos.",
      });
    }

    const existingName = await pool.query(
      "SELECT id FROM usuarios WHERE name = $1",
      [name]
    );

    if (existingName.rowCount > 0) {
      return res.status(409).json({
        error: "Ese nombre de usuario ya está en uso. Elige otro.",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, un número y un carácter especial.",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (name, email, password_hash, email_verified)
       VALUES ($1, $2, $3, FALSE)
       RETURNING id, name, email`,
      [name, email, password_hash]
    );

    const user = result.rows[0];

    const token = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `INSERT INTO email_verifications (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [user.id, token]
    );

    await sendVerificationEmail(user.email, token);

    return res.status(201).json({
      success: true,
      message: "Cuenta creada. Revisa tu correo para confirmar tu cuenta.",
    });
  } catch (err) {
   
    if (err.code === "23505") {
        
        const detail = err.detail || "";
        
        if (detail.includes("name")) {
            return res.status(409).json({ 
                error: "Este nombre de usuario ya está en uso. Por favor, elige otro." 
            });
        }
        
        if (detail.includes("email")) {
            return res.status(409).json({ 
                error: "Este correo electrónico ya está registrado en MyBookCompass." 
            });
        }

        return res.status(409).json({ 
            error: "El nombre de usuario o el correo ya están en uso." 
        });
    }

    console.error("Error en el registro:", err);
    res.status(500).json({
      error: "Error interno del servidor durante el registro.",
    });
  }
});

/*login*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan email o contraseña." });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, email_verified, activo, rol
       FROM usuarios
       WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }
      const user = result.rows[0];
   
if (!user.activo) {
  return res.status(403).json({
    error: "Tu cuenta ha sido bloqueada por un administrador.",
  });
}

    
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }

   
    if (!user.email_verified) {
      return res.status(403).json({
        error: "Debes confirmar tu correo electrónico antes de iniciar sesión.",
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email,  rol: user.rol, },
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


router.get("/me", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, rol, activo
       FROM usuarios
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    if (!user.activo) {
      return res.status(403).json({
        error: "Tu cuenta ha sido bloqueada por un administrador",
      });
    }

    res.json({ user });
  } catch (err) {
    console.error("Error en /me:", err);
    res.status(500).json({ error: "Error interno" });
  }
});



router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });

  res.json({ message: "Sesión cerrada." });
});

/*editar perfil*/
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
      const detail = err.detail || "";

      if (detail.includes("name")) {
        return res.status(409).json({
          error: "Este nombre de usuario ya está siendo usado por otra persona.",
        });
      }

      if (detail.includes("email")) {
        return res.status(409).json({
          error: "Este correo electrónico ya está en uso por otro usuario.",
        });
      }

      
      return res.status(409).json({
        error: "El nombre o el correo ya están registrados.",
      });
    }

    console.error("Error al actualizar perfil:", err);
    res.status(500).json({
      error: "Error interno del servidor al actualizar el perfil.",
    });
  }
});


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


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: "Email requerido." });
    }

    const result = await pool.query(
      `SELECT id FROM usuarios WHERE email = $1`,
      [email]
    );

    
    if (result.rowCount === 0) {
      return res.json({
        message: "Si el correo existe, se enviará un enlace para restablecer la contraseña.",
      });
    }

    const userId = result.rows[0].id;

    
    await pool.query(
      `DELETE FROM password_resets WHERE user_id = $1`,
      [userId]
    );

    
    const token = crypto.randomBytes(32).toString("hex");

   
    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
      [userId, token]
    );

    
    await sendPasswordResetEmail(email, token);

    return res.json({
      message: "Si el correo existe, se enviará un enlace para restablecer la contraseña.",
    });
  } catch (err) {
    console.error("Error forgot-password:", err);
    res.status(500).json({ error: "Error interno." });
  }
});


router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    const result = await pool.query(
      `
      SELECT pr.user_id
      FROM password_resets pr
      WHERE pr.token = $1
        AND pr.expires_at > NOW()
      `,
      [token]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        error: "Token inválido o expirado.",
      });
    }

    const userId = result.rows[0].user_id;

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `
      UPDATE usuarios
      SET password_hash = $1
      WHERE id = $2
      `,
      [password_hash, userId]
    );

    await pool.query(
      `DELETE FROM password_resets WHERE user_id = $1`,
      [userId]
    );

    return res.json({
      success: true,
      message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
    });
  } catch (err) {
    console.error("Error reset password:", err);
    res.status(500).json({
      error: "Error interno del servidor.",
    });
  }
});


export default router;
