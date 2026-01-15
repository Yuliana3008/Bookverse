import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  try {
    // 1️⃣ Intentar desde cookie (desktop)
    let token = req.cookies?.token;

    // 2️⃣ Fallback: Authorization header (mobile/tablet)
    if (!token) {
      const authHeader = req.headers.authorization || "";
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    // 3️⃣ Si sigue sin token → no autenticado
    if (!token) {
      return res.status(401).json({ error: "No autenticado." });
    }

    // 4️⃣ Verificar JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // payload esperado: { id, name, email, iat, exp }
    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}
