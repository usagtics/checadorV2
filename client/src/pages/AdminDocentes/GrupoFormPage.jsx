import React, { useState } from 'react';
// 👇 CAMBIO 1: Importamos el contexto de Grupos, no el Académico
import { useGrupos } from '../../context/GrupoContext'; 
import { useNavigate } from 'react-router-dom';

export default function GrupoFormPage() {
  // 👇 CAMBIO 2: Usamos useGrupos() para obtener la función
  const { createGrupo, errors: backendErrors } = useGrupos();
  const navigate = useNavigate();

  const [grupo, setGrupo] = useState({
    nombre: '',
    programa: 'Licenciatura', 
    turno: 'Matutino',       
    activo: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createGrupo(grupo);
      navigate('/admin/grupos'); 
    } catch (error) {
      // Esto nos ayudará a ver si el servidor rechaza los datos por otra cosa
      console.error("DETALLES DEL ERROR:", error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white">Registrar Nuevo Grupo</h1>
          <p className="text-zinc-500 text-sm">Configura el nivel y turno del grupo.</p>
        </header>

        {/* Muestra errores si el nombre del grupo ya existe, por ejemplo */}
        {backendErrors && backendErrors.map((error, i) => (
          <div key={i} className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-4 text-xs font-bold text-center">
            {error}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Nombre del Grupo</label>
            <input 
              type="text" 
              placeholder="Ej: 101-B"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              onChange={(e) => setGrupo({ ...grupo, nombre: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Programa</label>
              <select 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                value={grupo.programa}
                onChange={(e) => setGrupo({ ...grupo, programa: e.target.value })}
              >
               <option value="Licenciatura">Licenciatura</option>
               <option value="TSU">TSU</option>
               <option value="Nivelación">Nivelación</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Turno</label>
              <select 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                value={grupo.turno}
                onChange={(e) => setGrupo({ ...grupo, turno: e.target.value })}
              >
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Sabatino">Sabatino</option>
                <option value="Virtual">Virtual</option>
                <option value="Nocturno">Nocturno</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95"
          >
            Guardar Grupo
          </button>

          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="w-full text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            Volver al listado
          </button>
        </form>
      </div>
    </div>
  );
}