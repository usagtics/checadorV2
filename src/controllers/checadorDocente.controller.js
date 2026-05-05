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

        if (numeroEmpleado && typeof numeroEmpleado === 'object' && numeroEmpleado.numeroEmpleado) {
            numeroEmpleado = numeroEmpleado.numeroEmpleado;
        }
        numeroEmpleado = numeroEmpleado ? String(numeroEmpleado).trim() : null;

        if (!numeroEmpleado) {
            return res.status(400).json({ message: 'No se recibió un código QR válido.' });
        }

        const docente = await Docente.findOne({ 
            numeroEmpleado: { $regex: new RegExp(`^${numeroEmpleado}$`, 'i') } 
        });
        
        if (!docente) {
            return res.status(404).json({ message: 'Docente no encontrado.' });
        }

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const fechaActual = new Date();
        const diaHoy = diasSemana[fechaActual.getDay()];
        const horaActualMinutos = fechaActual.getHours() * 60 + fechaActual.getMinutes();
        
        const inicioDia = new Date();
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date();
        finDia.setHours(23, 59, 59, 999);


        const clasesAsignadas = await OfertaAcademica.find({ docente: docente._id })
            .populate('materia')
            .populate('grupo');

        let primeraClaseHoy = null;
        let primerHorarioHoy = null;
        let menorHoraInicio = 9999; 
        let mayorHoraFin = 0; 
        
        let nombresMateriasHoy = [];

        for (const oferta of clasesAsignadas) {
            const horarioHoy = oferta.horarios.find(h => h.diaSemana === diaHoy);
            
            if (horarioHoy) {
                if (oferta.materia && oferta.materia.nombre) {
                    nombresMateriasHoy.push(oferta.materia.nombre);
                }

                const inicioMinutos = convertirHoraAMinutos(horarioHoy.horaInicio);
                const finMinutos = convertirHoraAMinutos(horarioHoy.horaFin);
                
                if (inicioMinutos < menorHoraInicio) {
                    menorHoraInicio = inicioMinutos;
                    primeraClaseHoy = oferta;
                    primerHorarioHoy = horarioHoy;
                }
                
                if (finMinutos > mayorHoraFin) {
                    mayorHoraFin = finMinutos;
                }
            }
        }

        if (!primeraClaseHoy) {
            return res.status(400).json({ message: `No tienes clases asignadas para el día de hoy (${diaHoy}).` });
        }

   
        const limiteTemprano = menorHoraInicio - 60; 
        const limiteTarde = mayorHoraFin + 120; 

        if (horaActualMinutos < limiteTemprano) {
            return res.status(400).json({ 
                message: `Demasiado temprano. Tu primera clase comienza a las ${primerHorarioHoy.horaInicio}.` 
            });
        }

        if (horaActualMinutos > limiteTarde) {
            const hFin = Math.floor(mayorHoraFin / 60);
            const mFin = mayorHoraFin % 60;
            const horaFinFormato = `${String(hFin).padStart(2, '0')}:${String(mFin).padStart(2, '0')}`;
            
            return res.status(400).json({ 
                message: `Tu jornada finalizó a las ${horaFinFormato}. Fuera de horario permitido.` 
            });
        }

        const bloqueMateriasString = [...new Set(nombresMateriasHoy)].join(' / ');
        
        const totalEntradasHoy = await AsistenciaDocente.countDocuments({
            docente: docente._id,
            tipoRegistro: 'Entrada', 
            fecha: { $gte: inicioDia, $lte: finDia }
        });

        const ultimaChecada = await AsistenciaDocente.findOne({
            docente: docente._id,
            fecha: { $gte: inicioDia, $lte: finDia }
        }).sort({ fecha: -1 }); 

        const horaEscaneo = new Date(); 

        if (!ultimaChecada || ultimaChecada.tipoRegistro === 'Salida') {
            
            if (totalEntradasHoy >= 2) {
                return res.status(400).json({ 
                    message: `Límite excedido: Ya registraste tus 2 entradas de hoy. No puedes checar más veces.` 
                });
            }

            const inicioClaseMinutos = convertirHoraAMinutos(primerHorarioHoy.horaInicio);
            let estatusCalculado = 'A tiempo';
            if (horaActualMinutos > (inicioClaseMinutos + 30)) estatusCalculado = 'Falta';
            else if (horaActualMinutos > (inicioClaseMinutos + 15)) estatusCalculado = 'Retardo';

            const nuevaEntrada = new AsistenciaDocente({
                docente: docente._id,
                materia: primeraClaseHoy.materia._id, 
                grupo: primeraClaseHoy.grupo._id,
                tipoRegistro: 'Entrada', 
                fecha: horaEscaneo, 
                estatus: estatusCalculado
            });
            await nuevaEntrada.save();

            return res.status(200).json({
                message: `Entrada registrada. Jornada: ${bloqueMateriasString}`,
                docente: `${docente.nombre} ${docente.apellidos}`,
                clase: bloqueMateriasString, 
                tipo: 'Entrada',
                estatus: estatusCalculado
            });

        } else {
            const diferenciaMinutos = (horaEscaneo - ultimaChecada.fecha) / (1000 * 60);

            if (diferenciaMinutos < 20) {
                const faltan = Math.ceil(20 - diferenciaMinutos);
                return res.status(400).json({ 
                    message: `Debes esperar ${faltan} minutos más para poder marcar tu salida.` 
                });
            }

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
        const asistenciasBrutas = await AsistenciaDocente.find()
            .populate('docente', 'nombre apellidos numeroEmpleado turno')
            .populate('materia', 'nombre')
            .populate('grupo', 'nombre')
            .sort({ fecha: -1 })
            .lean(); 

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        const asistenciasProcesadas = await Promise.all(asistenciasBrutas.map(async (asistencia) => {
            if (!asistencia.docente) return asistencia;

            const diaChecada = diasSemana[new Date(asistencia.fecha).getDay()];
            const clases = await OfertaAcademica.find({ docente: asistencia.docente._id }).populate('materia');
            
            const materiasDelDia = [];
            clases.forEach(clase => {
                const tieneClaseHoy = clase.horarios.some(h => h.diaSemana === diaChecada);
                if (tieneClaseHoy && clase.materia && clase.materia.nombre) {
                    materiasDelDia.push(clase.materia.nombre);
                }
            });

            const materiasUnicas = [...new Set(materiasDelDia)].join(' / ');

            return {
                ...asistencia,
                materia: {
                    ...asistencia.materia,
                    nombre: materiasUnicas || (asistencia.materia?.nombre || 'Jornada')
                }
            };
        }));

        res.status(200).json(asistenciasProcesadas);
    } catch (error) {
        console.error("Error al obtener el reporte de checadas:", error);
        res.status(500).json({ message: 'Error interno al obtener las asistencias.' });
    }
};

const crearFechaConHora = (fechaBase, horaString) => {
    const [horas, minutos] = horaString.split(':').map(Number);
    const nuevaFecha = new Date(fechaBase);
    nuevaFecha.setHours(horas, minutos, 0, 0);
    return nuevaFecha;
};
export const getNominaDetalle = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        const asistencias = await AsistenciaDocente.find({
            fecha: { 
                $gte: new Date(`${fechaInicio}T00:00:00.000Z`), 
                $lte: new Date(`${fechaFin}T23:59:59.999Z`) 
            }
        }).populate('docente grupo').sort({ fecha: 1 });

        const emparejamiento = {};
        const nomina = {};

        asistencias.forEach(registro => {
            if (!registro.docente) return;
            
            const docenteId = registro.docente._id.toString();
            const fechaCorta = registro.fecha.toLocaleDateString('en-CA'); 
            const llaveUnica = `${docenteId}_${fechaCorta}`; 

            if (!emparejamiento[llaveUnica]) {
                emparejamiento[llaveUnica] = { 
                    entrada: null, 
                    salida: null, 
                    docente: registro.docente,
                    fechaFisica: registro.fecha 
                };
            }

            if (registro.tipoRegistro === 'Entrada' && !emparejamiento[llaveUnica].entrada) {
                emparejamiento[llaveUnica].entrada = registro.fecha;
            }
            if (registro.tipoRegistro === 'Salida') {
                emparejamiento[llaveUnica].salida = registro.fecha;
            }
        });

    
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        const paresValores = Object.values(emparejamiento);
        
        for (let i = 0; i < paresValores.length; i++) {
            const par = paresValores[i];
            const docenteId = par.docente._id.toString();
            
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

            if (par.entrada && par.salida && par.entrada < par.salida) {
                const diaDeLaSemana = diasSemana[par.fechaFisica.getDay()];

                const clasesAsignadas = await OfertaAcademica.find({ docente: par.docente._id })
                    .populate('materia grupo');

                for (let j = 0; j < clasesAsignadas.length; j++) {
                    const oferta = clasesAsignadas[j];
                    const horarioHoy = oferta.horarios.find(h => h.diaSemana === diaDeLaSemana);
                    
                    if (horarioHoy) {
                        const inicioClase = crearFechaConHora(par.fechaFisica, horarioHoy.horaInicio);
                        const finClase = crearFechaConHora(par.fechaFisica, horarioHoy.horaFin);

                   
                        const toleranciaValida = par.entrada <= new Date(inicioClase.getTime() + (30 * 60000));
                        
                        const registroEntradaOficial = await AsistenciaDocente.findOne({
                            docente: par.docente._id,
                            fecha: par.entrada,
                            tipoRegistro: 'Entrada'
                        });

                        const fueJustificado = registroEntradaOficial && registroEntradaOficial.estatus === 'Justificado';
                        const llegoAClase = toleranciaValida || fueJustificado;
                        
                        const seQuedoAlFinal = par.salida >= finClase;

                        if (llegoAClase && seQuedoAlFinal) {
                            const horasAprobadas = (finClase - inicioClase) / (1000 * 60 * 60);
                            const turnoFinal = oferta.turno || oferta.grupo?.turno || par.docente.turno;

                            if (turnoFinal === 'Sabatino') {
                                nomina[docenteId].horasSabatinas += horasAprobadas;
                                nomina[docenteId].total += (horasAprobadas * (par.docente.pagoHoraSabatino || 200));
                            } else if (turnoFinal === 'Virtual' || turnoFinal === 'Línea') {
                                nomina[docenteId].horasLinea += horasAprobadas;
                                nomina[docenteId].total += (horasAprobadas * (par.docente.pagoHoraLinea || 250));
                            } else {
                                nomina[docenteId].horasMatutinas += horasAprobadas;
                                nomina[docenteId].total += (horasAprobadas * (par.docente.pagoHoraMatutino || 200));
                            }
                        }
                    }
                }
            }
        }

        res.json(Object.values(nomina));
    } catch (error) {
        console.error("Error interno al calcular nómina:", error);
        res.status(500).json({ message: "Error al calcular nómina" });
    }
};

export const justificarAsistencia = async (req, res) => {
    try {
        const { id } = req.params; 
        const { motivo } = req.body; 

        const asistenciaActualizada = await AsistenciaDocente.findByIdAndUpdate(
            id,
            { 
                estatus: 'Justificado',
                motivoJustificacion: motivo || 'Sin motivo especificado'
            },
            { new: true }
        );

        if (!asistenciaActualizada) {
            return res.status(404).json({ message: "No se encontró el registro de asistencia." });
        }

        res.status(200).json({ 
            message: "Registro justificado exitosamente.",
            asistencia: asistenciaActualizada 
        });

    } catch (error) {
        console.error("Error al justificar:", error);
        res.status(500).json({ message: "Error interno al justificar el registro." });
    }
};