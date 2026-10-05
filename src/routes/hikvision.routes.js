import { Router } from 'express';
import multer from 'multer';
import dayjs from 'dayjs'; 

import AsistenciaDocente from '../models/asistenciaDocente.model.js'; 
import Docente from '../models/docentes.model.js';
import OfertaAcademica from '../models/ofertaAcademica.model.js'; 

const router = Router();
const upload = multer();

router.post('/eventos', upload.any(), async (req, res) => {
  try {
    const eventString = req.body.AccessControllerEvent;
    
    if (eventString) {
      const eventData = JSON.parse(eventString);

      if (eventData.eventType === 'heartBeat') {
         return res.status(200).json({ statusCode: 1, statusString: "OK" });
      }

      const accessEvent = eventData.AccessControllerEvent;

      if (accessEvent && accessEvent.employeeNoString) {
        const idHikvision = accessEvent.employeeNoString.toString().trim();
        const nombreDocente = accessEvent.name || 'Desconocido';
        
        const fechaHoraChecada = dayjs(eventData.dateTime); 
        
        const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaActual = nombresDias[fechaHoraChecada.day()]; 
        const horaMinutoActual = fechaHoraChecada.format('HH:mm');

        console.log(`Procesando huella de: ${nombreDocente} (Matrícula: ${idHikvision}) - ${diaActual} a las ${horaMinutoActual}`);

        const docenteDb = await Docente.findOne({ numeroEmpleado: idHikvision });

        if (docenteDb) {
            
      
            const cincoMinutosAtras = fechaHoraChecada.subtract(5, 'minute').toDate();
            const huellaReciente = await AsistenciaDocente.findOne({
                docente: docenteDb._id,
                fecha: { $gte: cincoMinutosAtras }
            });

            if (huellaReciente) {
                console.log(`⏳ Anti-Spam: ${nombreDocente} acaba de checar. Ignorando huella repetida...`);
                return res.status(200).json({ statusCode: 1, statusString: "OK" });
            }

            const ofertas = await OfertaAcademica.find({ docente: docenteDb._id });
            
            let idMateriaObj = null;
            let idGrupoObj = null; 
            let estatusChecada = 'A tiempo'; 
            
          
            for (const oferta of ofertas) {
                const claseEncontrada = oferta.horarios.find(horario => {
                    if (horario.diaSemana !== diaActual) return false;

            
                    const [horaInicioH, minInicioM] = horario.horaInicio.split(':');
                    const [horaFinH, minFinM] = horario.horaFin.split(':');

                    const inicioClase = dayjs(fechaHoraChecada).hour(parseInt(horaInicioH)).minute(parseInt(minInicioM)).second(0);
                    const finClase = dayjs(fechaHoraChecada).hour(parseInt(horaFinH)).minute(parseInt(minFinM)).second(0);

                    const inicioPermitido = inicioClase.subtract(30, 'minute');
                    const finPermitido = finClase.add(30, 'minute'); 

                    return (fechaHoraChecada.isAfter(inicioPermitido) || fechaHoraChecada.isSame(inicioPermitido)) && 
                           (fechaHoraChecada.isBefore(finPermitido) || fechaHoraChecada.isSame(finPermitido));
                });

                if (claseEncontrada) {
                    idMateriaObj = oferta.materia;
                    idGrupoObj = oferta.grupo; 
                    console.log(`📚 Clase detectada: Rango ${claseEncontrada.horaInicio} - ${claseEncontrada.horaFin}`);
                    break; 
                }
            }

            if (!idMateriaObj) {
                console.log(`Rechazado: ${nombreDocente} intentó checar pero NO tiene clase en este momento.`);
                return res.status(200).json({ statusCode: 1, statusString: "OK" });
            }

            const inicioDia = fechaHoraChecada.startOf('day').toDate();
            const finDia = fechaHoraChecada.endOf('day').toDate();

            const ultimaChecadaHoy = await AsistenciaDocente.findOne({
                docente: docenteDb._id,
                fecha: { $gte: inicioDia,$lte: finDia }
            }).sort({ fecha: -1 }); 
            let tipoRegistro = 'Entrada';
            if (ultimaChecadaHoy && ultimaChecadaHoy.tipoRegistro === 'Entrada') {
                tipoRegistro = 'Salida';
            }

            const nuevaAsistencia = new AsistenciaDocente({
              docente: docenteDb._id,
              fecha: fechaHoraChecada.toDate(),
              materia: idMateriaObj,
              grupo: idGrupoObj, 
              tipoRegistro: tipoRegistro,
              estatus: estatusChecada
            });

            await nuevaAsistencia.save();
            console.log(`¡ÉXITO! Checada guardada como "${tipoRegistro}" en el sistema principal.`);
            
        } else {
            console.log(`⚠️ Advertencia: La matrícula ${idHikvision} no existe en la colección Docentes.`);
        }
      }
    }

    res.status(200).json({ statusCode: 1, statusString: "OK" });

  } catch (error) {
    console.error("Error al procesar o guardar en BD:", error);
    res.status(500).json({ statusCode: 500, statusString: "Error" });
  }
});

export default router;