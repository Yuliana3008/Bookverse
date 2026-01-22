import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin.routes.js";


import "./config/db.js";
import authRoutes from "./routes/auth.js";
import reviewRoutes from "./routes/reviews.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Importante para deploy detrás de proxy (HTTPS)
app.set("trust proxy", 1);

/* =========================================================
   ✅ ORÍGENES PERMITIDOS (LOCAL + DEPLOY)
========================================================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173", // ✅ evita broncas IPv6/localhost
  "https://bookverse-git-main-yuliana-sanchezs-projects.vercel.app",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

/* =========================================================
    CONFIGURACIÓN DE SOCKET.IO
========================================================= */
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Permite sin origin (algunos clientes) o si está en whitelist
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Socket CORS bloqueado para el origen: ${origin}`));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Inyectar 'io' para usarlo en rutas
app.set("io", io);

io.on("connection", (socket) => {
  console.log("👤 Usuario conectado al socket:", socket.id);

  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`📡 Usuario ${userId} unido a su sala privada`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Usuario desconectado");
  });
});

/* =========================================================
    ✅ MIDDLEWARES (ORDEN IMPORTA)
========================================================= */

// ✅ CORS (con credentials)
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman/Insomnia)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS bloqueado para el origen: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Preflight (muy importante con cookies)
app.options(/.*/, cors());


// ✅ JSON + Cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================================================
    RUTAS
========================================================= */
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Servidor de BookVerse con Sockets activo",
    status: "online",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error global:", err.message || err);
  res.status(500).json({ error: "Error interno del servidor" });
});

/* =========================================================
    INICIO DEL SERVIDOR
========================================================= */
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en puerto ${PORT}`);
  console.log(`🔗 URL: http://127.0.0.1:${PORT}`);
});

export default app;
