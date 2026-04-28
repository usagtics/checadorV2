import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Email no válido'],
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee',
  },
  photo: {
    type: String, 
  },
  tipoHorario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TipoHorario'
  },

  // 🔹 Aquí agregamos la referencia al plantel
  plantel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plantel',
    required: true, // puedes quitarlo si no siempre tendrá plantel asignado
  },

  fechaEntrada: {
    type: Date,
    required: false,
  },
  fechaSalida: {
    type: Date,
    required: false,
  },

  dateJoined: {
    type: Date,
    default: Date.now,
  },
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
