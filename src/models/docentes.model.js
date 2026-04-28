import mongoose from 'mongoose';

const docenteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellidos: { type: String, required: true },
    numeroEmpleado: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    
    // --- CAMPOS DE IDENTIDAD Y ACCESO ---
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },

    // --- NUEVOS CAMPOS DE NÓMINA (Sustituyen a pagoPorHora) ---
    pagoHoraSabatino: { type: Number, default: 200 },
    pagoHoraMatutino: { type: Number, default: 200 },
    pagoHoraLinea: { type: Number, default: 250 },
    metodoPago: { 
        type: String, 
        enum: ['TARJETA', 'EFECTIVO'], 
        default: 'TARJETA' 
    },
    // -----------------------------------------------------------

    turno: { 
        type: String, 
        required: true,
        enum: ['Matutino', 'Vespertino', 'Sabatino', 'Virtual'],
        default: 'Matutino'
    },
    qrCode: { type: String },
    activo: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model('Docente', docenteSchema);