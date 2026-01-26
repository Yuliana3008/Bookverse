import express from "express";
import pool from "../config/db.js";
import { auth } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

/* =========================================================
   👑 ADMIN – LISTAR USUARIOS
========================================================= */
router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, rol, activo
      FROM usuarios
      ORDER BY id ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("ADMIN USERS ERROR:", error.message);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});

/* =========================================================
   👑 ADMIN – CAMBIAR ROL
========================================================= */
router.put("/users/:id/role", auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    await pool.query(
      "UPDATE usuarios SET rol = $1 WHERE id = $2",
      [role, id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error cambiando rol" });
  }
});

/* =========================================================
   👑 ADMIN – BLOQUEAR / DESBLOQUEAR USUARIO
========================================================= */
router.put("/users/:id/status", auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  try {
    if (typeof activo !== "boolean") {
      return res.status(400).json({ error: "Estado inválido" });
    }

    // 🚫 Evitar que el admin se bloquee a sí mismo
    if (req.user.id == id) {
      return res.status(403).json({
        error: "No puedes bloquear tu propio usuario",
      });
    }

    const result = await pool.query(
      `
      UPDATE usuarios
      SET activo = $1
      WHERE id = $2
      RETURNING id, activo
      `,
      [activo, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("ADMIN STATUS ERROR:", error.message);
    res.status(500).json({ error: "Error cambiando estado del usuario" });
  }
});

export default router;
