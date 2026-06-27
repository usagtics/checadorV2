import mongoose from 'mongoose';

const periodoSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true, 
        trim: true,
        unique: true // Para que no repitan "2026-1"
    },
    fechaInicio: { type: Date },
    fechaFin: { type: Date },
    activo: { 
        type: Boolean, 
        default: false 
    }
}, {
    timestamps: true
});

export default mongoose.model('Periodo', periodoSchema);