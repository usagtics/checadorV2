import React, { useEffect, useState } from 'react';
import { useChecadasDocente } from '../../context/checadasDocenteContext'; 
import { Link } from 'react-router-dom';

import MenuDocentes from '../../menu/MenuDocentes';

const ReporteAsistenciaDocentesPage = () => {
  const { checadas, getChecadas, cargando } = useChecadasDocente();
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    getChecadas();
  }, []);

  // Filtro de búsqueda
  const checadasFiltradas = checadas?.filter((checada) => {
    if (!busqueda) return true;
    const termino = busqueda.toLowerCase();
    const nombreDocente = `${checada.docente?.nombre || ''} ${checada.docente?.apellidos || ''}`.toLowerCase();
    const matricula = checada.docente?.numeroEmpleado?.toLowerCase() || '';
    return nombreDocente.includes(termino) || matricula.includes(termino);
  });

  // --- ESTADÍSTICAS DINÁMICAS BASADAS EN LA BÚSQUEDA ---
  const totalRegistros = checadasFiltradas?.length || 0;
  const totalATiempo = checadasFiltradas?.filter(c => c.estatus === 'A tiempo').length || 0;
  const totalRetardos = checadasFiltradas?.filter(c => c.estatus === 'Retardo').length || 0;

  return (
    <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-900/10 overflow-hidden">
      
      {/* --- MENÚ LATERAL --- */}
      <MenuDocentes />

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          
          {/* --- ENCABEZADO --- */}
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-1.5 bg-blue-900 rounded-full"></div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Monitor de Asistencia</h1>
              </div>
              <p className="text-gray-500 text-sm font-medium mt-2 ml-4">Supervisión en tiempo real de entradas y salidas de la plantilla docente.</p>
            </div>
            
            <Link 
              to="/admin/nomina" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs tracking-widest uppercase py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Generar Nómina
            </Link>
          </header>

          {/* --- KPI'S (ESTADÍSTICAS DINÁMICAS) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registros Visibles</p>
                      <p className="text-2xl font-black text-gray-900">{totalRegistros}</p>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">A Tiempo</p>
                      <p className="text-2xl font-black text-emerald-600">{totalATiempo}</p>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Retardos</p>
                      <p className="text-2xl font-black text-amber-600">{totalRetardos}</p>
                  </div>
              </div>
          </div>

          {/* --- BARRA DE BÚSQUEDA --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre o número de empleado..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm font-bold text-gray-700 transition-all"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {/* --- TABLA DE REGISTROS --- */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-gray-50/50">
                  <tr className="border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha y Hora</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Docente</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Materia</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registro</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cargando ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin mb-2"></div>
                        <p className="text-gray-500 font-bold text-sm">Sincronizando reloj checador...</p>
                      </td>
                    </tr>
                  ) : checadasFiltradas && checadasFiltradas.length > 0 ? (
                    checadasFiltradas.map((checada, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100">
                                <span className="text-[9px] font-black text-gray-400 uppercase leading-none">{new Date(checada.fecha).toLocaleDateString('es-MX', { month: 'short' })}</span>
                                <span className="text-sm font-black text-gray-900 leading-none">{new Date(checada.fecha).getDate()}</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{new Date(checada.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{new Date(checada.fecha).toLocaleDateString('es-MX', { weekday: 'long' })}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-black text-xs border border-blue-200">
                              {checada.docente?.nombre?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{checada.docente?.nombre} {checada.docente?.apellidos}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {checada.docente?.numeroEmpleado}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 block w-max">
                                {checada.materia?.nombre || 'Sin asignación'}
                            </span>
                        </td>
                        <td className="px-8 py-4">
                          {checada.tipoRegistro === 'Entrada' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider border border-indigo-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                Entrada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 text-xs font-black uppercase tracking-wider border border-orange-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Salida
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-4 text-center">
                          {checada.estatus === 'A tiempo' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                              A Tiempo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-100">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                              Retardo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-10 py-24 text-center">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          </div>
                          <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No hay checadas que coincidan</p>
                          <p className="text-gray-400 text-xs mt-1">Intenta buscar con otro nombre o matrícula.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReporteAsistenciaDocentesPage;