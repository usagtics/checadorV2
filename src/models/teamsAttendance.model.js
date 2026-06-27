import mongoose from "mongoose";

const teamsAttendanceSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
      unique: true, 
    },
    docente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Docente", 
      required: true,
    },
    claseNombre: {
      type: String,
    },
    fechaReunion: {
      type: Date,
      required: true,
    },
    asistentes: [
      {
        nombre: String,
        email: String,
        tiempoTotalSegundos: Number,
        primerIngreso: Date,
        ultimaSalida: Date,
      },
    ],
    procesadoParaNomina: {
      type: Boolean,
      default: false, 
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TeamsAttendance", teamsAttendanceSchema);