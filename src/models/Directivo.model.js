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
    // 👇 EL CAMBIO ESTÁ AQUÍ: Plural y tipo [String]
    carreras: { 
        type: [String], 
        enum: ['Radiología', 'Fisioterapia', 'Nutrición', 'Administración', 'Odontología', 'Enfermería', 'General'],
        required: true
    }
}, { 
    timestamps: true 
});


const Directivo = mongoose.model('DirectivoNuevo', directivoSchema, 'directivos');

export default Directivo;