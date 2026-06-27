import { obtenerReporteAsistencia } from "../services/teamsService.js";
import TeamsAttendance from "../models/teamsAttendance.model.js";

export const getAsistenciaTeams = async (req, res) => {
  try {
    const { userId, meetingId, docenteId } = req.body;

    if (!userId || !meetingId || !docenteId) {
      return res.status(400).json({ message: "Faltan datos obligatorios (userId, meetingId o docenteId)" });
    }

    const reportesRaw = await obtenerReporteAsistencia(userId, meetingId);

    const nuevaAsistencia = new TeamsAttendance({
      meetingId,
      docente: docenteId,
      fechaReunion: new Date(), 
      asistentes: reportesRaw.map(p => ({
        nombre: p.displayName,
        email: p.emailAddress,
        tiempoTotalSegundos: p.totalAttendanceInSeconds
      }))
    });


    const reporteGuardado = await TeamsAttendance.findOneAndUpdate(
      { meetingId },
      nuevaAsistencia,
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Asistencia guardada y lista para nómina",
      data: reporteGuardado
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error al procesar asistencia", 
      error: error.message 
    });
  }
};