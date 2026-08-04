import React, { useState, useEffect, useMemo } from 'react';
import { useDirectivo } from '../../context/DirectivoContext';
import { useAcademico } from '../../context/AcademicoContext';
import { useDocentes } from '../../context/DocenteContext'; 
import { Link } from 'react-router-dom';

import MenuDocentes from '../../menu/MenuDocentes';

export default function DashboardDirectivoPage() {
  const { user } = useDirectivo();
  const { ofertas, grupos, getOfertas, getGrupos } = useAcademico();
  const { docentes, getDocentes } = useDocentes();

  useEffect(() => {
    getOfertas();
    getGrupos();
    getDocentes();
  }, []);

  // --- FILTRAR OFERTAS ACADÉMICAS SEGÚN LAS CARRERAS DEL DIRECTIVO ---
  const ofertasActivas = useMemo(() => {
    if (!Array.isArray(ofertas)) return [];

    // Si es super-admin, ve todo
    if (user?.role === 'super-admin') return ofertas;

    // Si el directivo tiene carreras asignadas, filtramos los grupos que pertenecen a esas carreras
    if (user?.carreras && user.carreras.length > 0) {
      const idsCarrerasUsuario = user.carreras.map(c => c._id ? c._id.toString() : c.toString());

      return ofertas.filter(oferta => {
        const carreraGrupo = oferta?.grupo?.carrera;
        if (!carreraGrupo) return false;
        const idCarreraGrupo = typeof carreraGrupo === 'object' ? carreraGrupo._id.toString() : carreraGrupo.toString();
        return idsCarrerasUsuario.includes(idCarreraGrupo);
      });
    }

    return []; // Si no tiene carreras ni es super-admin, no ve nada por seguridad
  }, [ofertas, user]);

  // --- AGRUPAR CARGA POR DOCENTE PARA EL HORARIO VISUAL ---
  const cargaPorDocente = useMemo(() => {
    const agrupado = {};
    
    ofertasActivas.forEach(oferta => {
      // Si la oferta no tiene docente, la asignamos a una categoría "Sin Asignar"
      const docId = oferta.docente?._id || 'sin-asignar';
      
      if (!agrupado[docId]) {
        agrupado[docId] = {
          docente: oferta.docente || { nombre: 'Docente', apellidos: 'Sin Asignar', numeroEmpleado: 'N/A' },
          clases: []
        };
      }
      agrupado[docId].clases.push(oferta);
    });

    // Convertimos a arreglo y ordenamos alfabéticamente por nombre
    return Object.values(agrupado).sort((a, b) => {
      const nomA = a.docente?.nombre || '';
      const nomB = b.docente?.nombre || '';
      return nomA.localeCompare(nomB);
    });
  }, [ofertasActivas]);

  const totalDocentes = Array.isArray(docentes) ? docentes.length : 0;
  const totalGrupos = Array.isArray(grupos) ? grupos.length : 0;
  
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diasOperativos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']; // Días a mostrar en el Grid
  const diaHoy = diasSemana[new Date().getDay()];
  
  const clasesHoy = Array.isArray(ofertasActivas) 
    ? ofertasActivas.reduce((total, oferta) => {
        const tieneClaseHoy = oferta?.horarios?.some(h => h.diaSemana === diaHoy || h.dia === diaHoy);
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
                  Bienvenido, Director <span className="text-white font-bold">{user?.nombre || user?.username || 'Directivo'}</span>
                </p>
                
                {user?.carreras && user.carreras.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {user.carreras.map((carrera, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-800/60 text-blue-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-700/50 shadow-sm backdrop-blur-sm"
                      >
                        {carrera.nombre || carrera.clave || 'Carrera'}
                      </span>
                    ))}
                  </div>
                )}
                
              </div>
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

          <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden mb-10 pb-8">
            
            <div className="p-8 md:p-10 border-b border-gray-50">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Carga Académica y Horarios</h2>
              <p className="text-gray-400 text-xs font-medium mt-1 uppercase tracking-widest">Vista detallada de los docentes asignados a tu carrera</p>
            </div>

            {/* --- CONTENEDOR DE TARJETAS TIPO HORARIO --- */}
            <div className="px-6 md:px-10 pt-8 space-y-8">
              {cargaPorDocente.length > 0 ? (
                cargaPorDocente.map((carga, idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    
                    {/* ENCABEZADO DEL DOCENTE */}
                    <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white text-blue-900 rounded-xl flex items-center justify-center font-black text-lg border border-gray-200 shadow-sm">
                          {carga.docente?.nombre?.charAt(0) || '-'}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-gray-900 leading-tight">
                            {carga.docente.nombre} {carga.docente.apellidos}
                          </h3>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                            Matrícula: {carga.docente.numeroEmpleado}
                          </p>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {carga.clases.length} Materias
                        </span>
                      </div>
                    </div>

                    {/* HORARIO SEMANAL (GRID) */}
                    <div className="p-6 overflow-x-auto">
                      <div className="min-w-[900px] grid grid-cols-6 gap-4">
                        
                        {diasOperativos.map((diaStr) => {
                          // Extraemos las clases que caen en este día específico y las aplanamos
                          const clasesDelDia = carga.clases.flatMap(oferta => {
                            const horariosDia = oferta.horarios?.filter(h => 
                              (h.diaSemana || h.dia || '').toLowerCase() === diaStr.toLowerCase()
                            ) || [];
                            
                            return horariosDia.map(h => ({
                              ...oferta,
                              horarioEspecifico: h
                            }));
                          });

                          // Ordenamos las clases del día cronológicamente
                          clasesDelDia.sort((a, b) => a.horarioEspecifico.horaInicio.localeCompare(b.horarioEspecifico.horaInicio));

                          return (
                            <div key={diaStr} className="flex flex-col h-full bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                              <div className={`text-center py-2 border-b border-gray-200 ${diaHoy === diaStr ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  {diaStr}
                                </span>
                              </div>
                              
                              <div className="p-3 flex-1 flex flex-col gap-3">
                                {clasesDelDia.length > 0 ? (
                                  clasesDelDia.map((clase, i) => (
                                    <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 hover:-translate-y-0.5 transition-transform">
                                      <div className="flex items-center gap-1.5 mb-1.5 text-blue-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="text-[10px] font-black tracking-widest">
                                          {clase.horarioEspecifico.horaInicio} - {clase.horarioEspecifico.horaFin}
                                        </span>
                                      </div>
                                      <p className="text-xs font-bold text-gray-800 leading-tight mb-2">
                                        {clase.materia?.nombre}
                                      </p>
                                      <div className="flex justify-between items-center mt-auto">
                                        <span className="text-[9px] font-black text-gray-400 uppercase">
                                          G: {clase.grupo?.nombre}
                                        </span>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex-1 flex items-center justify-center min-h-[60px]">
                                    <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest">Libre</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-16 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <h3 className="text-lg font-black text-gray-800 mb-1">Sin carga académica</h3>
                  <p className="text-sm font-bold text-gray-400">No hay horarios registrados para tu carrera en el sistema.</p>
                </div>
              )}
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}