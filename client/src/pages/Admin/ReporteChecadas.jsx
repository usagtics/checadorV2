import React, { useState, useEffect, useMemo, useRef } from "react";
import { getReporteChecadasRequest } from "../../api/checadaReporte";
import { getPlantelesRequest } from "../../api/planteles"; 
import * as XLSX from "xlsx";
import MenuAdmin from "../../menu/menuAdmin";

import { 
  HiSearch, 
  HiDownload, 
  HiUser, 
  HiCheckCircle, 
  HiExclamationCircle, 
  HiXCircle,
  HiChevronDown,
  HiLogin,  
  HiLogout, 
  HiClock,   
  HiCalendar 
} from "react-icons/hi";

const ReporteChecadas = () => {
  const [checadas, setChecadas] = useState([]);
  const [planteles, setPlanteles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Buscador
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState("");
  const searchContainerRef = useRef(null);

  // Filtros
  const [filtroPlantel, setFiltroPlantel] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [mostrarSoloFaltas, setMostrarSoloFaltas] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Ajusta esto a tu URL real
  const SERVER_URL = "http://localhost:4000"; 

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Carga inicial
  useEffect(() => {
    const cargarDatos = async () => {
        setLoading(true);
        setError(null);
        try {
            const resChecadas = await getReporteChecadasRequest();
            setChecadas(Array.isArray(resChecadas.data.checadas) ? resChecadas.data.checadas : []);

            const resPlanteles = await getPlantelesRequest();
            setPlanteles(Array.isArray(resPlanteles.data) ? resPlanteles.data : []);

        } catch (error) {
            console.error("Error al cargar datos:", error);
            setError("Hubo un error al cargar la información.");
        } finally {
            setLoading(false);
        }
    };
    cargarDatos();
  }, []);

  const checadasFiltradasGlobalmente = useMemo(() => {
    return checadas.filter(checada => {
        if (!checada.hora) return false; 
        const fechaObj = new Date(checada.hora);
        if (isNaN(fechaObj.getTime())) return false;

        if (filtroPlantel && checada.plantel?._id !== filtroPlantel) return false;

        if (filtroFechaInicio || filtroFechaFin) {
            try {
                const fechaChecadaStr = fechaObj.toISOString().split('T')[0];
                if (filtroFechaInicio && fechaChecadaStr < filtroFechaInicio) return false;
                if (filtroFechaFin && fechaChecadaStr > filtroFechaFin) return false;
            } catch (err) { return false; }
        }

        if (mostrarSoloFaltas && checada.status !== 'Falta') return false;

        return true;
    });
  }, [checadas, filtroPlantel, filtroFechaInicio, filtroFechaFin, mostrarSoloFaltas]);

  const checadasPorEmpleado = useMemo(() => {
    return checadasFiltradasGlobalmente.reduce((acc, checada) => {
      const id = checada.empleado?._id || "desconocido";
      if (!acc[id]) {
        acc[id] = { empleado: checada.empleado, checadas: [] };
      }
      acc[id].checadas.push(checada);
      return acc;
    }, {});
  }, [checadasFiltradasGlobalmente]);

  const empleados = useMemo(() => {
    return Object.entries(checadasPorEmpleado).map(([id, { empleado }]) => ({
      id,
      name: empleado?.name || "Empleado desconocido",
    }));
  }, [checadasPorEmpleado]);

  const empleadosFiltradosBuscador = useMemo(() => {
    if (!searchTerm) return empleados;
    return empleados.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, empleados]);

  const empleadoSeleccionado = selectedEmpleadoId
    ? checadasPorEmpleado[selectedEmpleadoId]
    : null;

  const registrosPorDia = useMemo(() => {
    if (!empleadoSeleccionado) return [];

    const grupos = {};
    
    const registrosOrdenados = [...empleadoSeleccionado.checadas].sort((a, b) => new Date(a.hora) - new Date(b.hora));

    registrosOrdenados.forEach(checada => {
        const fechaStr = new Date(checada.hora).toLocaleDateString("es-MX"); 
        
        if (!grupos[fechaStr]) {
            grupos[fechaStr] = {
                fecha: checada.hora,
                plantel: checada.plantel,
                entrada: null,
                salida: null,
                esFalta: false
            };
        }

        if (checada.status === 'Falta') {
            grupos[fechaStr].esFalta = true;
            grupos[fechaStr].entrada = checada; 
        } else if (checada.tipo === 'entrada') {
            if (!grupos[fechaStr].entrada) grupos[fechaStr].entrada = checada;
        } else if (checada.tipo === 'salida') {
            grupos[fechaStr].salida = checada;
        }
    });

    return Object.values(grupos).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  }, [empleadoSeleccionado]);


  const statsEmpleado = useMemo(() => {
    if (!registrosPorDia) return { asistencias: 0, retardos: 0, faltas: 0, sinSalida: 0 };
    
    let asistencias = 0;
    let retardos = 0;
    let faltas = 0;
    let sinSalida = 0;

    registrosPorDia.forEach(dia => {
        if (dia.esFalta) {
            faltas++;
        } else if (dia.entrada) {
            // Contar puntualidad basada en la entrada
            if (dia.entrada.status === 'Retardo' || dia.entrada.tarde) {
                retardos++;
            } else {
                asistencias++;
            }

            // Verificar si falta la salida
            // Si hay entrada, no es falta administrativa, y no hay registro de salida:
            if (!dia.salida) {
                sinSalida++;
            }
        }
    });

    return { asistencias, retardos, faltas, sinSalida };
  }, [registrosPorDia]);

  // Paginación
  const checadasPaginadas = useMemo(() => {
    if (!registrosPorDia) return [];
    const startIndex = (currentPage - 1) * pageSize;
    return registrosPorDia.slice(startIndex, startIndex + pageSize);
  }, [registrosPorDia, currentPage]);

  const totalPages = registrosPorDia
    ? Math.ceil(registrosPorDia.length / pageSize)
    : 1;

  // Manejo de Selección
  const handleSelectEmpleado = (empleado) => {
    setSelectedEmpleadoId(empleado.id);
    setSearchTerm(empleado.name); 
    setIsDropdownOpen(false); 
    setCurrentPage(1);
  };

  // --- 4. EXPORTAR A EXCEL (Formato Diario) ---
  const exportarAExcel = () => {
    const datosParaExportar = registrosPorDia.map((dia) => {
      return {
        Fecha: new Date(dia.fecha).toLocaleDateString("es-MX"),
        Nombre: empleadoSeleccionado?.empleado?.name || "",
        Plantel: dia.plantel?.nombre || "N/A",
        Hora_Entrada: dia.entrada ? new Date(dia.entrada.hora).toLocaleTimeString("es-MX", {hour:'2-digit', minute:'2-digit', hour12:true}) : "--",
        Hora_Salida: dia.salida ? new Date(dia.salida.hora).toLocaleTimeString("es-MX", {hour:'2-digit', minute:'2-digit', hour12:true}) : "SIN REGISTRO",
        Estatus: dia.esFalta ? "FALTA" : (dia.entrada?.status || "Asistencia"),
      };
    });
    const ws = XLSX.utils.json_to_sheet(datosParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");
    const nombreArchivo = `reporte_${empleadoSeleccionado?.empleado?.name?.substring(0,10) || 'emp'}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  };

  const exportarTodoAExcel = () => {
    const wb = XLSX.utils.book_new();
    Object.values(checadasPorEmpleado).forEach(({ empleado, checadas }) => {
      const datos = checadas.map((checada) => ({
        Nombre: empleado?.name,
        Plantel: checada.plantel?.nombre,
        Tipo: checada.tipo,
        Fecha: new Date(checada.hora).toLocaleString("es-MX"),
        Estatus: checada.status
      }));
      const ws = XLSX.utils.json_to_sheet(datos);
      XLSX.utils.book_append_sheet(wb, ws, (empleado?.name || "Emp").substring(0, 30));
    });
    XLSX.writeFile(wb, `reporte_completo_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Badge de Estatus visual
  const getStatusBadge = (status) => {
    if (status === "FALTA" || status === "Falta") return <span className="bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm">FALTA</span>;
    if (status === "Retardo") return <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm">RETARDO</span>;
    return <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm">ASISTENCIA</span>;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <MenuAdmin />
      
      <div className="flex-1 ml-64 p-8 pt-24 overflow-y-auto h-screen">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reportes de Asistencia</h1>
            <p className="text-gray-500 text-sm mt-1">Historial detallado organizado por días.</p>
          </div>
          <button
            onClick={exportarTodoAExcel}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all font-medium text-sm"
          >
            <HiDownload className="text-xl" />
            Descargar Todo
          </button>
        </div>

        {/* --- BARRA DE FILTROS --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar por Plantel</label>
                <select
                    value={filtroPlantel}
                    onChange={(e) => { setFiltroPlantel(e.target.value); setSelectedEmpleadoId(""); setSearchTerm(""); }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">Todos los Planteles</option>
                    {planteles.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Desde</label>
                <input type="date" value={filtroFechaInicio} onChange={(e) => setFiltroFechaInicio(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hasta</label>
                <input type="date" value={filtroFechaFin} onChange={(e) => setFiltroFechaFin(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex items-center pb-2">
                <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={mostrarSoloFaltas} onChange={(e) => { setMostrarSoloFaltas(e.target.checked); setSelectedEmpleadoId(""); }} className="form-checkbox h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500" />
                    <span className="ml-2 text-sm text-gray-700 font-medium">Solo Faltas</span>
                </label>
            </div>
            <div>
                <button onClick={() => { setFiltroPlantel(""); setFiltroFechaInicio(""); setFiltroFechaFin(""); setMostrarSoloFaltas(false); setSelectedEmpleadoId(""); setSearchTerm(""); }} className="text-gray-500 hover:text-red-500 text-sm font-medium underline pb-2">Limpiar</button>
            </div>
        </div>

        {/* BUSCADOR */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar Empleado</label>
            <div className="relative" ref={searchContainerRef}>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><HiSearch className="text-gray-400 text-lg" /></div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 sm:text-sm transition-all"
                        placeholder="Escribe el nombre del empleado..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); if(e.target.value === "") setSelectedEmpleadoId(""); }}
                        onFocus={() => setIsDropdownOpen(true)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><HiChevronDown className="text-gray-400" /></div>
                </div>
                {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
                        {empleadosFiltradosBuscador.length === 0 ? (
                            <div className="cursor-default select-none relative py-2 px-4 text-gray-700">No se encontraron resultados.</div>
                        ) : (
                            empleadosFiltradosBuscador.map((emp) => (
                                <div key={emp.id} className="cursor-pointer hover:bg-blue-50 select-none relative py-2 pl-3 pr-9 border-b border-gray-50" onClick={() => handleSelectEmpleado(emp)}>
                                    <span className="ml-2 block truncate font-medium text-gray-700">{emp.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>
        ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700"><p>{error}</p></div>
        ) : empleadoSeleccionado ? (
          <div className="animate-fade-in-up">
            
            {/* TARJETAS DE ESTADÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500 flex items-center justify-between">
                    <div><p className="text-gray-500 text-xs font-bold uppercase">Asistencias</p><p className="text-2xl font-bold text-gray-800">{statsEmpleado.asistencias}</p></div>
                    <HiCheckCircle className="text-green-500 text-3xl opacity-20" />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500 flex items-center justify-between">
                    <div><p className="text-gray-500 text-xs font-bold uppercase">Retardos</p><p className="text-2xl font-bold text-gray-800">{statsEmpleado.retardos}</p></div>
                    <HiExclamationCircle className="text-yellow-500 text-3xl opacity-20" />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500 flex items-center justify-between">
                    <div><p className="text-gray-500 text-xs font-bold uppercase">Faltas</p><p className="text-2xl font-bold text-gray-800">{statsEmpleado.faltas}</p></div>
                    <HiXCircle className="text-red-500 text-3xl opacity-20" />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500 flex items-center justify-between">
                    <div><p className="text-gray-500 text-xs font-bold uppercase">Falta Salida</p><p className="text-2xl font-bold text-gray-800">{statsEmpleado.sinSalida}</p></div>
                    <HiClock className="text-orange-500 text-3xl opacity-20" />
                </div>
            </div>

            {/* --- TABLA CON ESTILO "TARJETAS SEPARADAS" --- */}
            {/* Usamos border-separate y spacing para crear el efecto de división */}
            <div className="overflow-x-auto p-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 text-lg">Historial Diario</h3>
                    <button onClick={exportarAExcel} className="text-sm text-green-600 hover:text-green-800 font-bold hover:underline">Descargar Excel Individual</button>
                </div>

                <table className="w-full text-left text-sm text-gray-600 border-separate border-spacing-y-4">
                    <thead className="text-xs uppercase text-gray-400 font-bold tracking-wider">
                        <tr>
                            <th className="px-6 pb-2">Fecha</th>
                            <th className="px-6 pb-2">Plantel</th>
                            <th className="px-6 pb-2 text-center">Entrada</th>
                            <th className="px-6 pb-2 text-center">Salida</th>
                            <th className="px-6 pb-2 text-center">Estatus</th>
                            <th className="px-6 pb-2 text-center">Evidencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {checadasPaginadas.map((dia, index) => (
                            <tr 
                                key={index} 
                                className="bg-white shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 rounded-xl group"
                            >
                                {/* FECHA (Diseño Calendario) */}
                                <td className="px-6 py-4 rounded-l-xl border-l-4 border-blue-500">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 text-blue-600 rounded-lg p-2 text-center min-w-[50px]">
                                            <span className="block text-[10px] font-black uppercase tracking-wider">
                                                {new Date(dia.fecha).toLocaleDateString("es-MX", { month: 'short' }).replace('.', '')}
                                            </span>
                                            <span className="block text-xl font-black leading-none">
                                                {new Date(dia.fecha).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm capitalize">
                                                {new Date(dia.fecha).toLocaleDateString("es-MX", { weekday: 'long' })}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(dia.fecha).getFullYear()}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                
                                {/* PLANTEL */}
                                <td className="px-6 py-4 font-medium text-gray-700">
                                    {dia.plantel?.nombre || "N/A"}
                                </td>

                                {/* HORA ENTRADA */}
                                <td className="px-6 py-4 text-center">
                                    {dia.entrada ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-sm">
                                            <HiLogin className="text-lg" />
                                            {new Date(dia.entrada.hora).toLocaleTimeString("es-MX", { hour: '2-digit', minute:'2-digit', hour12: true })}
                                        </div>
                                    ) : (
                                         <span className="text-gray-300 font-mono text-xs">-- : --</span>
                                    )}
                                </td>

                                {/* HORA SALIDA (Con alerta roja si falta) */}
                                <td className="px-6 py-4 text-center">
                                    {dia.salida ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-bold border border-green-100 shadow-sm">
                                            <HiLogout className="text-lg" />
                                            {new Date(dia.salida.hora).toLocaleTimeString("es-MX", { hour: '2-digit', minute:'2-digit', hour12: true })}
                                        </div>
                                    ) : dia.esFalta ? (
                                         <span className="text-gray-300 font-mono text-xs">-- : --</span>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-bold border border-red-100 animate-pulse shadow-sm">
                                            <HiClock className="text-lg" />
                                            <span>Sin Salida</span>
                                        </div>
                                    )}
                                </td>

                                {/* ESTATUS */}
                                <td className="px-6 py-4 text-center">
                                     {getStatusBadge(dia.esFalta ? 'Falta' : (dia.entrada?.status || (dia.entrada?.tarde ? "Retardo" : "Asistencia")))}
                                </td>

                                {/* EVIDENCIA (FOTO) */}
                                <td className="px-6 py-4 rounded-r-xl text-center">
                                    {dia.entrada?.fotoUrl ? (
                                        <a href={`${SERVER_URL}${dia.entrada.fotoUrl}`} target="_blank" rel="noreferrer" className="inline-block relative group/img">
                                            <img 
                                                src={`${SERVER_URL}${dia.entrada.fotoUrl}`} 
                                                alt="Evidencia" 
                                                className="w-10 h-10 rounded-full border-2 border-white shadow-md group-hover/img:scale-150 transition-transform duration-200 cursor-pointer object-cover bg-gray-200"
                                                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=U&background=random`; }}
                                            />
                                        </a>
                                    ) : (
                                        <span className="text-gray-300 text-xs italic">Sin foto</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 font-medium">Anterior</button>
                    <span className="px-4 py-2 text-sm text-gray-600 font-medium bg-gray-100 rounded-lg">Página {currentPage} de {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 font-medium">Siguiente</button>
                </div>
            )}

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 bg-white border border-dashed border-gray-300 rounded-xl">
             <div className="bg-blue-50 p-4 rounded-full mb-4"><HiUser className="text-4xl text-blue-400" /></div>
             <h3 className="text-lg font-medium text-gray-900">Selecciona un empleado</h3>
             <p className="text-gray-500 max-w-sm text-center mt-1">Usa el buscador para ver su historial detallado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteChecadas;