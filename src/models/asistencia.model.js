import mongoose from 'mongoose';

const asistenciaSchema = new mongoose.Schema({
  // El ID crudo que manda la terminal Hikvision
  idDocenteHikvision: { type: String, required: true }, 
  
  // Relaciones con tus otras colecciones
  docente: { type: mongoose.Schema.Types.ObjectId, ref: 'Docente' },
  ofertaAcademica: { type: mongoose.Schema.Types.ObjectId, ref: 'OfertaAcademica' },
  grupo: { type: mongoose.Schema.Types.ObjectId, ref: 'Grupo' },
  materia: { type: mongoose.Schema.Types.ObjectId, ref: 'Materia' },
  
  nombre: { type: String, default: 'Desconocido' },
  fechaHora: { type: Date, required: true },
  
  estatus: { 
    type: String, 
    default: 'Fuera de horario' // Cambiará a "En clase" si le toca dar clase
  },
  dispositivo: { type: String, default: 'Hikvision MinMoe' }
}, {
  timestamps: true
});

export default mongoose.model('Asistencia', asistenciaSchema);