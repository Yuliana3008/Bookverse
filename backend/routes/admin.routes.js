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
      SELECT id, name, email, rol
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

export default router;
