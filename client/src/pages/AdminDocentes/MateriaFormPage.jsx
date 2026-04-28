import React, { useState } from 'react';
import { useAcademico } from '../../context/AcademicoContext';
import { useNavigate } from 'react-router-dom';

export default function MateriaFormPage() {
  const { createMateria } = useAcademico();
  const navigate = useNavigate();
  const [materia, setMateria] = useState({ nombre: '', clave: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMateria(materia);
    navigate('/admin/materias');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-black text-white mb-2">Registrar Materia</h2>
        <p className="text-zinc-500 text-sm mb-8">Añade una nueva asignatura al sistema académico.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-zinc-500 uppercase mb-2">Nombre Completo</label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500"
              value={materia.nombre}
              onChange={(e) => setMateria({...materia, nombre: e.target.value})}
              placeholder="Ej: Radiología Intervencionista"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-zinc-500 uppercase mb-2">Clave de Materia</label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500"
              value={materia.clave}
              onChange={(e) => setMateria({...materia, clave: e.target.value})}
              placeholder="Ej: RAD-402"
              required
            />
          </div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg transition-all">
            Guardar en Catálogo
          </button>
          <button type="button" onClick={() => navigate(-1)} className="w-full text-zinc-600 text-xs font-bold hover:text-white transition-colors">
            Volver atrás
          </button>
        </form>
      </div>
    </div>
  );
}