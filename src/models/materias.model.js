import mongoose from 'mongoose';

const materiaSchema = new mongoose.Schema({
    nombre: { type: String, required: true }, 
    clave: { type: String, unique: true },   
    

    carreras: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Carrera' 
    }],
    
    activa: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model('Materia', materiaSchema);