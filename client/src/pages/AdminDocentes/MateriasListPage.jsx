import React, { useEffect, useState } from 'react';
import { useAcademico } from '../../context/AcademicoContext';
import { usePeriodos } from '../../context/PeriodoContext'; // 1. Importamos Periodos
import { Link } from 'react-router-dom';
import MenuDocentes from '../../menu/MenuDocentes';

export default function MateriasListPage() {
  const { materias, getMaterias, deleteMateria, loading } = useAcademico();
  const { periodos, getPeriodos } = usePeriodos(); // 2. Hook de periodos
  const [busqueda, setBusqueda] = useState('');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');

  useEffect(() => {
    getMaterias();
    getPeriodos();
  }, []);

  // 3. Lógica para filtrar por búsqueda
  const materiasFiltradas = materias.filter((m) =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.clave.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
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

          {/* Filtros: Buscador + Periodo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Buscar por clave o nombre..."
              className="md:col-span-2 w-full p-4 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-blue-100"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select 
              className="w-full p-4 rounded-2xl border border-gray-200 font-black text-blue-900 bg-blue-50 outline-none"
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            >
              <option value="">Filtrar por Periodo...</option>
              {periodos.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Clave</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Nombre</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black text-center">Estado en Periodo</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materiasFiltradas.map((materia) => (
                  <tr key={materia._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-6 font-mono font-black text-blue-900">{materia.clave}</td>
                    <td className="px-8 py-6 font-bold text-gray-900 text-lg">{materia.nombre}</td>
                    <td className="px-8 py-6 text-center">
                        {periodoSeleccionado ? (
                             <span className="text-[10px] font-black uppercase text-blue-400">Verificando...</span>
                        ) : (
                             <span className="text-[10px] font-black uppercase text-gray-300">Selecciona periodo</span>
                        )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => window.confirm('¿Seguro?') && deleteMateria(materia._id)}
                        className="text-red-500 font-black uppercase text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}