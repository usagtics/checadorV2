import React, { useEffect, useState } from 'react';
import { useAcademico } from '../../context/AcademicoContext';
import { usePeriodos } from '../../context/PeriodoContext';
import { Link } from 'react-router-dom';
import MenuDocentes from '../../menu/MenuDocentes';

export default function MateriasListPage() {
  const { materias, getMaterias, deleteMateria, loading } = useAcademico();
  const { periodos, getPeriodos } = usePeriodos();
  const [busqueda, setBusqueda] = useState('');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  
  const [materiaAEliminar, setMateriaAEliminar] = useState(null);

  useEffect(() => {
    getMaterias(periodoSeleccionado);
    getPeriodos();
  }, [periodoSeleccionado]);

  const materiasFiltradas = materias.filter((m) =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.clave.toLowerCase().includes(busqueda.toLowerCase())
  );

  const confirmarEliminacion = async () => {
    if (materiaAEliminar) {
      await deleteMateria(materiaAEliminar._id);
      setMateriaAEliminar(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden relative">
      <MenuDocentes />

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Catálogo de Materias</h1>
              <p className="text-gray-500 font-medium">Gestión de asignaturas y su estado por periodo.</p>
            </div>
            
            <Link to="/admin/materias/nueva" className="bg-blue-900 hover:bg-blue-950 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              NUEVA MATERIA
            </Link>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Buscar por clave o nombre..."
              className="md:col-span-2 w-full p-4 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-blue-100 transition-shadow"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select 
              className="w-full p-4 rounded-2xl border border-gray-200 font-bold text-gray-700 bg-white outline-none focus:ring-4 focus:ring-blue-100 transition-shadow cursor-pointer"
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            >
              <option value="">Todos los Periodos...</option>
              {periodos.map(p => (
                <option key={p._id} value={p._id}>
                  {p.nombre} {(p.activo || p.estado) ? 'Activo' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 flex flex-col h-[600px]">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left relative">
                <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 shadow-sm">
                  <tr>
                    <th className="px-8 py-5 text-xs uppercase tracking-widest text-gray-600 font-bold border-b border-gray-200">Clave</th>
                    <th className="px-8 py-5 text-xs uppercase tracking-widest text-gray-600 font-bold border-b border-gray-200">Nombre</th>
                    <th className="px-8 py-5 text-xs uppercase tracking-widest text-gray-600 font-bold text-center border-b border-gray-200">Estado</th>
                    <th className="px-8 py-5 text-xs uppercase tracking-widest text-gray-600 font-bold text-right border-b border-gray-200">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {materiasFiltradas.length > 0 ? (
                    materiasFiltradas.map((materia) => (
                      <tr key={materia._id} className="hover:bg-blue-50/40 transition-colors group">
                        <td className="px-8 py-5">
                          <span className="bg-blue-100 text-blue-900 font-mono font-bold px-3 py-1 rounded-lg text-sm">
                            {materia.clave}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-bold text-gray-800">{materia.nombre}</td>
                        
                        <td className="px-8 py-5 text-center">
                          {!periodoSeleccionado ? (
                            <span className="text-gray-400 text-sm italic">—</span>
                          ) : materia.activaEnPeriodo ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              En Periodo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                              No programada
                            </span>
                          )}
                        </td>
                        
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Link 
                              to={`/admin/materias/editar/${materia._id}`}
                              className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
                              title="Editar Materia"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>

                            <button 
                              // 👇 3. AHORA EL BOTÓN SOLO ABRE EL MODAL
                              onClick={() => setMateriaAEliminar(materia)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Eliminar Materia"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-12 text-center text-gray-500 font-medium">
                        No se encontraron materias que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-sm text-gray-600 font-medium flex justify-between items-center">
              <span>Total de materias: {materiasFiltradas.length}</span>
            </div>
          </div>
        </div>
      </div>

      {materiaAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 transition-all">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
            
            {/* Icono de advertencia */}
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-2xl font-black text-gray-900 text-center mb-2">
              ¿Eliminar materia?
            </h3>
            
            <p className="text-gray-500 text-center font-medium mb-8">
              Estás a punto de eliminar <span className="font-bold text-gray-800">{materiaAEliminar.clave}</span>. Esta acción no se puede deshacer y se borrará del catálogo.
            </p>

            <div className="flex flex-col-reverse md:flex-row gap-3 justify-center">
              <button 
                onClick={() => setMateriaAEliminar(null)} 
                className="px-6 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors w-full md:w-auto"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarEliminacion} 
                className="px-6 py-3.5 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all w-full md:w-auto"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}