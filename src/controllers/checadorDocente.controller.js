import Docente from '../models/docentes.model.js';
import OfertaAcademica from '../models/ofertaAcademica.model.js';
import AsistenciaDocente from '../models/asistenciaDocente.model.js';
import Periodo from '../models/periodo.model.js'; 


const convertirHoraAMinutos = (horaString) => {
    const [horas, minutos] = horaString.split(':').map(Number);
    return horas * 60 + minutos;
};

// El registro QR se mantiene global (lo usan los checadores físicos o dispositivos de la escuela)
export const registrarAsistenciaQR = async (req, res) => {
    try {
        let { numeroEmpleado } = req.body;

        console.log("🚨 DATO PURO RECIBIDO DEL QR:", numeroEmpleado);

        if (typeof numeroEmpleado === 'string' && numeroEmpleado.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(numeroEmpleado);
                numeroEmpleado = parsed.id || parsed.numeroEmpleado || numeroEmpleado;
            } catch (e) {
                console.log("El string no era un JSON válido, se procesará normal.");
            }
        }

        if (numeroEmpleado && typeof numeroEmpleado === 'object') {
            numeroEmpleado = numeroEmpleado.id || numeroEmpleado.numeroEmpleado;
        }

        numeroEmpleado = numeroEmpleado ? String(numeroEmpleado).trim() : null;

        console.log(" DATO LIMPIO PARA BUSCAR EN MONGO:", numeroEmpleado);

        if (!numeroEmpleado) {
            return res.status(400).json({ message: 'No se recibió un código QR válido.' });
        }

        const docente = await Docente.findOne({ 
            numeroEmpleado: { $regex: new RegExp(`^${numeroEmpleado}$`, 'i') } 
        });
        
        if (!docente) {
            return res.status(404).json({ message: 'Docente no encontrado.' });
        }

        const periodoActivo = await Periodo.findOne({ activo: true });
        if (!periodoActivo) {
            return res.status(400).json({ message: 'No hay un periodo académico activo en el sistema.' });
        }

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const fechaActual = new Date();
        const diaHoy = diasSemana[fechaActual.getDay()];
        const horaActualMinutos = fechaActual.getHours() * 60 + fechaActual.getMinutes();
        
        const inicioDia = new Date();
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date();
        finDia.setHours(23, 59, 59, 999);

        const clasesAsignadas = await OfertaAcademica.find({ 
            docente: docente._id,
            periodo: periodoActivo._id 
        })
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
                if (oferta.materia?.nombre) nombresMateriasHoy.push(oferta.materia.nombre);

                const inicioMinutos = convertirHoraAMinutos(horarioHoy.horaInicio);
                const minFin = convertirHoraAMinutos(horarioHoy.horaFin);
                
                if (inicioMinutos < menorHoraInicio) {
                    menorHoraInicio = inicioMinutos;
                    primeraClaseHoy = oferta;
                    primerHorarioHoy = horarioHoy;
                }
                if (minFin > mayorHoraFin) mayorHoraFin = minFin;
            }
        }

        if (!primeraClaseHoy) {
            return res.status(400).json({ message: `No tienes clases asignadas para hoy (${diaHoy}) en el periodo actual.` });
        }

        const limiteTemprano = menorHoraInicio - 60; 
        const limiteTarde = mayorHoraFin + 120; 

        if (horaActualMinutos < limiteTemprano) {
            return res.status(400).json({ 
                message: `Demasiado temprano. Tu primera clase comienza a las ${primerHorarioHoy.horaInicio}.` 
            });
        }

        if (horaActualMinutos > limiteTarde) {
            return res.status(400).json({ message: `Tu jornada ya finalizó. Fuera de horario permitido.` });
        }

        const bloqueMateriasString = [...new Set(nombresMateriasHoy)].join(' / ');
        
        const ultimaChecada = await AsistenciaDocente.findOne({
            docente: docente._id,
            fecha: { $gte: inicioDia, $lte: finDia }
        }).sort({ fecha: -1 }); 

        const horaEscaneo = new Date(); 

        if (!ultimaChecada || ultimaChecada.tipoRegistro === 'Salida') {
            const totalEntradasHoy = await AsistenciaDocente.countDocuments({
                docente: docente._id,
                tipoRegistro: 'Entrada', 
                fecha: { $gte: inicioDia, $lte: finDia }
            });

            if (totalEntradasHoy >= 2) {
                return res.status(400).json({ message: `Límite de entradas diarias alcanzado.` });
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
                tipo: 'Entrada',
                estatus: estatusCalculado
            });

        } else {
            const diferenciaMinutos = (horaEscaneo - ultimaChecada.fecha) / (1000 * 60);

            if (diferenciaMinutos < 20) {
                const faltan = Math.ceil(20 - diferenciaMinutos);
                return res.status(400).json({ message: `Espera ${faltan} min más para marcar salida.` });
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
                tipo: 'Salida'
            });
        }

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// 1. OBTENER ASISTENCIAS (FILTRADO POR ÁREA EN TIEMPO REAL)
export const obtenerTodasLasAsistencias = async (req, res) => {
    try {
        const { role, carrera } = req.user; // Datos del directivo inyectados por el middleware
        let queryFiltro = {};

        // PROTECCIÓN: Si es directivo o administrador de carrera, restringimos sus grupos
        if (role === 'directivo' || role === 'admin') {
            const ofertasCarrera = await OfertaAcademica.find().populate('grupo');
            const grupoIds = ofertasCarrera
                .filter(o => o.grupo && o.grupo.programa === carrera)
                .map(o => o.grupo._id);
            
            queryFiltro.grupo = { $in: grupoIds };
        }

        const periodoActivo = await Periodo.findOne({ activo: true });
        
        const asistenciasBrutas = await AsistenciaDocente.find(queryFiltro)
            .populate('docente', 'nombre apellidos numeroEmpleado turno')
            .populate('materia', 'nombre')
            .populate('grupo', 'nombre')
            .sort({ fecha: -1 })
            .lean(); 

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        const asistenciasProcesadas = await Promise.all(asistenciasBrutas.map(async (asistencia) => {
            if (!asistencia.docente) return asistencia;

            const diaChecada = diasSemana[new Date(asistencia.fecha).getDay()];
            
            const queryOferta = { docente: asistencia.docente._id };
            if (periodoActivo) queryOferta.periodo = periodoActivo._id;

            const clases = await OfertaAcademica.find(queryOferta).populate('materia');
            
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

// 2. DETALLE DE NÓMINA PROTEGIDO POR CARRERA
export const getNominaDetalle = async (req, res) => {
    try {
        const { role, carrera } = req.user; 
        const { fechaInicio, fechaFin } = req.query;
        const periodoActivo = await Periodo.findOne({ activo: true });
        
        let queryFiltro = {
            fecha: { 
                $gte: new Date(`${fechaInicio}T00:00:00.000Z`), 
                $lte: new Date(`${fechaFin}T23:59:59.999Z`) 
            }
        };

        // AISLAMIENTO: Filtramos los registros físicos que pertenecen únicamente a su carrera
        if (role === 'directivo' || role === 'admin') {
            const ofertasCarrera = await OfertaAcademica.find().populate('grupo');
            const grupoIds = ofertasCarrera
                .filter(o => o.grupo && o.grupo.programa === carrera)
                .map(o => o.grupo._id);
            
            queryFiltro.grupo = { $in: grupoIds };
        }

        const asistencias = await AsistenciaDocente.find(queryFiltro).populate('docente grupo').sort({ fecha: 1 });

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
        const registrosProcesados = Object.values(emparejamiento);
        
        for (const par of registrosProcesados) {
            const docenteId = par.docente._id.toString();
            
            if (!nomina[docenteId]) {
                nomina[docenteId] = {
                    nombre: `${par.docente.nombre} ${par.docente.apellidos}`,
                    horasSabatinas: 0, horasMatutinas: 0, horasLinea: 0,
                    metodoPago: par.docente.metodoPago || "TARJETA",
                    total: 0
                };
            }

            if (par.entrada && par.salida && par.entrada < par.salida) {
                const diaDeLaSemana = diasSemana[par.fechaFisica.getDay()];
                
                const queryOferta = { docente: par.docente._id };
                if (periodoActivo) queryOferta.periodo = periodoActivo._id;

                const clasesAsignadas = await OfertaAcademica.find(queryOferta).populate('materia grupo');

                for (const oferta of clasesAsignadas) {
                    // BLINDAJE ADICIONAL: Si la clase de este docente no pertenece a la carrera del directivo logueado, se ignora del cálculo.
                    if ((role === 'directivo' || role === 'admin') && (!oferta.grupo || oferta.grupo.programa !== carrera)) {
                        continue; 
                    }

                    const horarioHoy = oferta.horarios.find(h => h.diaSemana === diaDeLaSemana);
                    
                    if (horarioHoy) {
                        const inicioClase = crearFechaConHora(par.fechaFisica, horarioHoy.horaInicio);
                        const finClase = crearFechaConHora(par.fechaFisica, horarioHoy.horaFin);

                        const toleranciaEntrada = new Date(inicioClase.getTime() + (30 * 60000));
                        
                        const estuvoPresente = par.entrada <= toleranciaEntrada && par.salida >= finClase;

                        if (estuvoPresente) {
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

        // Removemos de la respuesta a los docentes que quedaron en 0 horas calculadas para esta carrera
        const filtradoFinal = Object.values(nomina).filter(d => d.total > 0);
        res.json(filtradoFinal);
    } catch (error) {
        res.status(500).json({ message: "Error al calcular nómina" });
    }
};

// 3. JUSTIFICAR ASISTENCIA PROTEGIDA
export const justificarAsistencia = async (req, res) => {
    try {
        const { role, carrera } = req.user;
        const { id } = req.params; 
        const { motivo } = req.body; 

        // SEGURIDAD: Validar que el registro pertenezca a la área/carrera del directivo
        if (role === 'directivo' || role === 'admin') {
            const registroAsistencia = await AsistenciaDocente.findById(id).populate('grupo');
            if (!registroAsistencia || !registroAsistencia.grupo || registroAsistencia.grupo.programa !== carrera) {
                return res.status(403).json({ message: "No posees autorización para alterar registros de otra facultad." });
            }
        }

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

// 4. DESGLOSE DIARIO LIMITADO POR ÁREA
export const getDesgloseDia = async (req, res) => {
    try {
        const { role, carrera } = req.user;
        const { docenteId } = req.params;
        const { fecha } = req.query; 

        const fechaInicio = new Date(`${fecha}T00:00:00.000Z`);
        const fechaFin = new Date(`${fecha}T23:59:59.999Z`);
        
        // El filtro base busca las checadas de ese día
        let queryAsistencia = {
            docente: docenteId,
            fecha: { $gte: fechaInicio, $lte: fechaFin }
        };

        // Si es directivo, solo traemos las checadas asociadas a grupos de su carrera
        if (role === 'directivo' || role === 'admin') {
            const ofertasCarrera = await OfertaAcademica.find().populate('grupo');
            const grupoIds = ofertasCarrera
                .filter(o => o.grupo && o.grupo.programa === carrera)
                .map(o => o.grupo._id);
            
            queryAsistencia.grupo = { $in: grupoIds };
        }

        const asistencias = await AsistenciaDocente.find(queryAsistencia).sort({ fecha: 1 });

        let entradaReal = null;
        let salidaReal = null;

        asistencias.forEach(a => {
            if (a.tipoRegistro === 'Entrada' && !entradaReal) entradaReal = a.fecha;
            if (a.tipoRegistro === 'Salida') salidaReal = a.fecha;
        });

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const fechaObj = new Date(`${fecha}T12:00:00.000Z`); 
        const diaDeLaSemana = diasSemana[fechaObj.getDay()];

        const periodoActivo = await Periodo.findOne({ activo: true });
        const queryOferta = { docente: docenteId };
        if (periodoActivo) queryOferta.periodo = periodoActivo._id;

        const ofertas = await OfertaAcademica.find(queryOferta).populate('materia grupo');
        
        let clasesDelDia = [];
        ofertas.forEach(oferta => {
            // SEGURIDAD: Ignorar materias del día que no corresponden a su facultad
            if ((role === 'directivo' || role === 'admin') && (!oferta.grupo || oferta.grupo.programa !== carrera)) {
                return;
            }

            const horarioHoy = oferta.horarios.find(h => h.diaSemana === diaDeLaSemana);
            if (horarioHoy) {
                clasesDelDia.push({
                    materia: oferta.materia?.nombre || 'Materia sin nombre',
                    horaInicio: horarioHoy.horaInicio,
                    horaFin: horarioHoy.horaFin,
                    inicioMin: convertirHoraAMinutos(horarioHoy.horaInicio),
                    finMin: convertirHoraAMinutos(horarioHoy.horaFin)
                });
            }
        });

        clasesDelDia.sort((a, b) => a.inicioMin - b.inicioMin);

        const cronograma = [];
        let totalHoras = 0;
        let ultimaHoraFin = null;

        for (let i = 0; i < clasesDelDia.length; i++) {
            const clase = clasesDelDia[i];

            if (ultimaHoraFin !== null && ultimaHoraFin < clase.inicioMin) {
                const hFinH = Math.floor(ultimaHoraFin / 60).toString().padStart(2, '0');
                const mFinH = (ultimaHoraFin % 60).toString().padStart(2, '0');
                const hIniH = Math.floor(clase.inicioMin / 60).toString().padStart(2, '0');
                const mIniH = (clase.inicioMin % 60).toString().padStart(2, '0');
                
                cronograma.push({
                    tipo: 'hueco',
                    materia: 'Tiempo Libre',
                    horario: `${hFinH}:${mFinH} - ${hIniH}:${mIniH}`,
                    status: 'No pagada'
                });
            }

            const [hIni, mIni] = clase.horaInicio.split(':');
            const [hFin, mFin] = clase.horaFin.split(':');
            
            const claseInicioDate = new Date(fechaObj);
            claseInicioDate.setHours(parseInt(hIni), parseInt(mIni), 0, 0);
            
            const claseFinDate = new Date(fechaObj);
            claseFinDate.setHours(parseInt(hFin), parseInt(mFin), 0, 0);

            const toleranciaEntrada = new Date(claseInicioDate.getTime() + (30 * 60000));
            
            const claseCubierta = (entradaReal && salidaReal && entradaReal <= toleranciaEntrada && salidaReal >= claseFinDate);

            if (claseCubierta) {
                const horasClase = (clase.finMin - clase.inicioMin) / 60;
                totalHoras += horasClase;
            }

            cronograma.push({
                tipo: 'clase',
                materia: clase.materia,
                horario: `${clase.horaInicio} - ${clase.horaFin}`,
                status: claseCubierta ? 'Pagada' : 'No pagada'
            });

            ultimaHoraFin = clase.finMin;
        }

        res.status(200).json({
            cronograma,
            totalHoras: totalHoras.toFixed(1)
        });

    } catch (error) {
        console.error("Error al armar desglose:", error);
        res.status(500).json({ message: "Error interno" });
    }
};

const crearFechaConHora = (fechaBase, horaString) => {
    const [horas, minutos] = horaString.split(':').map(Number);
    const nuevaFecha = new Date(fechaBase);
    nuevaFecha.setHours(horas, minutos, 0, 0);
    return nuevaFecha;
};