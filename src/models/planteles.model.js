import mongoose from 'mongoose';

const plantelSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres.'],
  },
  direccion: {
    type: String,
    trim: true,
    required: true,
    minlength: [5, 'La dirección debe tener al menos 5 caracteres.'],
  },
  ipsPermitidas: {
    type: [String],
    default: [],
    required: true
  },
  activo: { 
    type: Boolean, 
    default: true,
  }
}, {
  timestamps: true,
});

plantelSchema.index({ nombre: 1 });

export default mongoose.model('Plantel', plantelSchema);