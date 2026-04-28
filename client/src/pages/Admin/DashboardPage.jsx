import React, { useEffect, useState, useMemo } from "react";
import { useChecadas } from "../../context/checadasContext";
import { usePlanteles } from "../../context/plantelesContext";
import { useEmployees } from '../../context/EmpleadoContext';
import MenuAdmin from "../../menu/menuAdmin";

// ChartJS Imports
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, 
  LinearScale, BarElement, Title 
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2'; 
// Iconos
import { HiFilter, HiDownload } from "react-icons/hi";
import { FaBuilding, FaSpinner } from "react-icons/fa"; 

// Registro de componentes de ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// --- 1. COMPONENTE TARJETA KPI ---
const DashboardCard = ({ title, count, icon, colorIcon, borderColor }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColor} flex justify-between items-center transition-transform hover:scale-105 duration-200`}>
    <div>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h2 className="text-3xl font-extrabold text-gray-800">{count}</h2>
    </div>
    <div className={`p-3 rounded-full ${colorIcon} bg-opacity-10`}>
       {/* Se asume que tienes FontAwesome cargado globalmente */}
       <i className={`fas ${icon} text-2xl ${colorIcon.replace('bg-', 'text-')}`}></i>
    </div>
  </div>
);

// --- 2. COMPONENTE WIDGET "TOP INFRACTORES" (Texto Corregido) ---
const TopOffendersWidget = ({ data = [] }) => (
  <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
    {/* CAMBIO 1: El título ahora dice Faltas/Retardos */}
    <h3 className="text-gray-700 font-bold mb-4 text-sm uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
      <i className="fas fa-exclamation-triangle text-orange-500"></i> Mayor Incidencia (Faltas/Retardos)
    </h3>
    
    <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
      {data && data.length > 0 ? (
        data.map((item, index) => (
          <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 hover:bg-gray-50 p-1 rounded transition-colors">
            <div className="flex items-center gap-3">
              {/* Ranking Number */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm
                  ${index === 0 ? 'bg-yellow-500 ring-2 ring-yellow-200' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-400' : 'bg-blue-100 text-blue-600'}`}>
                 {index + 1}
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700">
                  {/* Nombre y Apellidos */}
                  {item.nombre} {item.apellidos} 
                </span>
                <span className="text-xs text-gray-400">{item.departamento || 'General'}</span>
              </div>
            </div>

            {/* CAMBIO 2: La etiqueta ahora dice "Incidencias" en lugar de Retardos */}
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
              {item.total} Incidencias
            </span>
          </div>
        ))
      ) : (
        /* Estado Vacío */
        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm italic py-8">
          <i className="fas fa-check-circle text-4xl mb-3 text-green-100"></i>
          <p>¡Excelente! Sin incidencias registradas.</p>
        </div>
      )}
    </div>
  </div>
);

// --- 3. PÁGINA PRINCIPAL DASHBOARD ---
function DashboardPage() {
  // Hooks de contexto
  const { employees, getEmployees } = useEmployees();
  const { planteles, getPlanteles } = usePlanteles();
  const { stats, obtenerEstadisticas } = useChecadas();
  
  const [loading, setLoading] = useState(false);

  // Función para obtener fecha local (evita problemas de UTC)
  const getLocalDate = () => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000))
      .toISOString()
      .split("T")[0];
  };

  const hoy = getLocalDate();
  const [fechaInicio, setFechaInicio] = useState(hoy);
  const [fechaFin, setFechaFin] = useState(hoy);

  // Carga inicial de datos
  useEffect(() => {
    const cargarDatos = async () => {
        setLoading(true);
        try {
            await Promise.all([
                getEmployees(),
                getPlanteles(),
                obtenerEstadisticas({ fechaInicio: hoy, fechaFin: hoy })
            ]);
        } catch (error) {
            console.error("Error cargando dashboard:", error);
        } finally {
            setLoading(false);
        }
    };
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Manejador del botón Filtrar
  const handleFiltrar = async () => {
    setLoading(true);
    await obtenerEstadisticas({ fechaInicio, fechaFin });
    setLoading(false);
  };

  // --- MEMOIZACIÓN DE GRÁFICAS (Para mejor rendimiento) ---
  
  // Gráfica de Dona
  const dataDoughnut = useMemo(() => ({
    labels: ['Asistencias', 'Retardos', 'Faltas'],
    datasets: [{
        label: '# Registros',
        // Usamos fallback "|| 0" para evitar errores si stats viene vacío
        data: [stats.asistencias || 0, stats.retardos || 0, stats.faltas || 0], 
        backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
        hoverOffset: 4,
        borderWidth: 0
      }]
  }), [stats]);

  // Gráfica de Barras
  const dataBar = useMemo(() => {
      const labels = stats.porMes ? stats.porMes.map(d => d.mes) : [];
      const data = stats.porMes ? stats.porMes.map(d => d.total) : [];
      return {
        labels,
        datasets: [{
            label: 'Total Checadas',
            data: data,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 4, 
            hoverBackgroundColor: 'rgba(37, 99, 235, 1)'
        }]
      };
  }, [stats]);

  const optionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Comportamiento Anual' },
    },
    scales: {
        y: { beginAtZero: true, grid: { borderDash: [2, 4] } }, 
        x: { grid: { display: false } }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      <MenuAdmin />
      
      {/* Contenedor principal responsive */}
      <div className="flex-1 p-4 md:p-8 md:ml-64 transition-all w-full"> 
        
        {/* ENCABEZADO Y FILTROS */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Panel de Control</h1>
                <p className="text-gray-500 text-sm mt-1">Resumen general de asistencia y puntualidad.</p>
            </div>

            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex flex-wrap items-center gap-2 w-full xl:w-auto">
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2" />
                <span className="text-gray-400">-</span>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 px-3 py-2" />
                
                <button onClick={handleFiltrar} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70 ml-auto xl:ml-0">
                    {loading ? <FaSpinner className="animate-spin"/> : <HiFilter />} 
                    <span className="hidden sm:inline">Filtrar</span>
                </button>
                
                <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors text-xl" title="Descargar PDF">
                    <HiDownload />
                </button>
            </div>
        </div>

        {/* LOADING OVERLAY (Solo se muestra cuando loading es true) */}
        {loading && (
            <div className="fixed top-5 right-5 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm animate-pulse">
                <FaSpinner className="animate-spin"/> Actualizando...
            </div>
        )}

        {/* --- GRID DE TARJETAS KPI --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard title="ASISTENCIAS" count={stats.asistencias || 0} icon="fa-calendar-check" colorIcon="bg-green-500" borderColor="border-green-500" />
            <DashboardCard title="RETARDOS" count={stats.retardos || 0} icon="fa-clock" colorIcon="bg-yellow-500" borderColor="border-yellow-500" />
            <DashboardCard title="FALTAS" count={stats.faltas || 0} icon="fa-times-circle" colorIcon="bg-red-500" borderColor="border-red-500" />
            <DashboardCard title="TOTAL EMPLEADOS" count={employees.length || 0} icon="fa-users" colorIcon="bg-purple-500" borderColor="border-purple-500" />
        </div>

        {/* --- LAYOUT PRINCIPAL (2 Columnas) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMNA IZQUIERDA (Gráfica Barras + Tabla) */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Gráfica de Barras */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="h-72 w-full">
                        <Bar options={optionsBar} data={dataBar} />
                    </div>
                </div>

                {/* Tabla de Planteles */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800">Desglose por Plantel</h2>
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                            {stats.porPlantel?.length || 0} Planteles
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Plantel</th>
                                    <th className="px-6 py-3 text-center text-green-600">Asistencias</th>
                                    <th className="px-6 py-3 text-center text-yellow-600">Retardos</th>
                                    <th className="px-6 py-3 text-center text-red-600">Faltas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.porPlantel && stats.porPlantel.map((item, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                            <FaBuilding className="text-blue-400" />
                                            {item.nombre}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-800">{item.asistencias}</td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-800">{item.retardos}</td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-800">{item.faltas}</td>
                                    </tr>
                                ))}
                                {(!stats.porPlantel || stats.porPlantel.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                                            No se encontraron datos para los filtros seleccionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA (Dona + Widget Infractores) */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Gráfica Dona */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
                    <h3 className="text-gray-800 font-bold mb-6 text-base w-full text-left">Distribución Global</h3>
                    <div className="w-full max-w-[220px] relative">
                        <Doughnut data={dataDoughnut} options={{ cutout: '75%' }} />
                        
                        {/* Texto Flotante en el centro de la Dona */}
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <span className="text-3xl font-black text-gray-800">
                                {(stats.asistencias || 0) + (stats.retardos || 0) + (stats.faltas || 0)}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total</span>
                        </div>
                    </div>
                    {(stats.asistencias || 0) + (stats.retardos || 0) + (stats.faltas || 0) === 0 && (
                       <p className="text-xs text-gray-400 mt-4">Sin datos registrados.</p>
                    )}
                </div>

                {/* AQUÍ ESTÁ EL WIDGET CONECTADO */}
                <TopOffendersWidget data={stats.topRetardos || []} />

            </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardPage;