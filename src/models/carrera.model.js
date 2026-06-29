import mongoose from 'mongoose';

const carreraSchema = new mongoose.Schema({
    clave: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true 
    },
    nombre: { 
        type: String, 
        required: true, 
        trim: true 
    },
    campus: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

export default mongoose.model('Carrera', carreraSchema);