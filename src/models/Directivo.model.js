import mongoose from 'mongoose';

const directivoSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        required: true, 
        default: 'admin' // Sin enums
    },
    carrera: { 
        type: String, 
        enum: ['Radiología', 'Fisioterapia', 'Nutrición', 'Administración', 'Odontología', 'Enfermería', 'General'],
        required: true
    }
}, { 
    timestamps: true 
});

// 🔥 EL ENGAÑO MAESTRO 🔥
// Le cambiamos el nombre a 'DirectivoNuevo' para que Node.js esté obligado a leerlo desde cero.
// El tercer parámetro ('directivos') le dice que lo guarde en tu misma tabla de Mongo.
const Directivo = mongoose.model('DirectivoNuevo', directivoSchema, 'directivos');

export default Directivo;