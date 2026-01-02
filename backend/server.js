/*import express from "express";
import cors from "cors";
import dotenv from "dotenv"; 
// import pool from "./config/db.js"; // Importamos la conexión centralizada (solo para inicializarla y hacer el chequeo)
import "./config/db.js"; 


import authRoutes from "./routes/auth.js"; 
import reviewRoutes from "./routes/reviews.js";



dotenv.config(); 

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor backend de BookVerse funcionando");
});


app.use("/auth", authRoutes); 
app.use("/reviews", reviewRoutes);


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});*/
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
// Esto permite que el navegador acepte las respuestas PUT y lea el JSON de éxito
app.use(cors({
  origin: "http://localhost:5173", // URL de tu frontend en Vite
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Servidor backend de BookVerse funcionando");
});

app.use("/auth", authRoutes); 
app.use("/reviews", reviewRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});