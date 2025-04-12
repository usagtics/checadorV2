import mongoose from 'mongoose';

const tipoHorarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: false, 
    default: ""     
  }
});

const TipoHorario = mongoose.model('TipoHorario', tipoHorarioSchema);

export default TipoHorario;
