import mongoose from 'mongoose';

const grupoSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true 
    }, // Ej: "1A", "Semestre 3"
    
    programa: {
        type: String,
        required: true,
        enum: ['TSU', 'Licenciatura', 'Nivelación'],
        default: 'Licenciatura'
    },

    // --- NUEVO: EL TURNO / MODALIDAD ---
    turno: {
        type: String,
        required: true,
        enum: ['Matutino', 'Vespertino', 'Sabatino', 'Virtual'],
        default: 'Matutino'
    },

    activo: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true
});

export default mongoose.model('Grupo', grupoSchema);