import React, { useEffect, useState } from 'react';
import { useChecadasDocente } from '../../context/checadasDocenteContext'; 
import { Link } from 'react-router-dom';
import MenuDocentes from '../../menu/MenuDocentes';
import axios from 'axios'; 

const ReporteAsistenciaDocentesPage = () => {
  const { checadas, getChecadas, cargando, justificarAsistencia } = useChecadasDocente();
  const [busqueda, setBusqueda] = useState('');
  const [procesandoId, setProcesandoId] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [idAJustificar, setIdAJustificar] = useState(null);
  const [motivoTexto, setMotivoTexto] = useState('');

  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [detalleDocente, setDetalleDocente] = useState(null);

  useEffect(() => {
    getChecadas();
  }, []);

  const checadasFiltradas = checadas?.filter((checada) => {
    if (!busqueda) return true;
    const termino = busqueda.toLowerCase();
    const nombreDocente = `${checada.docente?.nombre || ''} ${checada.docente?.apellidos || ''}`.toLowerCase();
    const matricula = checada.docente?.numeroEmpleado?.toLowerCase() || '';
    return nombreDocente.includes(termino) || matricula.includes(termino);
  });

  const totalRegistros = checadasFiltradas?.length || 0;
  const totalATiempo = checadasFiltradas?.filter(c => c.estatus === 'A tiempo').length || 0;
  const totalRetardos = checadasFiltradas?.filter(c => c.estatus === 'Retardo').length || 0;
  const totalJustificados = checadasFiltradas?.filter(c => c.estatus === 'Justificado').length || 0;

  const abrirModalJustificar = (id) => {
      setIdAJustificar(id);
      setMotivoTexto(''); 
      setModalAbierto(true);
  };

  const confirmarJustificacion = async () => {
      if (motivoTexto.trim() === "") {
          alert("⚠️ Debes escribir un motivo.");
          return;
      }
      try {
          setProcesandoId(idAJustificar);
          setModalAbierto(false); 
          await justificarAsistencia(idAJustificar, motivoTexto);
      } catch (error) {
          alert("Hubo un error al justificar. Intenta de nuevo.");
      } finally {
          setProcesandoId(null);
          setIdAJustificar(null);
      }
  };

  const abrirDetalleDia = async (checada) => {
      try {
          const fechaObj = new Date(checada.fecha);
          const year = fechaObj.getFullYear();
          const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
          const day = String(fechaObj.getDate()).padStart(2, '0');
          const fechaCorta = `${year}-${month}-${day}`; 

          const docenteId = checada.docente._id;
          
          const response = await axios.get(`http://localhost:4000/api/asistencias/desglose/${docenteId}?fecha=${fechaCorta}`);
          
          const { cronograma, totalHoras } = response.data;

          setDetalleDocente({
              nombre: `${checada.docente?.nombre} ${checada.docente?.apellidos}`,
              fechaStr: new Date(checada.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }),
              cronograma: cronograma,
              totalPagar: totalHoras 
          });
          
          setModalDetalleAbierto(true);
      } catch (error) {
          console.error("Error al cargar el desglose:", error);
          alert("No se pudo cargar la línea de tiempo. Verifica la conexión con el servidor.");
      }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-900/10 overflow-hidden relative">
      <MenuDocentes />

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          
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
              Generar Nómina
            </Link>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
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
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Justificados</p>
                      <p className="text-2xl font-black text-purple-600">{totalJustificados}</p>
                  </div>
              </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
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

          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-gray-50/50">
                  <tr className="border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha y Hora</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Docente</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registro</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estatus</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
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
                          {checada.tipoRegistro === 'Entrada' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider border border-indigo-100">
                                Entrada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 text-xs font-black uppercase tracking-wider border border-orange-100">
                                Salida
                            </span>
                          )}
                        </td>

                        {/* ESTATUS */}
                        <td className="px-8 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              checada.estatus === 'A tiempo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              checada.estatus === 'Retardo' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              checada.estatus === 'Justificado' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              'bg-red-50 text-red-700 border-red-100'
                          }`}>
                              {checada.estatus}
                          </span>
                        </td>
                        
                        {/* ACCIONES */}
                        <td className="px-8 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={() => abrirDetalleDia(checada)}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl transition-all border border-blue-100"
                                    title="Ver línea de tiempo del día"
                                >
                                    Ver Detalle
                                </button>

                                {(checada.estatus === 'Retardo' || checada.estatus === 'Falta') && (
                                    <button
                                        onClick={() => abrirModalJustificar(checada._id)}
                                        disabled={procesandoId === checada._id}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl transition-all disabled:opacity-50"
                                    >
                                        Justificar
                                    </button>
                                )}
                            </div>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-10 py-24 text-center">
                          <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No hay checadas que coincidan</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

     
      {modalAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
               <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setModalAbierto(false)}></div>
               <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10">
                   <h3 className="text-xl font-black mb-2">Justificar Asistencia</h3>
                   <textarea 
                        rows="3" 
                        value={motivoTexto} onChange={(e) => setMotivoTexto(e.target.value)}
                        className="w-full border p-2 rounded mb-4"
                    ></textarea>
                   <button onClick={confirmarJustificacion} className="bg-purple-600 text-white p-2 rounded">Guardar</button>
               </div>
          </div>
      )}

      {modalDetalleAbierto && detalleDocente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => setModalDetalleAbierto(false)}
            ></div>
            
            <div className="bg-white rounded-[2rem] max-w-lg w-full relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="bg-blue-900 p-6 text-white">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-black">{detalleDocente.nombre}</h3>
                            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">{detalleDocente.fechaStr}</p>
                        </div>
                        <button onClick={() => setModalDetalleAbierto(false)} className="bg-blue-800 p-2 rounded-full hover:bg-blue-700">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto bg-gray-50 flex-1">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Línea de Tiempo del Día</h4>
                    
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                        
                        {detalleDocente.cronograma.map((item, idx) => (
                            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${item.tipo === 'clase' ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                    {item.tipo === 'clase' ? (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    )}
                                </div>
                                
                                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border shadow-sm ${item.tipo === 'clase' ? 'bg-white border-emerald-100' : 'bg-gray-100/50 border-gray-200 border-dashed'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-black text-sm ${item.tipo === 'clase' ? 'text-gray-900' : 'text-gray-500'}`}>{item.materia}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {item.horario}
                                    </div>
                                    <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${item.tipo === 'clase' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
                
                <div className="p-6 bg-white border-t border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumen del Día</p>
                        <p className="text-sm font-bold text-gray-900">Total a pagar: <span className="text-emerald-600">{detalleDocente.totalPagar} Hrs</span></p>
                    </div>
                    <button onClick={() => setModalDetalleAbierto(false)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ReporteAsistenciaDocentesPage;