import React, { useState, useEffect } from 'react';
import { useDirectivo } from '../../context/DirectivoContext';
import { useAcademico } from '../../context/AcademicoContext';
import { useDocentes } from '../../context/DocenteContext'; 
import { Link } from 'react-router-dom';

import MenuDocentes from '../../menu/MenuDocentes';

export default function DashboardDirectivoPage() {
  const { user } = useDirectivo();
  const { ofertas, grupos, getOfertas, getGrupos } = useAcademico();
  const { docentes, getDocentes } = useDocentes();

  const [programaActivo, setProgramaActivo] = useState('Licenciatura');

  useEffect(() => {
    getOfertas();
    getGrupos();
    getDocentes();
  }, []);

  const ofertasFiltradas = Array.isArray(ofertas) 
    ? ofertas.filter(o => o?.grupo?.programa === programaActivo) 
    : [];

  const totalDocentes = Array.isArray(docentes) ? docentes.length : 0;
  const totalGrupos = Array.isArray(grupos) ? grupos.length : 0;
  
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaHoy = diasSemana[new Date().getDay()];
  
  const clasesHoy = Array.isArray(ofertas) 
    ? ofertas.reduce((total, oferta) => {
        const tieneClaseHoy = oferta?.horarios?.some(h => h.diaSemana === diaHoy);
        return tieneClaseHoy ? total + 1 : total;
      }, 0)
    : 0;

  return (
    <div className="flex items-start w-full min-h-screen bg-gray-50 font-sans selection:bg-blue-900/10 selection:text-blue-900 overflow-hidden">
      
      <MenuDocentes />

      <div className="flex-1 w-full p-6 md:p-10 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          
          <header className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-3xl p-6 shadow-lg shadow-blue-900/10 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-800/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-[60px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>

            <div className="text-center md:text-left relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner hidden md:flex">
                <span className="text-white font-black text-xl">U</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight leading-none">Panel de Gestión Académica</h1>
                <p className="text-blue-200 mt-1 text-sm font-medium">
                  Bienvenido, Director de <span className="text-white font-bold">{user?.carrera || 'Cargando...'}</span>
                </p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-2.5 rounded-2xl text-center shadow-inner relative z-10">
              <p className="text-[9px] text-blue-300 font-black uppercase tracking-[0.2em]">Sesión Activa</p>
              <p className="text-white font-bold text-sm">{user?.username || 'Administrador'}</p>
            </div>
          </header>

          <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1.5 bg-blue-900 rounded-full"></div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Resumen Operativo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Docentes Activos</p>
                      <h3 className="text-3xl font-black text-blue-900">{totalDocentes}</h3>
                  </div>
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Clases ({diaHoy})</p>
                      <h3 className="text-3xl font-black text-emerald-600">{clasesHoy}</h3>
                  </div>
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Grupos Registrados</p>
                      <h3 className="text-3xl font-black text-violet-900">{totalGrupos}</h3>
                  </div>
                  <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
              </div>

          </div>

          <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden mb-10">
            
            <div className="p-8 md:p-10 border-b border-gray-50 flex flex-col lg:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Carga Académica Detallada</h2>
                <p className="text-gray-400 text-xs font-medium mt-1 uppercase tracking-widest">Filtrado por programa educativo</p>
              </div>
              
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
                {['Licenciatura', 'TSU', 'Nivelación'].map((prog) => (
                  <button
                    key={prog}
                    onClick={() => setProgramaActivo(prog)}
                    className={`px-6 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                      programaActivo === prog 
                      ? 'bg-white text-blue-900 shadow-md border border-gray-100' 
                      : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {prog}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Docente</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asignatura</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Grupo</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ofertasFiltradas.length > 0 ? (
                    ofertasFiltradas.map((oferta) => (
                      <tr key={oferta._id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-10 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-900 text-white rounded-xl flex items-center justify-center font-black text-sm border-2 border-blue-100 shadow-sm">
                              {oferta.docente?.nombre?.charAt(0) || '-'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{oferta.docente?.nombre} {oferta.docente?.apellidos}</p>
                              <p className="text-[10px] text-gray-400 font-bold tracking-wider">ID: {oferta.docente?.numeroEmpleado}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-5">
                          <p className="font-bold text-gray-800 text-sm">{oferta.materia?.nombre}</p>
                          <p className="text-[10px] text-blue-600 font-black">{oferta.materia?.clave}</p>
                        </td>
                        <td className="px-10 py-5">
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-[10px] font-black border border-gray-200">
                            {oferta.grupo?.nombre} - {oferta.grupo?.turno}
                          </span>
                        </td>
                        <td className="px-10 py-5 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Vigente
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-10 py-20 text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                              <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                          </div>
                          <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Sin registros disponibles</p>
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
}