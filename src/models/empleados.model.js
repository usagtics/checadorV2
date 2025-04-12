import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee',
  },
  photo: {
    type: String, 
  },
  dateJoined: {
    type: Date,
    default: Date.now,
  },
  tipoHorario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TipoHorario",
    required: true,
  },
  
});


const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
