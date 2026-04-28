import mongoose from 'mongoose';

const materiaSchema = new mongoose.Schema({
    nombre: { type: String, required: true }, // Ej: "Enfermería Básica"
    clave: { type: String, unique: true },    // Ej: "ENF-101"
    activa: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model('Materia', materiaSchema);