import mongoose from 'mongoose';

const asistenciaDocenteSchema = new mongoose.Schema({
    docente: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Docente', 
        required: true 
    },
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
        default: Date.now 
    },
    estatus: { 
        type: String, 
        enum: ['A tiempo', 'Retardo', 'Falta', 'Justificado'], 
        default: 'A tiempo' 
    },
    motivoJustificacion: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export default mongoose.model('AsistenciaDocente', asistenciaDocenteSchema);