import React, { useEffect, useState } from 'react';
import { useChecadasDocente } from '../../context/checadasDocenteContext'; 
import { Link } from 'react-router-dom';
import MenuDocentes from '../../menu/MenuDocentes';
import axios from 'axios'; 

// FUNCIÓN PARA OBTENER LA ETIQUETA DE LA SEMANA
const obtenerEtiquetaSemana = (fechaString) => {
    const fecha = new Date(fechaString);
    const dia = fecha.getDay(); 
    const diasARestar = dia === 0 ? 6 : dia - 1; 

    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() - diasARestar);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    const options = { day: 'numeric', month: 'short' };
    return `Semana del ${lunes.toLocaleDateString('es-MX', options)} al ${domingo.toLocaleDateString('es-MX', options)}`;
};

const obtenerDiaLegible = (fechaString) => {
    const fecha = new Date(fechaString);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (fecha.toDateString() === hoy.toDateString()) return "HOY";
    if (fecha.toDateString() === ayer.toDateString()) return "AYER";
    
    const diaSemana = fecha.toLocaleDateString('es-MX', { weekday: 'long' });
    return diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1); 
};

const ReporteAsistenciaDocentesPage = () => {
  const { checadas, getChecadas, cargando, justificarAsistencia } = useChecadasDocente();
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  
  const [paginaActual, setPaginaActual] = useState(1);
  const docentesPorPagina = 5;

  const [procesandoId, setProcesandoId] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [idAJustificar, setIdAJustificar] = useState(null);
  const [motivoTexto, setMotivoTexto] = useState('');

  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [detalleDocente, setDetalleDocente] = useState(null);

  useEffect(() => {
    getChecadas();
  }, []);

  useEffect(() => {
      setPaginaActual(1);
  }, [busqueda, filtroEstatus, filtroFecha]);

  const checadasFiltradas = checadas?.filter((checada) => {
    let coincideTexto = true;
    if (busqueda) {
        const termino = busqueda.toLowerCase();
        const nombreDocente = `${checada.docente?.nombre || ''} ${checada.docente?.apellidos || ''}`.toLowerCase();
        const matricula = checada.docente?.numeroEmpleado?.toLowerCase() || '';
        coincideTexto = nombreDocente.includes(termino) || matricula.includes(termino);
    }

    let coincideEstatus = true;
    if (filtroEstatus) {
        coincideEstatus = checada.estatus === filtroEstatus;
    }

    let coincideFecha = true;
    if (filtroFecha) {
        const fechaObj = new Date(checada.fecha);
        const year = fechaObj.getFullYear();
        const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const day = String(fechaObj.getDate()).padStart(2, '0');
        const fechaChecadaStr = `${year}-${month}-${day}`; 
        
        coincideFecha = fechaChecadaStr === filtroFecha;
    }

    return coincideTexto && coincideEstatus && coincideFecha;
  });

  const checadasAgrupadas = checadasFiltradas?.reduce((grupos, checada) => {
      const docenteId = checada.docente?._id || 'desconocido';
      const etiquetaSemana = obtenerEtiquetaSemana(checada.fecha);

      if (!grupos[docenteId]) {
          grupos[docenteId] = {
              docente: checada.docente,
              registrosTotales: [], 
              semanas: {} 
          };
      }

      if (!grupos[docenteId].semanas[etiquetaSemana]) {
          grupos[docenteId].semanas[etiquetaSemana] = [];
      }

      grupos[docenteId].semanas[etiquetaSemana].push(checada);
      grupos[docenteId].registrosTotales.push(checada);
      
      return grupos;
  }, {});

  const gruposArray = Object.values(checadasAgrupadas || {});
  const totalPaginas = Math.ceil(gruposArray.length / docentesPorPagina);
  const gruposPaginados = gruposArray.slice(
      (paginaActual - 1) * docentesPorPagina, 
      paginaActual * docentesPorPagina
  );

  const calcularSemaforo = (registros) => {
      if (!registros || registros.length === 0) return 'bg-gray-300';
      const registrosValidos = registros.filter(r => r.estatus === 'A tiempo' || r.estatus === 'Justificado').length;
      const porcentaje = (registrosValidos / registros.length) * 100;
      
      if (porcentaje >= 90) return 'bg-emerald-500'; 
      if (porcentaje >= 70) return 'bg-amber-400';   
      return 'bg-red-500';                           
  };

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
          
          const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
          
          const response = await axios.get(`${baseURL}/api/asistencias/desglose/${docenteId}?fecha=${fechaCorta}`, {
              withCredentials: true 
          });          
          
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
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reporte de Asistencias</h1>
              </div>
              <p className="text-gray-500 text-sm font-medium mt-2 ml-4 mb-2">Supervisión agrupada de entradas y salidas por docente.</p>
              
              <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mt-3">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm border border-white"></span> Óptimo</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm border border-white"></span> Alerta</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm border border-white"></span> Crítico</div>
              </div>
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
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Registros</p>
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre o ID de docente..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm font-bold text-gray-700 transition-all"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="relative md:w-56">
                <select
                    value={filtroEstatus}
                    onChange={(e) => setFiltroEstatus(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                >
                    <option value="">Todos los Estatus</option>
                    <option value="A tiempo">A Tiempo</option>
                    <option value="Retardo">Retardos</option>
                    <option value="Falta">Faltas</option>
                    <option value="Justificado">Justificados</option>
                </select>
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
            </div>

            <div className="relative md:w-48">
                <input
                    type="date"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm font-bold text-gray-700 cursor-pointer"
                />
            </div>

            {(busqueda || filtroEstatus || filtroFecha) && (
                <button 
                    onClick={() => { setBusqueda(''); setFiltroEstatus(''); setFiltroFecha(''); setPaginaActual(1); }}
                    className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors border border-red-100 flex items-center justify-center"
                    title="Limpiar todos los filtros"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
            )}
          </div>

          <div className="space-y-6 pb-4">
            {cargando ? (
                <div className="bg-white p-10 rounded-[2rem] shadow-sm text-center border border-gray-100">
                    <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin mb-2"></div>
                    <p className="text-gray-500 font-bold text-sm">Cargando registros...</p>
                </div>
            ) : gruposPaginados.length > 0 ? (
                gruposPaginados.map((grupo, index) => (
                    <div key={index} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
                        
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${calcularSemaforo(grupo.registrosTotales)} z-10`}></div>

                        <div className="bg-blue-50/40 px-8 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-white text-blue-900 flex items-center justify-center font-black text-lg border border-gray-200 shadow-sm">
                                        {grupo.docente?.nombre?.charAt(0) || 'U'}
                                    </div>
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${calcularSemaforo(grupo.registrosTotales)}`}></span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">{grupo.docente?.nombre} {grupo.docente?.apellidos}</h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Matrícula: {grupo.docente?.numeroEmpleado}</p>
                                </div>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total de Registros</p>
                                <p className="text-lg font-black text-blue-600">{grupo.registrosTotales.length}</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto pl-2">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-white border-b border-gray-50">
                                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-48">Fecha y Hora</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Materia</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tipo</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estatus</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                                    </tr>
                                </thead>
                                
                                {Object.entries(grupo.semanas).map(([semana, registrosSemana], secIdx) => (
                                    <tbody key={secIdx} className="divide-y divide-gray-50">
                                        <tr>
                                            <td colSpan="5" className="px-6 py-2.5 bg-gray-50/80 text-[10px] font-black text-blue-900 uppercase tracking-widest border-y border-gray-100">
                                                 {semana}
                                            </td>
                                        </tr>

                                        {registrosSemana.map((checada, idx) => {
                                            const diaTexto = obtenerDiaLegible(checada.fecha);
                                            const colorDia = (diaTexto === 'HOY' || diaTexto === 'AYER') ? 'text-blue-600' : 'text-gray-400';
                                            
                                            // 🚨 LÓGICA DE DETECCIÓN DE OMISIÓN DE SALIDA 🚨
                                            let omisionSalida = false;
                                            if (checada.tipoRegistro === 'Entrada') {
                                                const fechaCorta = new Date(checada.fecha).toDateString();
                                                // Buscar si existe una salida para esta misma materia en este mismo día
                                                const tieneSalida = grupo.registrosTotales.some(r => 
                                                    r.tipoRegistro === 'Salida' && 
                                                    (r.materia?._id === checada.materia?._id || r.materia?.nombre === checada.materia?.nombre) &&
                                                    new Date(r.fecha).toDateString() === fechaCorta
                                                );
                                                
                                                if (!tieneSalida) {
                                                    // Si pasaron más de 2.5 horas desde la entrada, se considera salida omitida
                                                    const horasPasadas = (new Date() - new Date(checada.fecha)) / (1000 * 60 * 60);
                                                    if (horasPasadas > 2.5) {
                                                        omisionSalida = true;
                                                    }
                                                }
                                            }

                                            return (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100 shrink-0">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase leading-none">{new Date(checada.fecha).toLocaleDateString('es-MX', { month: 'short' })}</span>
                                                            <span className="text-sm font-black text-gray-900 leading-none">{new Date(checada.fecha).getDate()}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{new Date(checada.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                                            <p className={`text-[10px] font-black uppercase tracking-wider ${colorDia}`}>{diaTexto}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-gray-700 truncate max-w-[200px] block" title={checada.materia?.nombre || 'General'}>
                                                        {checada.materia?.nombre || 'Clase General'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    {checada.tipoRegistro === 'Entrada' ? (
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                                                                Entrada
                                                            </span>
                                                            {omisionSalida && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] bg-red-50 text-red-600 font-black uppercase tracking-widest border border-red-200" title="El docente omitió su registro de salida">
                                                                    ⚠️ Sin Salida
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 text-[10px] font-black uppercase tracking-wider border border-orange-100">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm7.707-3.293a1 1 0 010-1.414L13.586 9H7a1 1 0 110-2h6.586l-2.879-2.879a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                                            Salida
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                        checada.estatus === 'A tiempo' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        checada.estatus === 'Retardo' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        checada.estatus === 'Justificado' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                        {checada.estatus}
                                                    </span>
                                                </td>
                                                
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => abrirDetalleDia(checada)}
                                                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl transition-all border border-blue-100"
                                                            title="Ver línea de tiempo"
                                                        >
                                                            Detalle
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
                                        )})}
                                    </tbody>
                                ))}
                            </table>
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-white p-10 rounded-[2rem] shadow-sm text-center border border-gray-100">
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No hay checadas que coincidan con los filtros aplicados</p>
                </div>
            )}
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between pb-10 pt-4 px-2">
                <button 
                    onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                    disabled={paginaActual === 1}
                    className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    Anterior
                </button>
                <div className="text-sm font-bold text-gray-500">
                    Página <span className="text-gray-900 font-black">{paginaActual}</span> de {totalPaginas}
                </div>
                <button 
                    onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas}
                    className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    Siguiente
                </button>
            </div>
          )}

        </div>
      </div>

      {/* MODALES */}
      {modalAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
               <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setModalAbierto(false)}></div>
               <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl">
                   <h3 className="text-xl font-black mb-2 text-gray-900">Justificar Asistencia</h3>
                   <textarea 
                       rows="3" 
                       value={motivoTexto} onChange={(e) => setMotivoTexto(e.target.value)}
                       placeholder="Escribe el motivo de la justificación..."
                       className="w-full border border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-700 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                   ></textarea>
                   <button onClick={confirmarJustificacion} className="bg-purple-600 hover:bg-purple-700 transition-colors text-white font-bold p-3 w-full rounded-xl active:scale-95">Guardar Justificación</button>
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
                        <button onClick={() => setModalDetalleAbierto(false)} className="bg-blue-800 p-2 rounded-full hover:bg-blue-700 transition-colors">
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