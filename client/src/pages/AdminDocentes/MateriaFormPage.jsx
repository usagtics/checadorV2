import React, { useState } from 'react';
import { useAcademico } from '../../context/AcademicoContext';
import { useNavigate, Link } from 'react-router-dom';
import MenuDocentes from '../../menu/MenuDocentes';

export default function MateriaFormPage() {
  const { createMateria, errors: backendErrors } = useAcademico();
  const navigate = useNavigate();
  
  const [materia, setMateria] = useState({ nombre: '', clave: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMateria(materia);
      navigate('/admin/materias');
    } catch (error) {
      console.error("Error al guardar materia:", error);
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
                        <Link 
                            to="/admin/materias" 
                            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-900 hover:border-blue-900 transition-all shadow-sm"
                            title="Volver al catálogo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="h-8 w-1.5 bg-blue-900 rounded-full"></div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
                                    Nueva <span className="text-blue-900">Materia</span>
                                </h1>
                            </div>
                            <p className="text-gray-500 font-medium text-sm ml-4">
                                Añade una nueva asignatura al catálogo académico.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/60 border border-gray-100">
                    
                    {backendErrors && backendErrors.length > 0 && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold">
                            {backendErrors.map((error, i) => (
                                <p key={i} className="flex items-center gap-2">⚠️ {error}</p>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-6 h-6 bg-blue-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">01</span>
                                <h2 className="text-blue-900 font-black uppercase tracking-widest text-xs">Datos de la Asignatura</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Radiología Intervencionista"
                                        value={materia.nombre}
                                        onChange={(e) => setMateria({...materia, nombre: e.target.value})}
                                        required 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all font-bold" 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Clave de Materia</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: RAD-402"
                                        value={materia.clave}
                                        onChange={(e) => setMateria({...materia, clave: e.target.value})}
                                        required 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all font-bold font-mono uppercase" 
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="pt-8 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className={`min-w-[280px] bg-blue-900 hover:bg-blue-950 text-white font-black py-5 px-8 rounded-2xl shadow-xl shadow-blue-900/20 flex justify-center items-center transition-all transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        GUARDANDO...
                                    </div>
                                ) : 'GUARDAR EN CATÁLOGO'}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>
  );
}