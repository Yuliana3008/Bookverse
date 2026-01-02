import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js"; 

const router = express.Router();

// =========================================================
// 🚪 RUTA DE REGISTRO (POST /auth/register)
// =========================================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6)
      return res.status(400).json({ 
        error: "Datos incompletos o la contraseña debe tener al menos 6 caracteres." 
      });

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, password_hash]
    );

    res.status(201).json({
      message: "Registro exitoso.",
      user: result.rows[0]
    });
    
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "El correo ya está registrado en BookVerse." });
    }
    console.error("Error en el registro:", err);
    res.status(500).json({ error: "Error interno del servidor durante el registro." });
  }
});


// =========================================================
// 🔑 RUTA DE LOGIN (POST /auth/login)
// =========================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "Faltan email o contraseña." });
    
    const result = await pool.query(
      "SELECT id, name, email, password_hash FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Usuario o contraseña incorrectos." });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid)
      return res.status(401).json({ error: "Usuario o contraseña incorrectos." });

    res.json({
      message: "Login exitoso.",
      id: user.id,
      name: user.name,
      email: user.email
    });

  } catch (err) {
    console.error("Error en el login:", err);
    res.status(500).json({ error: "Error interno del servidor durante el login." });
  }
});

// =========================================================
// ✏️ NUEVA RUTA: EDITAR PERFIL (PUT /auth/update-profile/:id)
// =========================================================
router.put("/update-profile/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    // 1. Validar que los campos no estén vacíos
    if (!name || !email) {
      return res.status(400).json({ error: "El nombre y el email son obligatorios." });
    }

    // 2. Ejecutar la actualización en la base de datos
    const query = `
      UPDATE usuarios 
      SET name = $1, email = $2 
      WHERE id = $3 
      RETURNING id, name, email;
    `;
    
    const result = await pool.query(query, [name, email, id]);

    // 3. Verificar si el usuario existía
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // 4. Enviar los datos actualizados al frontend
    res.json({
      message: "Perfil actualizado con éxito.",
      user: result.rows[0]
    });

  } catch (err) {
    // Manejar error si el nuevo email ya pertenece a otro usuario
    if (err.code === '23505') {
      return res.status(409).json({ error: "Este correo electrónico ya está en uso por otro usuario." });
    }
    console.error("Error al actualizar perfil:", err.message);
    res.status(500).json({ error: "Error interno del servidor al actualizar el perfil." });
  }
});

export default router;