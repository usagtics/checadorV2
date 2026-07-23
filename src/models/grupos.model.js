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

    turno: {
        type: String,
        required: true,
        enum: ['Matutino', 'Vespertino', 'Sabatino', 'Virtual', 'Dominical'],
        default: 'Matutino'
    },
carrera: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Carrera',
    required: true 
},

    activo: { 
        type: Boolean, 
        default: true 
    }
    
}, {
    timestamps: true
});

export default mongoose.model('Grupo', grupoSchema);