import React, { useEffect } from 'react';
import { useAcademico } from '../../context/AcademicoContext';
import { Link } from 'react-router-dom';

export default function MateriasListPage() {
  const { materias, getMaterias, deleteMateria } = useAcademico();

  useEffect(() => {
    getMaterias();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans selection:bg-blue-900/10">
      <div className="max-w-5xl mx-auto">
        
        {/* --- ENCABEZADO --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-8 w-1.5 bg-blue-900 rounded-full"></div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Catálogo de Materias</h1>
            </div>
            <p className="text-gray-500 font-medium ml-4">Listado oficial de asignaturas registradas</p>
          </div>
          
          <Link 
            to="/admin/materias/nueva" 
            className="group bg-blue-900 hover:bg-blue-950 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 transform active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            NUEVA MATERIA
          </Link>
        </div>

        {/* --- TABLA DE MATERIAS --- */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/60 overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Clave</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Nombre de la Materia</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materias.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mb-4">
                          <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                          </svg>
                        </div>
                        <p className="text-gray-400 font-black italic uppercase text-xs">No hay materias registradas aún</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  materias.map((materia) => (
                    <tr key={materia._id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-black text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg text-sm font-mono">
                          {materia.clave}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-bold text-gray-900 text-lg tracking-tight group-hover:translate-x-1 transition-transform inline-block">
                          {materia.nombre}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => deleteMateria(materia._id)}
                          className="inline-flex items-center gap-2 p-3 bg-gray-50 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-gray-200 shadow-sm"
                          title="Eliminar materia"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Eliminar</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}