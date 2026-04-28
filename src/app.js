import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";
import multer from "multer";         

// RUTAS DE AUTENTICACIÓN
import authRoutes from "./routes/auth.routes.js"; // Colaboradores/General
import directivoAuthRoutes from "./routes/directivoAuth.routes.js"; // NUEVO: Gestión Académica


// OTRAS RUTAS
import taskRoutes from './routes/tasks.routes.js';
import employeesRoutes from './routes/empleados.routes.js';
import tipohorariosRoutes from './routes/tipohorarios.routes.js';
import plantelesRoutes from './routes/planteles.routes.js';
import checadaRoutes from "./routes/checadas.routes.js";
import docentesRoutes from './routes/docentes.routes.js';
import materiasRoutes from './routes/materias.routes.js'; 
import gruposRoutes from './routes/grupos.routes.js';
import ofertaAcademicaRoutes from './routes/ofertaAcademica.routes.js';
import checadorDocenteRoutes from './routes/checadorDocente.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadsPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",             
    "https://checadorusag.com.mx"       
  ],
  credentials: true
}));

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/uploads", express.static(uploadsPath));


app.use("/api", authRoutes);        
app.use("/api", directivoAuthRoutes); 

app.use("/api", taskRoutes);
app.use("/api", employeesRoutes);
app.use("/api/tipohorarios", tipohorariosRoutes);
app.use("/api", plantelesRoutes);
app.use("/api", checadaRoutes);

app.use('/api', docentesRoutes);
app.use('/api', materiasRoutes);
app.use('/api', gruposRoutes);
app.use('/api', ofertaAcademicaRoutes);
app.use('/api', checadorDocenteRoutes);

app.post("/api/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se envió ningún archivo" });
  }
  res.json({ message: "Archivo subido correctamente", filename: req.file.filename });
});

export default app;