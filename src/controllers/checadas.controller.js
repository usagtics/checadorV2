import  Checada  from "../models/checadas.model.js";
import Plantel from "../models/planteles.model.js";
import dayjs from "dayjs";
import Empleado from "../models/empleados.model.js"; 

// ==========================================
// 1. REGISTRAR CHECADA (CON LÓGICA DE 15/20 MINUTOS)
// ==========================================
export const registrarChecada = async (req, res) => {
  try {
    console.log("\n--- INICIANDO REGISTRO DE CHECADA ---");
    
    const { plantelId, empleadoId } = req.body;
    const fotoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!plantelId || !empleadoId) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const plantel = await Plantel.findById(plantelId);
    if (!plantel) return res.status(400).json({ message: "Plantel no encontrado." });

    // --- VALIDACIÓN IP ---
    let ipDetectada = req.headers['x-client-ip'] || 
                      req.headers['x-original-forwarded-for'] || 
                      req.headers['x-forwarded-for'] || 
                      req.headers['x-real-ip'] ||
                      req.socket.remoteAddress || 
                      "NO_DETECTADA";
    
    // Limpieza básica de IP
    let ipUsuario = String(ipDetectada).replace('::ffff:', '').split(',')[0].trim();
    
    const ipsPermitidas = (plantel.ipsPermitidas && Array.isArray(plantel.ipsPermitidas)) ? plantel.ipsPermitidas : [];
    
    // Si hay IPs configuradas, validamos
    if (ipsPermitidas.length > 0) {
        if (!ipsPermitidas.includes(ipUsuario)) {
            console.log(`⛔ IP Rechazada: ${ipUsuario}. Permitidas: ${ipsPermitidas}`);
            return res.status(403).json({ 
                message: `Acceso denegado. Tu IP (${ipUsuario}) no corresponde al WiFi de la institución.` 
            });
        }
    }

    // --- BUSCAR EMPLEADO ---
    const empleado = await Empleado.findById(empleadoId).populate("tipoHorario");
    if (!empleado) return res.status(400).json({ message: "Empleado no encontrado." });
    if (!empleado.tipoHorario) return res.status(400).json({ message: "El empleado no tiene horario asignado." });

    const hoy = dayjs();
    const ahora = dayjs();
    let tipo = "entrada";

    // Validar si ya checó entrada
    const existeEntradaHoy = await Checada.findOne({
      empleado: empleadoId,
      tipo: "entrada",
      hora: {
        $gte: hoy.startOf("day").toDate(),
        $lt: hoy.endOf("day").toDate(),
      },
    });

    if (existeEntradaHoy) {
      tipo = "salida";
      const existeSalida = await Checada.findOne({
        empleado: empleadoId,
        tipo: "salida",
        hora: {
          $gte: hoy.startOf("day").toDate(),
          $lt: hoy.endOf("day").toDate(),
        },
      });

      if (existeSalida) {
        return res.status(400).json({ message: "Ya registraste entrada y salida hoy." });
      }
    }

    // VARIABLES PARA EL REPORTE
    let tarde = false;
    let status = "Asistencia"; // Valor por defecto

    // 🕒 LÓGICA DE RETARDOS
    if (tipo === "entrada") {
        // Intentamos leer la hora de entrada de ambas formas posibles
        const entradaStr = empleado.tipoHorario.hora_entrada || empleado.tipoHorario.entrada;
        
        console.log(`🕒 Horario asignado al empleado: "${entradaStr}"`);

        if (entradaStr) {
            const [h, m] = entradaStr.split(":");
            
            // Creamos la fecha de hoy con la hora del horario
            const horaEntrada = dayjs().set("hour", Number(h)).set("minute", Number(m)).set("second", 0);
            
            // Calculamos diferencia en minutos
            const diferenciaMinutos = ahora.diff(horaEntrada, 'minute');

            console.log(`📊 CÁLCULO DE TIEMPO:`);
            console.log(`   - Hora Entrada Ideal: ${horaEntrada.format('HH:mm:ss')}`);
            console.log(`   - Hora Checada Real:  ${ahora.format('HH:mm:ss')}`);
            console.log(`   - Diferencia Minutos: ${diferenciaMinutos}`);

            if (diferenciaMinutos <= 15) {
                // De 0 a 15 min tarde (o llegó antes, negativos)
                status = "Asistencia";
                tarde = false;
                console.log("   -> Resultado: ASISTENCIA (A tiempo)");
            } else if (diferenciaMinutos > 15 && diferenciaMinutos <= 20) {
                // De 16 a 20 min tarde
                status = "Retardo";
                tarde = true;
                console.log("   -> Resultado: RETARDO (Tolerancia media)");
            } else if (diferenciaMinutos > 20) {
                // Más de 20 min tarde
                status = "Falta";
                tarde = true; 
                console.log("   -> Resultado: FALTA (Excedió tolerancia)");
            }
        } else {
            console.log("⚠️ ALERTA: No se encontró la hora de entrada en el objeto tipoHorario.");
            // Opcional: Marcar como error de datos
            status = "Sin Horario";
        }
    }
    
    if (tipo === "salida") {
       status = "Salida Registrada";
       // Aquí podrías agregar lógica de salida anticipada si quisieras
    }

    // Guardar en BD
    const nuevaChecada = await Checada.create({
      empleado: empleadoId,
      tipo,
      plantel: plantelId,
      tarde,
      status, 
      hora: ahora.toDate(),
      tipoHorario: empleado.tipoHorario._id,
      ipRegistrada: ipUsuario,
      fotoUrl,
    });

    console.log(`✅ Checada guardada con éxito. Estatus final: ${status}`);

    return res.status(201).json({
      message: `Checada registrada: ${status}`,
      checada: nuevaChecada,
    });

  } catch (error) {
    console.error("❌ Error fatal al registrar checada:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};
// ==========================================
// 2. LISTAR CHECADAS (CON STATUS)
// ==========================================
export const listarChecadas = async (req, res) => {
  const { id } = req.params;
  try {
    const checadas = await Checada.find({ empleado: id })
      .sort({ hora: -1 })
      .populate({
        path: "empleado",
        select: "name email tipoHorario",
        populate: {
          path: "tipoHorario",
          select: "nombre entrada salida",
        },
      })
      .populate({
        path: "plantel", 
        select: "nombre",
      }); // Aquí ya te trae el nombre del plantel

    res.json(checadas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener checadas" });
  }
};

// ==========================================
// 3. GENERAR REPORTE (CON PLANTEL Y STATUS)
// ==========================================
export const generarReporteChecadas = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, empleadoId, plantelId } = req.query;
    
        const filtros = {};
    
        if (fechaInicio && fechaFin) {
          // Ajustar fechas para cubrir todo el día
          const start = new Date(fechaInicio); start.setHours(0,0,0,0);
          const end = new Date(fechaFin); end.setHours(23,59,59,999);
          
          filtros.hora = { $gte: start, $lte: end };
        }
    
        if (empleadoId && empleadoId !== "") filtros.empleado = empleadoId;
        if (plantelId && plantelId !== "") filtros.plantel = plantelId;
    
        const checadas = await Checada.find(filtros)
          .sort({ hora: 1 })
          .populate({
            path: 'empleado',  
            select: 'name email tipoHorario',  
            populate: {
              path: 'tipoHorario',  
              select: 'nombre entrada salida', 
            },
          })
          .populate({
            path: 'plantel',
            select: 'nombre direccion', // Nos aseguramos de traer el nombre del campus
          });
        
        // El resultado 'checadas' ya incluirá:
        // 1. checada.plantel.nombre (El campus)
        // 2. checada.status (Asistencia, Retardo, Falta)
        // 3. checada.hora (La hora exacta)

        res.status(200).json({ checadas });
      } catch (error) {
        console.error("Error al generar reporte de checadas:", error);
        res.status(500).json({ message: "Error al generar reporte", error: error.message });
      }
};


export const obtenerEstadisticasHoy = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    let inicio, fin;

    // Configuración de fechas del filtro principal
    if (fechaInicio && fechaFin) {
      inicio = dayjs(fechaInicio).startOf('day').toDate();
      fin = dayjs(fechaFin).endOf('day').toDate();
    } else {
      inicio = dayjs().startOf('day').toDate();
      fin = dayjs().endOf('day').toDate();
    }

    const filtroBase = {
      tipo: 'entrada',
      hora: { $gte: inicio, $lte: fin }
    };

    // 1. Contadores Globales
    const asistencias = await Checada.countDocuments({ ...filtroBase, status: 'Asistencia' });
    const retardos = await Checada.countDocuments({ ...filtroBase, status: 'Retardo' });
    const faltas = await Checada.countDocuments({ ...filtroBase, status: 'Falta' });

    // 2. Desglose por Plantel
    const todosLosPlanteles = await Plantel.find({}, 'nombre _id');
    const statsChecadas = await Checada.aggregate([
        { $match: filtroBase },
        {
            $group: {
                _id: "$plantel",
                asistencias: { $sum: { $cond: [{ $eq: ["$status", "Asistencia"] }, 1, 0] } },
                retardos: { $sum: { $cond: [{ $eq: ["$status", "Retardo"] }, 1, 0] } },
                faltas: { $sum: { $cond: [{ $eq: ["$status", "Falta"] }, 1, 0] } },
                total: { $sum: 1 }
            }
        }
    ]);

    const porPlantel = todosLosPlanteles.map(plantel => {
        const datos = statsChecadas.find(s => String(s._id) === String(plantel._id));
        return {
            nombre: plantel.nombre,
            asistencias: datos ? datos.asistencias : 0,
            retardos: datos ? datos.retardos : 0,
            faltas: datos ? datos.faltas : 0,
            total: datos ? datos.total : 0
        };
    });

    // 3. Historial Por Mes (Del año en curso)
    const inicioAnio = dayjs(inicio).startOf('year').toDate();
    const finAnio = dayjs(inicio).endOf('year').toDate();

    const historialMensual = await Checada.aggregate([
        { 
            $match: { 
                tipo: 'entrada',
                hora: { $gte: inicioAnio, $lte: finAnio }
            } 
        },
        {
            $group: {
                _id: { $month: "$hora" },
                total: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const datosPorMes = nombresMeses.map((nombre, index) => {
        const mesNumero = index + 1;
        const datos = historialMensual.find(m => m._id === mesNumero);
        return {
            mes: nombre,
            total: datos ? datos.total : 0
        };
    });

    // ======================================================
    // 4. NUEVO: TOP INCIDENCIAS (FALTAS Y RETARDOS)
    // ======================================================
    // Esto es lo que faltaba para el widget de la derecha
    const topRetardos = await Checada.aggregate([
      {
        $match: {
          tipo: 'entrada',
          hora: { $gte: inicio, $lte: fin }, // Respetamos el filtro de fecha seleccionado
status: { $in: ["Retardo", "Falta"] }
        }
      },
      {
        $group: {
          _id: "$empleado", // Agrupamos por ID de empleado
          total: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }, // Orden descendente
      { $limit: 5 }, // Top 5
      {
        $lookup: {
          from: "employees", // <--- CAMBIO: De "empleados" a "employees"
          localField: "_id", // El ID del empleado en la colección Checadas
          foreignField: "_id", // El ID en la colección Employees
          as: "datosEmpleado"
        }
      },
      { $unwind: "$datosEmpleado" },
      {
        $project: {
          // Mapeamos los campos para que el Frontend los entienda
          nombre: "$datosEmpleado.name", // OJO: En 'listarChecadas' usas .name, ajusta si es .nombre
          apellidos: "$datosEmpleado.apellidos", // Si existe
          departamento: "$datosEmpleado.departamento",
          total: 1
        }
      }
    ]);

    res.json({
      asistencias,
      retardos,
      faltas,
      porPlantel,
      porMes: datosPorMes,
      topRetardos, // <--- Enviamos el array al frontend
      rango: { inicio, fin }
    });

  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error al cargar estadísticas" });
  }
};