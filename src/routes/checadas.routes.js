import express from "express";
import multer from "multer";
import path from "path";
// 👇 1. AGREGAMOS "obtenerEstadisticasHoy" AQUI
import { 
    registrarChecada, 
    listarChecadas, 
    generarReporteChecadas, 
    obtenerEstadisticasHoy 
} from "../controllers/checadas.controller.js";

const router = express.Router();

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 👇 2. AGREGAMOS ESTA RUTA NUEVA (MUY IMPORTANTE: Antes de /checadas/:id)
// Si la pones abajo de :id, Express creerá que "stats" es un ID de usuario y fallará.
router.get("/checadas/stats", obtenerEstadisticasHoy);

// Registrar checada con foto
router.post("/checadas", upload.single("foto"), registrarChecada);

// Listar checadas por ID de empleado
router.get("/checadas/:id", listarChecadas);

router.get("/reporte", generarReporteChecadas);

export default router;