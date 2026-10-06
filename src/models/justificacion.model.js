import mongoose from 'mongoose';

const justificacionSchema = new mongoose.Schema({
    docente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Docente',
        required: true
    },
    fechaAusencia: {
        type: Date,
        required: true
    },
    motivo: {
        type: String,
        enum: ['Salud', 'Trámite Administrativo', 'Asunto Personal', 'Falla Técnica', 'Otro'],
        required: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    evidencia: {
        type: String, 
        default: null
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'Aprobada', 'Rechazada'],
        default: 'Pendiente' 
    },
    comentariosDirectivo: {
        type: String, 
        trim: true,
        default: null
    },
    revisadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        default: null
    }
}, {
    timestamps: true 
});

export default mongoose.model('Justificacion', justificacionSchema);