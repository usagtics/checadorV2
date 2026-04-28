import mongoose from 'mongoose';

const checadaSchema = new mongoose.Schema({
  empleado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  tipo: {
    type: String,
    enum: ['entrada', 'salida'],
    required: true,
  },
  
  // IP Registrada
  ipRegistrada: {
    type: String,
    required: false 
  },

  plantel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plantel',
    required: true,
  },
  
  // Mantenemos 'tarde' (booleano) por si acaso
  tarde: {
    type: Boolean,
    default: false,
  },

  // 👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE 👇
  // Este campo guardará el texto: "Asistencia", "Retardo" o "Falta"
  status: {
    type: String,
    default: 'Asistencia' 
  },
  // -----------------------------------

  tipoHorario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TipoHorario",
    required: true,
  },
  hora: {
    type: Date,
    required: true,
  },
  fotoUrl: {
    type: String, 
  }
}, { timestamps: true });

const Checada = mongoose.model('Checada', checadaSchema);

// ✅ USAMOS EXPORT DEFAULT PARA EVITAR ERRORES DE IMPORTACIÓN
export default Checada;