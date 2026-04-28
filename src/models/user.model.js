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
    // 👇 CAMBIO CLAVE: Definimos quién es el jefe supremo y quién es director
    role: { 
        type: String, 
        enum: ['super-admin', 'director_carrera'], 
        default: 'director_carrera' 
    },
    // El "scope" o área que este directivo controla
    carrera: { 
        type: String, 
        enum: ['Radiología', 'Odontología', 'Enfermería', 'General'],
        required: true
    }
}, { 
    timestamps: true 
});

export default mongoose.model('Directivo', directivoSchema);