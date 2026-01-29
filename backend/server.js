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


app.set("trust proxy", 1);


const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173", 
  "https://bookverse-git-main-yuliana-sanchezs-projects.vercel.app",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];


const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
    
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Socket CORS bloqueado para el origen: ${origin}`));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});


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


app.use(
  cors({
    origin: (origin, callback) => {
      
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS bloqueado para el origen: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.options(/.*/, cors());



app.use(express.json());
app.use(cookieParser());


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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


app.use((err, req, res, next) => {
  console.error("Error global:", err.message || err);
  res.status(500).json({ error: "Error interno del servidor" });
});


const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en puerto ${PORT}`);
  console.log(`🔗 URL: http://127.0.0.1:${PORT}`);
});

export default app;
