import mongoose from 'mongoose';

const tipoHorarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  hora_entrada: {
    type: String, 
    required: true,
  },
  hora_salida: {
    type: String, 
    required: true,
  },
  tolerancia_min: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('TipoHorario', tipoHorarioSchema);
