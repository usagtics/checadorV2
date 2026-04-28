import Docente from '../models/docentes.model.js';
import OfertaAcademica from '../models/ofertaAcademica.model.js';
import AsistenciaDocente from '../models/asistenciaDocente.model.js';

const convertirHoraAMinutos = (horaString) => {
    const [horas, minutos] = horaString.split(':').map(Number);
    return horas * 60 + minutos;
};

export const registrarAsistenciaQR = async (req, res) => {
    try {
        let { numeroEmpleado } = req.body;

        // 1. LIMPIEZA DE DATOS
        if (numeroEmpleado && typeof numeroEmpleado === 'object' && numeroEmpleado.numeroEmpleado) {
            numeroEmpleado = numeroEmpleado.numeroEmpleado;
        }
        numeroEmpleado = numeroEmpleado ? String(numeroEmpleado).trim() : null;

        if (!numeroEmpleado) {
            return res.status(400).json({ message: 'No se recibió un código QR válido.' });
        }

        // 2. BÚSQUEDA DEL DOCENTE
        const docente = await Docente.findOne({ 
            numeroEmpleado: { $regex: new RegExp(`^${numeroEmpleado}$`, 'i') } 
        });
        
        if (!docente) {
            return res.status(404).json({ message: 'Docente no encontrado.' });
        }

        // 3. DATOS DE TIEMPO Y LIMITES DEL DÍA
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const fechaActual = new Date();
        const diaHoy = diasSemana[fechaActual.getDay()];
        const horaActualMinutos = fechaActual.getHours() * 60 + fechaActual.getMinutes();
        
        // Bloqueamos exactamente desde las 00:00:00 hasta las 23:59:59 de hoy
        const inicioDia = new Date();
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date();
        finDia.setHours(23, 59, 59, 999);


        // ==========================================
        // 4. NUEVO: BUSCAR LA PRIMERA CLASE DEL DÍA (BLOQUE)
        // ==========================================
        const clasesAsignadas = await OfertaAcademica.find({ docente: docente._id })
            .populate('materia')
            .populate('grupo');

        let primeraClaseHoy = null;
        let primerHorarioHoy = null;
        let menorHoraInicio = 9999; // Número grande para encontrar la más temprana

        // Buscamos la clase que empiece más temprano hoy
        for (const oferta of clasesAsignadas) {
            const horarioHoy = oferta.horarios.find(h => h.diaSemana === diaHoy);
            
            if (horarioHoy) {
                const inicioMinutos = convertirHoraAMinutos(horarioHoy.horaInicio);
                
                if (inicioMinutos < menorHoraInicio) {
                    menorHoraInicio = inicioMinutos;
                    primeraClaseHoy = oferta;
                    primerHorarioHoy = horarioHoy;
                }
            }
        }

        // Si no tiene clases programadas para hoy
        if (!primeraClaseHoy) {
            return res.status(400).json({ message: `No tienes clases asignadas para el día de hoy (${diaHoy}).` });
        }


        // ==========================================
        // 5. VALIDACIÓN EXACTA Y REGISTRO (Usando 'fecha' y 'tipoRegistro')
        // ==========================================
        
        // Contamos las entradas de HOY
        const totalEntradasHoy = await AsistenciaDocente.countDocuments({
            docente: docente._id,
            tipoRegistro: 'Entrada', 
            fecha: { $gte: inicioDia, $lte: finDia }
        });

        // Buscamos el último registro de HOY
        const ultimaChecada = await AsistenciaDocente.findOne({
            docente: docente._id,
            fecha: { $gte: inicioDia, $lte: finDia }
        }).sort({ fecha: -1 }); 

        const horaEscaneo = new Date(); 

        // --- LÓGICA DE DECISIÓN ---

        // CASO A: TOCA REGISTRAR ENTRADA
        if (!ultimaChecada || ultimaChecada.tipoRegistro === 'Salida') {
            
            // EL BLOQUEO: YA TIENE 2 ENTRADAS
            if (totalEntradasHoy >= 2) {
                return res.status(400).json({ 
                    message: `Límite excedido: Ya registraste tus 2 entradas de hoy. No puedes checar más veces.` 
                });
            }

            // REGISTRO DE ENTRADA (Calculando puntualidad según su PRIMERA clase)
            const inicioClaseMinutos = convertirHoraAMinutos(primerHorarioHoy.horaInicio);
            let estatusCalculado = 'A tiempo';
            if (horaActualMinutos > (inicioClaseMinutos + 30)) estatusCalculado = 'Falta';
            else if (horaActualMinutos > (inicioClaseMinutos + 15)) estatusCalculado = 'Retardo';

            const nuevaEntrada = new AsistenciaDocente({
                docente: docente._id,
                materia: primeraClaseHoy.materia._id, // Relacionamos con su primera clase
                grupo: primeraClaseHoy.grupo._id,
                tipoRegistro: 'Entrada', 
                fecha: horaEscaneo, 
                estatus: estatusCalculado
            });
            await nuevaEntrada.save();

            return res.status(200).json({
                message: `Entrada #${totalEntradasHoy + 1} de 2 registrada.`,
                docente: `${docente.nombre} ${docente.apellidos}`,
                clase: primeraClaseHoy.materia.nombre, // Mostramos la materia de su primera clase
                tipo: 'Entrada',
                estatus: estatusCalculado
            });

        } else {
            // CASO B: TOCA REGISTRAR SALIDA
            const diferenciaMinutos = (horaEscaneo - ultimaChecada.fecha) / (1000 * 60);

            // ERROR: INTENTO DE SALIDA MUY PRONTO (20 min de bloqueo por seguridad)
            if (diferenciaMinutos < 20) {
                const faltan = Math.ceil(20 - diferenciaMinutos);
                return res.status(400).json({ 
                    message: `Debes esperar ${faltan} minutos más para poder marcar tu salida.` 
                });
            }

            // REGISTRO DE SALIDA
            const nuevaSalida = new AsistenciaDocente({
                docente: docente._id,
                materia: primeraClaseHoy.materia._id, 
                grupo: primeraClaseHoy.grupo._id,
                tipoRegistro: 'Salida', 
                fecha: horaEscaneo, 
                estatus: 'A tiempo'
            });
            await nuevaSalida.save();

            return res.status(200).json({
                message: `Salida registrada exitosamente.`,
                docente: `${docente.nombre} ${docente.apellidos}`,
                tipo: 'Salida',
                estatus: 'A tiempo'
            });
            
        }

    } catch (error) {
        console.error("❌ Error en servidor:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
export const obtenerTodasLasAsistencias = async (req, res) => {
    try {
   
        const asistencias = await AsistenciaDocente.find()
            .populate('docente', 'nombre apellidos numeroEmpleado turno')
            .populate('materia', 'nombre')
            .populate('grupo', 'nombre')
            .sort({ fecha: -1 }); 

        res.status(200).json(asistencias);
    } catch (error) {
        console.error("❌ Error al obtener el reporte de checadas:", error);
        res.status(500).json({ message: 'Error interno al obtener las asistencias.' });
    }
};


export const getNominaDetalle = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        // 1. Buscamos todas las checadas en esa semana exacta
        // Le agregamos la hora 00:00:00 al inicio y 23:59:59 al fin para no perder ningún registro
        const asistencias = await AsistenciaDocente.find({
            fecha: { 
                $gte: new Date(`${fechaInicio}T00:00:00.000Z`), 
                $lte: new Date(`${fechaFin}T23:59:59.999Z`) 
            }
        }).populate('docente materia grupo').sort({ fecha: 1 });

        const emparejamiento = {};
        const nomina = {};

        // 2. Emparejamos "Entradas" con "Salidas" del mismo día y mismo profe
        asistencias.forEach(registro => {
            if (!registro.docente) return;
            
            const docenteId = registro.docente._id.toString();
            const fechaCorta = registro.fecha.toISOString().split('T')[0];
            const llaveUnica = `${docenteId}_${fechaCorta}`; 

            if (!emparejamiento[llaveUnica]) {
                emparejamiento[llaveUnica] = { 
                    entrada: null, 
                    salida: null, 
                    docente: registro.docente, 
                    grupo: registro.grupo,
                    materia: registro.materia
                };
            }

            if (registro.tipoRegistro === 'Entrada') emparejamiento[llaveUnica].entrada = registro.fecha;
            if (registro.tipoRegistro === 'Salida') emparejamiento[llaveUnica].salida = registro.fecha;
        });

        for (const par of Object.values(emparejamiento)) {
            const docenteId = par.docente._id.toString();
            
            // Si es la primera vez que procesamos a este profe, le creamos su "recibo" en blanco
            if (!nomina[docenteId]) {
                nomina[docenteId] = {
                    nombre: `${par.docente.nombre} ${par.docente.apellidos}`,
                    horasSabatinas: 0,
                    horasMatutinas: 0,
                    horasLinea: 0,
                    metodoPago: par.docente.metodoPago || "TARJETA",
                    total: 0
                };
            }

            if (par.entrada && par.salida) {
                
                let turnoAsignado = null;
                
                if (par.materia && par.grupo) {
                     const oferta = await OfertaAcademica.findOne({
                         docente: par.docente._id,
                         materia: par.materia._id,
                         grupo: par.grupo._id
                     });
                     if (oferta) {
                         turnoAsignado = oferta.turno;
                     }
                }

                const horas = (new Date(par.salida) - new Date(par.entrada)) / (1000 * 60 * 60);
                
                const turnoFinal = turnoAsignado || par.grupo?.turno || par.docente.turno;

                if (turnoFinal === 'Sabatino') {
                    nomina[docenteId].horasSabatinas += horas;
                    nomina[docenteId].total += (horas * (par.docente.pagoHoraSabatino || 200));
                } else if (turnoFinal === 'Virtual' || turnoFinal === 'Línea') {
                    nomina[docenteId].horasLinea += horas;
                    nomina[docenteId].total += (horas * (par.docente.pagoHoraLinea || 250));
                } else {
                    nomina[docenteId].horasMatutinas += horas;
                    nomina[docenteId].total += (horas * (par.docente.pagoHoraMatutino || 200));
                }
            }
        }

        res.json(Object.values(nomina));
    } catch (error) {
        console.error("❌ Error interno al calcular nómina:", error);
        res.status(500).json({ message: "Error al calcular nómina" });
    }
};