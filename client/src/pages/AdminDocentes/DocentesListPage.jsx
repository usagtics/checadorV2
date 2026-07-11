import React, { useEffect, useState, useMemo } from 'react';
import { useDocentes } from '../../context/DocenteContext';
import { useDirectivo } from '../../context/DirectivoContext';
import { usePeriodos } from '../../context/PeriodoContext'; 
import { Link } from 'react-router-dom';
import MenuDocentes from '../../menu/MenuDocentes'; 

export default function DocentesListPage() {
  const { getDocentes, docentes, loading } = useDocentes();
  const { user } = useDirectivo();
  const { periodos, getPeriodos } = usePeriodos(); 
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriodo, setSelectedPeriodo] = useState("");

  useEffect(() => {
    getDocentes();
    getPeriodos(); 
  }, []);

  const handleViewQR = (docente) => {
    setSelectedDocente(docente);
    setShowQRModal(true);
  };

  const handleViewHorario = (docente) => {
    setSelectedDocente(docente);
    setShowHorarioModal(true);
  };

  const descargarQR = () => {
    if (!selectedDocente?.qrCode) return;
    const link = document.createElement("a");
    link.href = selectedDocente.qrCode;
    link.download = `QR_${selectedDocente.nombre}_${selectedDocente.numeroEmpleado}.png`;
    link.click();
  };

  const docentesFiltrados = docentes.filter(docente => {
    const matchesSearch = 
      docente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.numeroEmpleado.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesPeriodo = true;
    if (selectedPeriodo !== "") {
        matchesPeriodo = docente.ofertaAcademica?.some(
            oferta => oferta.periodo && oferta.periodo._id === selectedPeriodo
        );
    }

    let matchesCarrera = true;
    if (user?.role !== 'super-admin' && user?.carreras && user.carreras.length > 0) {
        matchesCarrera = docente.ofertaAcademica?.some(
            oferta => oferta.grupo && user.carreras.includes(oferta.grupo.programa)
        );
    }

    return matchesSearch && matchesPeriodo && matchesCarrera;
  });

  // 👇 NUEVA LÓGICA: Procesar y agrupar el horario por día para el modal 👇
  const horarioAgrupado = useMemo(() => {
    if (!selectedDocente || !selectedDocente.ofertaAcademica) return [];

    const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const agrupado = {};

    selectedDocente.ofertaAcademica.forEach(oferta => {
      if (oferta.horarios && oferta.horarios.length > 0) {
        oferta.horarios.forEach(horario => {
          // Normalizar el nombre del día
          const diaRaw = horario.dia || horario.diaSemana;
          const dia = diaRaw.charAt(0).toUpperCase() + diaRaw.slice(1).toLowerCase();

          if (!agrupado[dia]) agrupado[dia] = [];
          
          agrupado[dia].push({
            materia: oferta.materia?.nombre || 'Materia sin nombre',
            grupo: oferta.grupo?.nombre || 'General',
            periodo: oferta.periodo?.nombre || 'Sin definir',
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin
          });
        });
      }
    });

    // Convertir el objeto a un arreglo ordenado por día y luego por hora de inicio
    return Object.keys(agrupado)
      .sort((a, b) => diasOrden.indexOf(a) - diasOrden.indexOf(b))
      .map(dia => ({
        dia,
        clases: agrupado[dia].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
      }));
  }, [selectedDocente]);


  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-blue-900 font-black animate-pulse text-xl tracking-tighter">
        Cargando plantilla docente...
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-900/10 overflow-hidden">
      
      <MenuDocentes />

      <div className="flex-1 overflow-y-auto p-4 md:p-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-1.5 bg-blue-900 rounded-full"></div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Plantilla de Docentes</h1>
              </div>
              <p className="text-gray-500 font-medium ml-4">
                Carrera de <span className="font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{user?.carreras?.join(', ') || 'Administración'}</span>
              </p>
            </div>
            
            <Link 
              to="/admin/registro-docente" 
              className="group bg-blue-900 hover:bg-blue-950 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 transform active:scale-95"
            >
              NUEVO DOCENTE
            </Link>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o matrícula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all font-medium text-sm"
                />
            </div>

            <div className="w-full md:w-64">
                <select 
                    value={selectedPeriodo}
                    onChange={(e) => setSelectedPeriodo(e.target.value)}
                    className="w-full px-4 py-4 bg-purple-50 border border-purple-100 text-purple-900 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none transition-all font-bold text-sm cursor-pointer appearance-none"
                >
                    <option value="">Todos los periodos</option>
                    {periodos && periodos.map((p) => (
                        <option key={p._id} value={p._id}>
                            {p.nombre} {p.activo ? '⭐' : ''}
                        </option>
                    ))}
                </select>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/60 overflow-hidden border border-gray-100 mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Nombre del Docente</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Contacto</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Materia(s) Asignada(s)</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {docentesFiltrados.length > 0 ? (
                      docentesFiltrados.map((docente) => (
                        <tr key={docente._id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-black border border-blue-200">
                                {docente.nombre ? docente.nombre.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 block leading-tight">{docente.nombre} {docente.apellidos}</span>
                                <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Matrícula: {docente.numeroEmpleado}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-8 py-6">
                            <span className="text-sm text-gray-700 font-bold block">{docente.email}</span>
                            <span className="text-xs text-gray-400 font-medium italic">{docente.telefono || 'Sin teléfono'}</span>
                          </td>

                          <td className="px-8 py-6">
                            <div className="flex flex-wrap gap-2">
                              {docente.materias && docente.materias.length > 0 ? (
                                docente.materias.map((m, i) => (
                                  <span key={i} className="inline-block bg-blue-50 text-blue-900 text-[9px] px-2 py-1 rounded-lg font-black uppercase">
                                    {typeof m === 'string' ? m : m.nombre}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-300 text-[10px] font-black uppercase">Sin carga</span>
                              )}
                            </div>
                          </td>

                          <td className="px-8 py-6 text-center">
                            <div className="flex justify-center gap-2">
                              
                              <button 
                                onClick={() => handleViewHorario(docente)}
                                className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-100 shadow-sm"
                                title="Ver Horario"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </button>

                              <button 
                                onClick={() => handleViewQR(docente)}
                                className="p-2 bg-blue-50 text-blue-900 hover:bg-blue-900 hover:text-white rounded-xl transition-all border border-blue-100 shadow-sm"
                                title="Ver Código QR"
                              >
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 11v1m5-16v1m0 11v1M4 8h1m11 0h1M4 12h1m11 0h1M4 16h1m11 0h1m-4-8H4m4 8h8m-4-4h.01M9 4h6m-6 16h6" />
                                 </svg>
                              </button>
                              
                              <Link 
                                to={`/admin/asignacion?docente=${docente._id}`} 
                                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-100 shadow-sm" 
                                title="Asignar Materia"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </Link>

                              <Link 
                                to={`/admin/registro-docente/${docente._id}`}
                                className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-800 hover:text-white rounded-xl transition-all border border-gray-200 shadow-sm" 
                                title="Editar Docente"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                  ) : (
                      <tr>
                          <td colSpan="4" className="px-8 py-16 text-center text-gray-400 font-bold text-sm">
                              No se encontraron docentes con los filtros aplicados.
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {showQRModal && selectedDocente && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-1">{selectedDocente.nombre}</h2>
            <p className="text-blue-900 font-bold text-[10px] uppercase tracking-widest mb-8">Código QR de Asistencia</p>

            <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-dashed border-gray-200 mb-8 inline-block">
              <img src={selectedDocente.qrCode} alt="QR Docente" className="w-48 h-48 mx-auto shadow-sm rounded-lg" />
            </div>

            <div className="space-y-3">
              <button onClick={descargarQR} className="w-full bg-blue-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-950 transition-all shadow-lg shadow-blue-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                DESCARGAR IMAGEN
              </button>
              <button onClick={() => setShowQRModal(false)} className="w-full text-gray-400 font-bold text-xs uppercase tracking-[0.2em] py-2 hover:text-gray-600 transition-colors">
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👇 NUEVO DISEÑO DEL MODAL DE HORARIO 👇 */}
      {showHorarioModal && selectedDocente && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] p-8 md:p-10 max-w-3xl w-full shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">Agenda de Clases</h2>
                <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest">
                  Docente {selectedDocente.nombre} {selectedDocente.apellidos}
                </p>
              </div>
              <button onClick={() => setShowHorarioModal(false)} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-6 custom-scrollbar mb-6">
              {horarioAgrupado.length > 0 ? (
                horarioAgrupado.map((diaInfo, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-[2rem] border border-gray-100 p-6 relative overflow-hidden">
                    {/* Decoración visual para el día */}
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 rounded-l-[2rem]"></div>
                    
                    <h3 className="text-lg font-black text-indigo-900 mb-4 ml-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {diaInfo.dia}
                    </h3>

                    <div className="space-y-3 ml-4">
                      {diaInfo.clases.map((clase, cIdx) => (
                        <div key={cIdx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">{clase.materia}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                              Grupo: <span className="text-indigo-600">{clase.grupo}</span> • {clase.periodo}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 w-fit">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-black text-sm">{clase.horaInicio} - {clase.horaFin}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-gray-900 font-black text-lg mb-1">Sin Agenda</h4>
                  <p className="text-gray-500 font-medium text-sm max-w-xs mx-auto">
                    Aún no se le han asignado horas de clase a este docente en el sistema.
                  </p>
                </div>
              )}
            </div>

            <div className="shrink-0 pt-2 border-t border-gray-100 mt-2">
              <button onClick={() => setShowHorarioModal(false)} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                CERRAR AGENDA
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}