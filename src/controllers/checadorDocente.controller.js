
import Docente from '../models/docentes.model.js';
import OfertaAcademica from '../models/ofertaAcademica.model.js';
import AsistenciaDocente from '../models/asistenciaDocente.model.js';
import Periodo from '../models/periodo.model.js'; 
import CryptoJS from 'crypto-js'; 
import Grupo from '../models/grupos.model.js';

const convertirHoraAMinutos = (horaString) => {
    const [horas, minutos] = horaString.split(':').map(Number);
    return horas * 60 + minutos;
};

export const registrarAsistenciaQR = async (req, res) => {
    try {
        let rawData = req.body;
        let tokenQR = rawData.numeroEmpleado; 

        if (typeof tokenQR === 'object' && tokenQR.numeroEmpleado) {
            tokenQR = tokenQR.numeroEmpleado;
        }

        if (!tokenQR) return res.status(400).json({ message: 'No se recibió un código QR válido.' });

        let matriculaLimpia = null;

        try {
            const bytes = CryptoJS.AES.decrypt(tokenQR, 'SECRETO_USAG_2026'); 
            const stringDesencriptado = bytes.toString(CryptoJS.enc.Utf8);
            
            if(!stringDesencriptado) throw new Error("Fallo al desencriptar");

            const datosQR = JSON.parse(stringDesencriptado);
            const horaActualToken = Date.now();
            const diferenciaSegundos = (horaActualToken - datosQR.timestamp) / 1000;

            if (diferenciaSegundos > 30) {
                return res.status(403).json({ message: '⛔ Código QR expirado.' });
            }

            matriculaLimpia = String(datosQR.id || datosQR.numeroEmpleado).trim();
        } catch (error) {
            return res.status(400).json({ message: 'El formato del QR es inválido o no seguro.' });
        }


        const docente = await Docente.findOne({ 
            numeroEmpleado: { $regex: new RegExp(`^${matriculaLimpia}$`, 'i') } 
        });
        if (!docente) return res.status(404).json({ message: 'Docente no encontrado.' });

        const periodoActivo = await Periodo.findOne({ activo: true });
        if (!periodoActivo) return res.status(400).json({ message: 'Periodo inactivo.' });

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const fechaActual = new Date();
        const diaHoy = diasSemana[fechaActual.getDay()];
        const horaActualMinutos = fechaActual.getHours() * 60 + fechaActual.getMinutes();
        
        const inicioDia = new Date(fechaActual); inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(fechaActual); finDia.setHours(23, 59, 59, 999);

        const checadasHoy = await AsistenciaDocente.find({
            docente: docente._id,
            fecha: { $gte: inicioDia, $lte: finDia }
        }).sort({ fecha: -1 });

        if (checadasHoy.length > 0) {
            const ultimaChecadaGlobal = checadasHoy[0];
            const segundosDesdeUltimaChecada = (fechaActual.getTime() - ultimaChecadaGlobal.fecha.getTime()) / 1000;
            
            if (segundosDesdeUltimaChecada < 60) {
                return res.status(429).json({ 
                    message: `Procesando registro. Por favor, espera ${Math.ceil(60 - segundosDesdeUltimaChecada)} segundos antes de volver a escanear.` 
                });
            }
        }
        

        const clasesAsignadas = await OfertaAcademica.find({ 
            docente: docente._id,
            periodo: periodoActivo._id 
        }).populate('materia').populate('grupo');

        let claseActual = null;
        let horarioActual = null;
        let materiaPorCerrar = null;
        let materiaPorAbrir = null;

        for (const oferta of clasesAsignadas) {
            const horariosHoy = oferta.horarios.filter(h => h.diaSemana === diaHoy);
            
            for (const horarioHoy of horariosHoy) {
                const inicioMinutos = convertirHoraAMinutos(horarioHoy.horaInicio);
                const finMinutos = convertirHoraAMinutos(horarioHoy.horaFin);
                
                if (horaActualMinutos >= (inicioMinutos - 15) && horaActualMinutos <= (finMinutos + 30)) {
                    const checadasMateria = checadasHoy.filter(c => c.materia.toString() === oferta.materia._id.toString());
                    const ultimaChecada = checadasMateria.length > 0 ? checadasMateria[0] : null;

                    if (ultimaChecada && ultimaChecada.tipoRegistro === 'Entrada') {
                        materiaPorCerrar = { oferta, horarioHoy };
                    } else if (!ultimaChecada || ultimaChecada.tipoRegistro === 'Salida') {
                        if (horaActualMinutos <= finMinutos) {
                            materiaPorAbrir = { oferta, horarioHoy };
                        }
                    }
                }
            }
        }

        if (materiaPorCerrar) { 
            claseActual = materiaPorCerrar.oferta; 
            horarioActual = materiaPorCerrar.horarioHoy; 
        } else if (materiaPorAbrir) { 
            claseActual = materiaPorAbrir.oferta; 
            horarioActual = materiaPorAbrir.horarioHoy; 
        }

        if (!claseActual) {
            return res.status(400).json({ message: `No tienes ninguna clase activa.` });
        }

        const checadasMateriaActual = checadasHoy.filter(c => c.materia.toString() === claseActual.materia._id.toString());
        const ultimaChecadaMateria = checadasMateriaActual.length > 0 ? checadasMateriaActual[0] : null;

        if (!ultimaChecadaMateria || ultimaChecadaMateria.tipoRegistro === 'Salida') {
            const inicioClaseMinutos = convertirHoraAMinutos(horarioActual.horaInicio);
            let estatusCalculado = 'A tiempo';
            
            // 👇 AQUI ESTÁN LAS REGLAS DE TOLERANCIA ACTUALIZADAS 👇
            if (horaActualMinutos > (inicioClaseMinutos + 15)) estatusCalculado = 'Falta';
            else if (horaActualMinutos > (inicioClaseMinutos + 10)) estatusCalculado = 'Retardo';

            const nuevaEntrada = new AsistenciaDocente({
                docente: docente._id,
                materia: claseActual.materia._id, 
                grupo: claseActual.grupo._id,
                tipoRegistro: 'Entrada', 
                fecha: new Date(), 
                estatus: estatusCalculado
            });
            await nuevaEntrada.save();
            return res.status(200).json({ message: `Entrada registrada`, estatus: estatusCalculado });
            
        } else {
            const diferenciaMinutos = (new Date() - ultimaChecadaMateria.fecha) / (1000 * 60);
            if (diferenciaMinutos < 20) {
                return res.status(400).json({ message: `Espera ${Math.ceil(20 - diferenciaMinutos)} min más para salir.` });
            }

            const finClaseMinutos = convertirHoraAMinutos(horarioActual.horaFin);
            let estatusSalida = 'A tiempo';

            if (horaActualMinutos < (finClaseMinutos - 10)) {
                estatusSalida = 'Salida anticipada';
            }

            const nuevaSalida = new AsistenciaDocente({
                docente: docente._id,
                materia: claseActual.materia._id, 
                grupo: claseActual.grupo._id,
                tipoRegistro: 'Salida', 
                fecha: new Date(), 
                estatus: estatusSalida 
            });
            await nuevaSalida.save();
            return res.status(200).json({ message: `Salida registrada`, estatus: estatusSalida });
        }
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ message: 'Error interno.' });
    }
};

export const obtenerTodasLasAsistencias = async (req, res) => {
    try {
        let filtroAsistencias = {};
        
        if (req.user && req.user.carreras && req.user.carreras.length > 0 && req.user.role !== 'super-admin') {
            const gruposPermitidos = await Grupo.find({ carrera: { $in: req.user.carreras } }).select('_id');
            const idsGruposPermitidos = gruposPermitidos.map(g => g._id);
            filtroAsistencias = { grupo: { $in: idsGruposPermitidos } };
        }
        
        const asistenciasBrutas = await AsistenciaDocente.find(filtroAsistencias)
            .populate('docente', 'nombre apellidos numeroEmpleado turno')
            .populate('materia', 'nombre')
            .populate('grupo', 'nombre')
            .sort({ fecha: -1 })
            .lean(); 

        res.status(200).json(asistenciasBrutas);
        
    } catch (error) {
        console.error("Error al obtener el reporte de checadas:", error);
        res.status(500).json({ message: 'Error interno al obtener las asistencias.' });
    }
};

export const getNominaDetalle = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        const periodoActivo = await Periodo.findOne({ activo: true });
        
        let queryAsistencias = {
            fecha: { 
                $gte: new Date(`${fechaInicio}T00:00:00.000Z`), 
                $lte: new Date(`${fechaFin}T23:59:59.999Z`) 
            }
        };

        if (req.user && req.user.carreras && req.user.carreras.length > 0 && req.user.role !== 'super-admin') {
            const gruposPermitidos = await Grupo.find({ carrera: { $in: req.user.carreras } }).select('_id');
            const idsGruposPermitidos = gruposPermitidos.map(g => g._id);
            queryAsistencias.grupo = { $in: idsGruposPermitidos };
        }

        const asistencias = await AsistenciaDocente.find(queryAsistencias)
            .populate('docente materia grupo').sort({ fecha: 1 });

        const emparejamiento = {};
        const nomina = {};

        asistencias.forEach(registro => {
            if (!registro.docente || !registro.materia) return;
            const docenteId = registro.docente._id.toString();
            const materiaId = registro.materia._id.toString();
            const fechaCorta = registro.fecha.toLocaleDateString('en-CA'); 
            
            // CORRECCIÓN: Extraemos el ID del grupo para evitar que se sobrescriban clases iguales
            const grupoId = registro.grupo ? registro.grupo._id.toString() : 'sin-grupo';
            
            // CORRECCIÓN: Agregamos el grupo a la llave única
            const llaveUnica = `${docenteId}_${fechaCorta}_${materiaId}_${grupoId}`; 

            if (!emparejamiento[llaveUnica]) {
                emparejamiento[llaveUnica] = { 
                    entrada: null, 
                    salida: null, 
                    docente: registro.docente, 
                    materia: registro.materia, 
                    grupo: registro.grupo, 
                    fechaFisica: registro.fecha, 
                    estatusList: [],
                    esJustificado: false 
                };
            }
            if (registro.tipoRegistro === 'Entrada' && !emparejamiento[llaveUnica].entrada) emparejamiento[llaveUnica].entrada = registro.fecha;
            if (registro.tipoRegistro === 'Salida') emparejamiento[llaveUnica].salida = registro.fecha;
            
            if (registro.estatus === 'Justificado') {
                emparejamiento[llaveUnica].esJustificado = true;
                emparejamiento[llaveUnica].estatusList.push('Justificado');
            } else if (registro.estatus === 'Retardo' || registro.estatus === 'Falta' || registro.estatus === 'Salida anticipada') {
                emparejamiento[llaveUnica].estatusList.push(registro.estatus);
            }
        });

        const formatearMinutosAHoras = (totalMinutos) => {
            if (!totalMinutos || isNaN(totalMinutos) || totalMinutos <= 0) return '0 hr';
            const horas = Math.floor(totalMinutos / 60);
            const minutos = totalMinutos % 60;
            if (horas === 0) return `${minutos} min`;
            if (minutos === 0) return `${horas} hr`;
            return `${horas} hr ${minutos} min`;
        };

        for (const par of Object.values(emparejamiento)) {
            const docenteId = par.docente._id.toString();
            if (!nomina[docenteId]) {
                nomina[docenteId] = {
                    nombre: `${par.docente.nombre} ${par.docente.apellidos}`,
                    minutosSabatinos: 0, 
                    minutosDominicales: 0, 
                    minutosMatutinos: 0, 
                    minutosLinea: 0,
                    metodoPago: par.docente.metodoPago || "EFECTIVO",
                    total: 0,
                    incidencias: []
                };
            }

            if ((par.entrada && par.salida && par.salida > par.entrada) || par.esJustificado) {
                let minutosTrabajados = 0; 
                
                const oferta = await OfertaAcademica.findOne({
                    docente: par.docente._id,
                    materia: par.materia._id,
                    grupo: par.grupo?._id,
                    periodo: periodoActivo?._id
                }).populate('grupo');

                if (oferta && oferta.horarios) {
                    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                    const diaChecada = diasSemana[par.fechaFisica.getDay()];
                    const horarioHoy = oferta.horarios.find(h => h.diaSemana === diaChecada);
                    
                    if (horarioHoy) {
                        const [hIni, mIni] = horarioHoy.horaInicio.split(':').map(Number);
                        const [hFin, mFin] = horarioHoy.horaFin.split(':').map(Number);
                        
                        const inicioOficial = new Date(par.fechaFisica);
                        inicioOficial.setHours(hIni, mIni, 0, 0);
                        
                        const finOficial = new Date(par.fechaFisica);
                        finOficial.setHours(hFin, mFin, 0, 0);

                        if (par.esJustificado) {
                            // REGLA MÁGICA: Si está justificado, se pagan los minutos teóricos completos
                            minutosTrabajados = Math.round((finOficial - inicioOficial) / (1000 * 60));
                        } else {
                            // Cálculo estricto normal
                            const entradaEfectiva = new Date(Math.max(par.entrada.getTime(), inicioOficial.getTime()));
                            const salidaEfectiva = new Date(Math.min(par.salida.getTime(), finOficial.getTime()));

                            if (salidaEfectiva > entradaEfectiva) {
                                minutosTrabajados = Math.round((salidaEfectiva - entradaEfectiva) / (1000 * 60));
                            }
                        }
                    } else if (!par.esJustificado && par.entrada && par.salida) {
                        minutosTrabajados = Math.round((par.salida - par.entrada) / (1000 * 60));
                    }
                } else if (!par.esJustificado && par.entrada && par.salida) {
                    minutosTrabajados = Math.round((par.salida - par.entrada) / (1000 * 60));
                }

                // 🌟 REGLA DE REDONDEO INYECTADA 🌟
                // Redondea a la media hora más cercana (30 min). 
                // Ej: 1 hr 20 min -> 1 hr 30 min. 1 hr 10 min -> 1 hr 0 min.
                // Si prefieres cerrarlo a 15 min o 60 min, solo cambia el "30" de aquí abajo.
                minutosTrabajados = Math.round(minutosTrabajados / 30) * 30;

                let turnoClase = 'Matutino';
                if (oferta) turnoClase = oferta.turno || oferta.grupo?.turno || par.docente.turno || 'Matutino';
                else turnoClase = par.grupo?.turno || par.docente.turno || 'Matutino';
                
                const turnoLimpio = turnoClase.toUpperCase();

                if (turnoLimpio === 'SABATINO') {
                    nomina[docenteId].minutosSabatinos += minutosTrabajados;
                    const pagoHora = par.docente.pagoHoraSabatino || 200;
                    nomina[docenteId].total += (minutosTrabajados / 60) * pagoHora;
                } else if (turnoLimpio === 'DOMINICAL') {
                    nomina[docenteId].minutosDominicales += minutosTrabajados;
                    const pagoHora = par.docente.pagoHoraDominical || par.docente.pagoHoraSabatino || 200;
                    nomina[docenteId].total += (minutosTrabajados / 60) * pagoHora;
                } else if (turnoLimpio === 'LÍNEA' || turnoLimpio === 'LINEA' || turnoLimpio === 'VIRTUAL') {
                    nomina[docenteId].minutosLinea += minutosTrabajados;
                    const pagoHora = par.docente.pagoHoraLinea || 250;
                    nomina[docenteId].total += (minutosTrabajados / 60) * pagoHora;
                } else {
                    nomina[docenteId].minutosMatutinos += minutosTrabajados;
                    const pagoHora = par.docente.pagoHoraMatutino || 200;
                    nomina[docenteId].total += (minutosTrabajados / 60) * pagoHora;
                }
            }

            par.estatusList.forEach(est => {
                // Si la clase está justificada, solo mostramos eso y omitimos lo malo
                if (par.esJustificado && est !== 'Justificado') return; 
                
                const desc = `${est} en ${par.materia.nombre || 'Clase'}`;
                if (!nomina[docenteId].incidencias.includes(desc)) nomina[docenteId].incidencias.push(desc);
            });

            // Si está justificado, tampoco marcamos "Omisión de salida"
            if (par.entrada && !par.salida && !par.esJustificado) {
                const descOmision = `Omisión de salida en ${par.materia.nombre || 'Clase'}`;
                if (!nomina[docenteId].incidencias.includes(descOmision)) {
                    nomina[docenteId].incidencias.push(descOmision);
                }
            }
        }

        const resultadoFinal = Object.values(nomina).map(doc => ({
            nombre: doc.nombre,
            horasSabatinas: formatearMinutosAHoras(doc.minutosSabatinos),
            horasDominicales: formatearMinutosAHoras(doc.minutosDominicales),
            horasMatutinas: formatearMinutosAHoras(doc.minutosMatutinos),
            horasLinea: formatearMinutosAHoras(doc.minutosLinea),
            metodoPago: doc.metodoPago,
            total: Number((doc.total || 0).toFixed(2)),
            incidencias: doc.incidencias.join(', ')
        }));

        res.json(resultadoFinal);
    } catch (error) {
        console.error("Error al calcular nómina:", error);
        res.status(500).json({ message: "Error al calcular nómina" });
    }
};

export const justificarAsistencia = async (req, res) => {
    try {
        const { id } = req.params; 
        const { motivo } = req.body; 
        const asistenciaActualizada = await AsistenciaDocente.findByIdAndUpdate(
            id,
            { estatus: 'Justificado', motivoJustificacion: motivo || 'Sin motivo especificado' },
            { new: true }
        );
        if (!asistenciaActualizada) return res.status(404).json({ message: "No se encontró el registro de asistencia." });
        res.status(200).json({ message: "Registro justificado exitosamente.", asistencia: asistenciaActualizada });
    } catch (error) {
        console.error("Error al justificar:", error);
        res.status(500).json({ message: "Error interno al justificar el registro." });
    }
};

export const getDesgloseDia = async (req, res) => {
    try {
        const { docenteId } = req.params;
        const { fecha } = req.query; 
        const fechaInicio = new Date(`${fecha}T00:00:00.000Z`);
        const fechaFin = new Date(`${fecha}T23:59:59.999Z`);
        const asistencias = await AsistenciaDocente.find({ docente: docenteId, fecha: { $gte: fechaInicio, $lte: fechaFin } }).sort({ fecha: 1 });

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

        const ofertas = await OfertaAcademica.find(queryOferta).populate('materia');
        let clasesDelDia = [];
        ofertas.forEach(oferta => {
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
                cronograma.push({ tipo: 'hueco', materia: 'Tiempo Libre', horario: `${hFinH}:${mFinH} - ${hIniH}:${mIniH}`, status: 'No pagada' });
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
            cronograma.push({ tipo: 'clase', materia: clase.materia, horario: `${clase.horaInicio} - ${clase.horaFin}`, status: claseCubierta ? 'Pagada' : 'No pagada' });
            ultimaHoraFin = clase.finMin;
        }

        res.status(200).json({ cronograma, totalHoras: totalHoras.toFixed(1) });
    } catch (error) {
        console.error("Error al armar desglose:", error);
        res.status(500).json({ message: "Error interno" });
    }
};

export const getCumplimientoDocente = async (req, res) => {
    try {
        const periodoActivo = await Periodo.findOne({ activo: true });
        let queryDocentes = {};
        
        if (req.user && req.user.carreras && req.user.carreras.length > 0 && req.user.role !== 'super-admin') {
            const gruposPermitidos = await Grupo.find({ carrera: { $in: req.user.carreras } }).select('_id');
            const idsGrupos = gruposPermitidos.map(g => g._id);
            const ofertas = await OfertaAcademica.find({ grupo: { $in: idsGrupos } }).select('docente');
            const idsDocentes = [...new Set(ofertas.map(o => o.docente.toString()))];
            queryDocentes = { _id: { $in: idsDocentes } };
        }

        const docentes = await Docente.find(queryDocentes);
        const reporteCumplimiento = [];

        for (const doc of docentes) {
            const ofertas = await OfertaAcademica.find({ docente: doc._id, periodo: periodoActivo._id });
            let horasProgramadas = 0;
            ofertas.forEach(o => {
                o.horarios.forEach(h => {
                    const [hIni, mIni] = h.horaInicio.split(':').map(Number);
                    const [hFin, mFin] = h.horaFin.split(':').map(Number);
                    horasProgramadas += (hFin * 60 + mFin - (hIni * 60 + mIni)) / 60;
                });
            });

            const unaSemanaAtras = new Date();
            unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
            const asistencias = await AsistenciaDocente.find({ docente: doc._id, fecha: { $gte: unaSemanaAtras } });
            let horasReales = 0; 
            
            reporteCumplimiento.push({
                nombre: `${doc.nombre} ${doc.apellidos}`,
                programado: horasProgramadas.toFixed(1),
                real: horasReales.toFixed(1),
                porcentaje: horasProgramadas > 0 ? ((horasReales / horasProgramadas) * 100).toFixed(0) : 0
            });
        }
        res.json(reporteCumplimiento);
    } catch (error) {
        res.status(500).json({ message: "Error al generar dashboard de cumplimiento" });
    }
};
