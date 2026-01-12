import dotenv from "dotenv"; 
import express from "express";
import cors from "cors";
import path from "path"; 
import { fileURLToPath } from 'url'; 
import { createServer } from "http"; // 1. Importar el servidor HTTP nativo
import { Server } from "socket.io";  // 2. Importar Socket.io

import "./config/db.js"; 
import authRoutes from "./routes/auth.js"; 
import reviewRoutes from "./routes/reviews.js";

dotenv.config(); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* =========================================================
    CONFIGURACIÓN DE SOCKET.IO
========================================================= */
const httpServer = createServer(app); // 3. Crear el servidor HTTP usando la app de Express
const io = new Server(httpServer, {   // 4. Inicializar Socket.io con el servidor
  cors: {
    origin: [
      "http://localhost:5173", 
      "https://bookverse-git-main-yuliana-sanchezs-projects.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 5. Inyectar 'io' en la aplicación para usarlo en las rutas (reviews.js)
app.set("io", io);

// Lógica de conexión de sockets
io.on("connection", (socket) => {
  console.log("👤 Usuario conectado al socket:", socket.id);

  // El frontend emitirá este evento para unirse a su propia sala
  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`📡 Usuario ${userId} unido a su sala privada`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Usuario desconectado");
  });
});

/* =========================================================
    MIDDLEWARES Y RUTAS
========================================================= */

app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://bookverse-git-main-yuliana-sanchezs-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Servidor de BookVerse con Sockets activo",
    status: "online"
  });
});

app.use("/api/auth", authRoutes); 
app.use("/api/reviews", reviewRoutes);

// Manejo de rutas no encontradas y errores (igual que antes)
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error("Error global:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

/* =========================================================
    INICIO DEL SERVIDOR
========================================================= */
const PORT = process.env.PORT || 4000;

// 6. IMPORTANTE: Usar httpServer.listen en lugar de app.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});

export default app;