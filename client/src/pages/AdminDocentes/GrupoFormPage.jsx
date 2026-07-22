import React, { useState, useEffect } from 'react';
import { useGrupos } from '../../context/GrupoContext'; 
import { useCarreras } from '../../context/CarreraContext';
import { useNavigate, Link } from 'react-router-dom';
import MenuDocentes from '../../menu/MenuDocentes';

export default function GrupoFormPage() {
  const { createGrupo, errors: backendErrors } = useGrupos();
  const { carreras, getCarreras } = useCarrera(); 
  const navigate = useNavigate();

  const [grupo, setGrupo] = useState({
    nombre: '',
    programa: 'Licenciatura', 
    turno: 'Matutino',
    carrera: '', // ID de la carrera
    activo: true
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si al ejecutar esto da error, verifica que getCarreras esté exportado en tu contexto
    if (getCarreras) getCarreras();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createGrupo(grupo);
      navigate('/admin/grupos'); 
    } catch (error) {
      console.error("DETALLES DEL ERROR:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-900/10 overflow-hidden">
        <MenuDocentes />

        <div className="flex-1 overflow-y-auto p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-10">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/grupos" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-900 hover:border-blue-900 transition-all shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Nuevo <span className="text-blue-900">Grupo</span></h1>
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/60 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {backendErrors && backendErrors.length > 0 && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-bold text-sm">
                                {backendErrors.map((err, i) => <p key={i}>⚠️ {err}</p>)}
                            </div>
                        )}

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Grupo</label>
                                <input type="text" placeholder="Ej: 101-B" value={grupo.nombre} onChange={(e) => setGrupo({ ...grupo, nombre: e.target.value })} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-blue-900" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Carrera Asignada</label>
                                <select 
                                    value={grupo.carrera}
                                    onChange={(e) => setGrupo({ ...grupo, carrera: e.target.value })}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold cursor-pointer outline-none focus:ring-2 focus:ring-blue-900"
                                >
                                    <option value="">Selecciona una carrera...</option>
                                    {carreras && carreras.map(c => (
                                        <option key={c._id} value={c._id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Programa</label>
                                <select value={grupo.programa} onChange={(e) => setGrupo({ ...grupo, programa: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-blue-900">
                                    <option value="Licenciatura">Licenciatura</option>
                                    <option value="TSU">TSU</option>
                                    <option value="Nivelación">Nivelación</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Turno</label>
                                <select value={grupo.turno} onChange={(e) => setGrupo({ ...grupo, turno: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-blue-900">
                                    <option value="Matutino">Matutino</option>
                                    <option value="Vespertino">Vespertino</option>
                                    <option value="Sabatino">Sabatino</option>
                                    <option value="Virtual">Virtual</option>
                                </select>
                            </div>
                        </section>

                        <div className="pt-8 flex justify-end">
                            <button type="submit" disabled={loading} className="bg-blue-900 text-white font-black py-5 px-12 rounded-2xl shadow-xl hover:bg-blue-950 transition-all">
                                {loading ? 'GUARDANDO...' : 'REGISTRAR GRUPO'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
}