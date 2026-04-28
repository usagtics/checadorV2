import mongoose from 'mongoose';

const asistenciaDocenteSchema = new mongoose.Schema({
    docente: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Docente', 
        required: true 
    },
    // Estas referencias dependerán de cómo tengas tus otros modelos
    materia: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Materia' 
    },
    grupo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Grupo' 
    },
    tipoRegistro: { 
        type: String, 
        enum: ['Entrada', 'Salida'], 
        required: true 
    },
    fecha: { 
        type: Date, 
        default: Date.now // Guarda el día exacto
    },
    estatus: { 
        type: String, 
        enum: ['A tiempo', 'Retardo', 'Falta'], 
        default: 'A tiempo' 
    }
}, {
    timestamps: true
});

export default mongoose.model('AsistenciaDocente', asistenciaDocenteSchema);