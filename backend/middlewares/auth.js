import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export async function auth(req, res, next) {
  try {
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization || "";
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return res.status(401).json({ error: "No autenticado." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id;

    // 🔥 CONSULTAR BD PARA TRAER EL ROL
    const result = await pool.query(
      "SELECT id, name, email, rol FROM usuarios WHERE id = $1",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Usuario no válido." });
    }

    // ✅ AQUÍ YA VIENE EL ROL
    req.user = result.rows[0];

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}
