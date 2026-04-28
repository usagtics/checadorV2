import mongoose from 'mongoose';

const ofertaAcademicaSchema = new mongoose.Schema({
    docente: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Docente', 
        required: true 
    },
    materia: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Materia', 
        required: true 
    },
    grupo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Grupo', 
        required: true 
    },
    turno: {
        type: String,
        enum: ['Matutino', 'Sabatino', 'Virtual', 'Línea'],
        required: true,
        default: 'Matutino'
    },
    horarios: [{
        diaSemana: { 
            type: String, 
            enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
            required: true
        },
        horaInicio: { type: String, required: true }, // Formato "09:00"
        horaFin: { type: String, required: true }     // Formato "10:00"
    }],
    periodo: { type: String } // Ej: "Enero-Junio 2026"
}, {
    timestamps: true
});

export default mongoose.model('OfertaAcademica', ofertaAcademicaSchema);