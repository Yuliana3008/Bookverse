import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "No autenticado." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, name, email }
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}
