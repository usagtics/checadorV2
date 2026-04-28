import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { getDirectivosRequest, deleteDirectivoRequest } from '../../api/directivoAuth';

import MenuDocentes from '../../menu/MenuDocentes';

export default function GestionDirectivosPage() {
  const [directivos, setDirectivos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDirectivos = async () => {
    try {
      const res = await getDirectivosRequest();
      setDirectivos(res.data);
    } catch (error) {
      console.error("Error al cargar directivos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectivos();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este administrador?")) {
      try {
        await deleteDirectivoRequest(id);
        loadDirectivos();
      } catch (error) {
        console.error("No se pudo eliminar");
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-900/10 overflow-hidden">
      
      <MenuDocentes />

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          
          <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-1.5 bg-blue-900 rounded-full"></div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                  Gestión de <span className="text-blue-900">Directivos</span>
                </h1>
              </div>
              <p className="text-gray-500 font-medium ml-4">Panel de control de usuarios administrativos.</p>
            </div>
            
            <Link 
              to="/admin/nuevo-directivo" 
              className="bg-blue-900 hover:bg-blue-950 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 transform active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              NUEVO ADMINISTRADOR
            </Link>
          </header>

          {/* --- TABLA --- */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/60 overflow-hidden border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Usuario / Email</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Área Asignada</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-8 py-16 text-center text-blue-900 font-bold animate-pulse">
                      Cargando directivos...
                    </td>
                  </tr>
                ) : directivos.length > 0 ? (
                  directivos.map((dir) => (
                    <tr key={dir._id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black border border-blue-200">
                            {dir.username?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block leading-tight">{dir.username}</span>
                            <span className="text-xs text-gray-400 font-medium">{dir.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-blue-50 text-blue-900 border border-blue-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {dir.carrera}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDelete(dir._id)} 
                          className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                          title="Eliminar Administrador"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-8 py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <p className="text-gray-400 font-black text-xs uppercase tracking-widest">No hay directivos registrados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}