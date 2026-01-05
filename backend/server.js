import dotenv from "dotenv"; 
import express from "express";
import cors from "cors";
import path from "path"; 
import { fileURLToPath } from 'url'; 

import "./config/db.js"; 
import authRoutes from "./routes/auth.js"; 
import reviewRoutes from "./routes/reviews.js";

dotenv.config(); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- CONFIGURACIÓN DE CORS OPTIMIZADA ---
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

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Servidor backend de BookVerse funcionando",
    status: "online",
    timestamp: new Date().toISOString()
  });
});

// IMPORTANTE: Rutas con prefijo /api
app.use("/api/auth", authRoutes); 
app.use("/api/reviews", reviewRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: "Ruta no encontrada",
    path: req.path 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error global:", err);
  res.status(500).json({ 
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en puerto ${PORT}`);
  console.log(`📍 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});

export default app;