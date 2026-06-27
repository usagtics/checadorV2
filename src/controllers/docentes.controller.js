import Docente from '../models/docentes.model.js';
import OfertaAcademica from '../models/ofertaAcademica.model.js'; 
import AsistenciaDocente from '../models/asistenciaDocente.model.js';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; 
import { TOKEN_SECRET } from '../config.js'; 
import { createAccessToken } from '../libs/jwt.js';

// Función auxiliar para calcular asistencias del mes
const obtenerAsistenciaMes = async (docenteId) => {
    const fechaInicioMes = new Date();
    fechaInicioMes.setDate(1); 
    fechaInicioMes.setHours(0, 0, 0, 0);

    const historial = await AsistenciaDocente.find({
        docente: docenteId,
        fecha: { $gte: fechaInicioMes }
    })
    .populate('materia')
    .sort({ fecha: -1 }); 

    let horasTotales = 0;
    let entradaTemporal = null;

    const historialParaCalculo = [...historial].reverse();

    historialParaCalculo.forEach(registro => {
        if (registro.tipoRegistro === 'Entrada') {
            entradaTemporal = registro.fecha;
        } else if (registro.tipoRegistro === 'Salida' && entradaTemporal) {
            const diferenciaMs = registro.fecha - entradaTemporal;
            const horas = diferenciaMs / (1000 * 60 * 60);
            horasTotales += horas;
            entradaTemporal = null;
        }
    });

    return {
        horasAcumuladas: Math.round(horasTotales * 10) / 10,
        historialDetallado: historial 
    };
};

// Login de Docentes
export const loginDocente = async (req, res) => {
    const { username, password } = req.body;
    try {
        const docenteFound = await Docente.findOne({ username });
        if (!docenteFound) return res.status(400).json(["Docente no encontrado"]);

        const isMatch = await bcrypt.compare(password, docenteFound.password);
        if (!isMatch) return res.status(400).json(["Contraseña incorrecta"]);

        const token = await createAccessToken({ id: docenteFound._id, role: 'docente' });

        const ofertas = await OfertaAcademica.find({ docente: docenteFound._id }).populate('materia');
        const materiasUnicas = [];
        const nombresAgregados = new Set();
        
        ofertas.forEach(oferta => {
            if (oferta.materia && !nombresAgregados.has(oferta.materia.nombre)) {
                nombresAgregados.add(oferta.materia.nombre);
                materiasUnicas.push(oferta.materia);
            }
        });

        const datosAsistencia = await obtenerAsistenciaMes(docenteFound._id);

        res.cookie('token', token);
        res.json({
            id: docenteFound._id,
            nombre: docenteFound.nombre,
            apellidos: docenteFound.apellidos,
            numeroEmpleado: docenteFound.numeroEmpleado,
            email: docenteFound.email,
            turno: docenteFound.turno,
            qrCode: docenteFound.qrCode,
            role: 'docente',
            materias: materiasUnicas,
            horasAcumuladas: datosAsistencia.horasAcumuladas,
            historialAsistencias: datosAsistencia.historialDetallado 
        });
    } catch (error) {
        console.log("❌ ERROR EN LOGIN DOCENTE:", error);
        res.status(500).json([error.message]); 
    }
};

// Crear nuevo Docente
export const crearDocente = async (req, res) => {
    try {
        const { 
            nombre, apellidos, numeroEmpleado, email, 
            pagoHoraMatutino, pagoHoraSabatino, pagoHoraLinea, 
            metodoPago, turno, username, password 
        } = req.body;
        
        const docenteExistente = await Docente.findOne({ $or: [{ numeroEmpleado }, { email }, { username }] });
        if (docenteExistente) return res.status(400).json({ message: ['El docente ya existe (email, usuario o nómina duplicado)'] });
        
        const passwordHash = await bcrypt.hash(password, 10);
        
        const qrCodeImage = await QRCode.toDataURL(numeroEmpleado); 
        
        const nuevoDocente = new Docente({ 
            nombre, apellidos, numeroEmpleado, email, username, 
            password: passwordHash, 
            pagoHoraMatutino, pagoHoraSabatino, pagoHoraLinea, 
            metodoPago, turno, 
            qrCode: qrCodeImage 
        });
        
        const docenteGuardado = await nuevoDocente.save();
        res.status(201).json(docenteGuardado);
    } catch (error) { 
        console.error("❌ ERROR AL CREAR DOCENTE:", error);
        res.status(500).json({ message: ['Error al procesar el registro'] }); 
    }
};

// Verificar Token del Docente
export const verifyDocenteToken = async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: "No autorizado" });

    jwt.verify(token, TOKEN_SECRET, async (err, user) => {
        if (err) return res.status(401).json({ message: "No autorizado" });

        const docenteFound = await Docente.findById(user.id);
        if (!docenteFound) return res.status(401).json({ message: "No autorizado" });

        const ofertas = await OfertaAcademica.find({ docente: docenteFound._id }).populate('materia');
        const materiasUnicas = [];
        const nombresAgregados = new Set();
        
        ofertas.forEach(oferta => {
            if (oferta.materia && !nombresAgregados.has(oferta.materia.nombre)) {
                nombresAgregados.add(oferta.materia.nombre);
                materiasUnicas.push(oferta.materia);
            }
        });

        const datosAsistencia = await obtenerAsistenciaMes(docenteFound._id);

        return res.json({
            id: docenteFound._id,
            nombre: docenteFound.nombre,
            apellidos: docenteFound.apellidos,
            numeroEmpleado: docenteFound.numeroEmpleado, 
            email: docenteFound.email,
            turno: docenteFound.turno, 
            qrCode: docenteFound.qrCode, 
            role: 'docente',
            materias: materiasUnicas,
            horasAcumuladas: datosAsistencia.horasAcumuladas,
            historialAsistencias: datosAsistencia.historialDetallado 
        });
    });
};

// OBTENER TODOS LOS DOCENTES (CON LA CORRECCIÓN DEL POPULATE)
export const obtenerDocentes = async (req, res) => {
    try {
        const docentes = await Docente.find().lean();
        
        // CORRECCIÓN AQUÍ: Se añade .populate('periodo') para resolver el "Sin definir"
        const ofertas = await OfertaAcademica.find()
            .populate('materia')
            .populate('grupo')
            .populate('periodo') 
            .lean();
        
        const docentesConMaterias = docentes.map(docente => {
            const susOfertas = ofertas.filter(o => o.docente && o.docente.toString() === docente._id.toString());
            
            const materiasUnicas = [];
            const nombresAgregados = new Set();
            susOfertas.forEach(o => {
                if (o.materia && !nombresAgregados.has(o.materia.nombre)) { 
                    nombresAgregados.add(o.materia.nombre); 
                    materiasUnicas.push(o.materia); 
                }
            });
            
            return { 
                ...docente, 
                materias: materiasUnicas, 
                ofertaAcademica: susOfertas 
            };
        });
        
        res.json(docentesConMaterias);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

// Obtener un solo Docente por ID
export const obtenerDocente = async (req, res) => {
    try {
        const docente = await Docente.findById(req.params.id);
        if (!docente) return res.status(404).json({ message: 'No encontrado' });
        res.json(docente);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Actualizar un Docente
export const actualizarDocente = async (req, res) => {
    try {
        const data = { ...req.body };

        if (data.password && data.password.trim() !== "") {
            data.password = await bcrypt.hash(data.password, 10);
        } else {
            delete data.password;
        }

        const docenteActualizado = await Docente.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(docenteActualizado);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Eliminar un Docente
export const eliminarDocente = async (req, res) => {
    try {
        await Docente.findByIdAndDelete(req.params.id);
        res.json({ message: 'Eliminado con éxito' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Logout Docente
export const logoutDocente = (req, res) => {
    res.cookie('token', "", { expires: new Date(0) });
    return res.sendStatus(200);
};