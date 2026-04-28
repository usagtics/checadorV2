import React, { useEffect, useState } from "react";
import { useEmployees } from "../../context/EmpleadoContext";
import EmployeeCard from "../../components/EmpleadoCard";
import MenuAdmin from "../../menu/menuAdmin";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Link } from "react-router-dom";

function EmployeePage() {
  const { getEmployees, employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlantel, setSelectedPlantel] = useState("");

  useEffect(() => {
    getEmployees();
  }, []);

  const safeEmployees = employees || [];

  // --- LÓGICA DE ESTADÍSTICAS ---
  const statsPorPlantel = safeEmployees.reduce((acc, emp) => {
    const nombrePlantel = emp.plantel?.nombre || "Sin Asignar";
    acc[nombrePlantel] = (acc[nombrePlantel] || 0) + 1;
    return acc;
  }, {});

  const statsArray = Object.entries(statsPorPlantel);
  // -----------------------------

  const plantelesUnicos = [
    ...new Set(safeEmployees.map((emp) => emp.plantel?.nombre).filter(Boolean)),
  ];

  const employeesFilteredByPlantel = safeEmployees.filter((emp) => {
    if (!selectedPlantel) return true;
    return emp.plantel?.nombre === selectedPlantel;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <MenuAdmin />
      
      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 transition-all duration-300">
        
        {/* Header Superior */}
        <div className="pt-24 px-8 pb-4">
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Colaboradores</h1>
            <p className="text-gray-500 mt-1">Administra la nómina y asistencia de la universidad.</p>
        </div>

        <div className="flex-1 px-8 pb-8 overflow-y-auto">
          
          {/* --- SECCIÓN DE ESTADÍSTICAS (INTERACTIVA) --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Tarjeta de Total General (Click para ver todos) */}
            <div 
              onClick={() => setSelectedPlantel("")} // <--- LIMPIA EL FILTRO
              className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-300 cursor-pointer ${selectedPlantel === "" ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
            >
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total General</p>
                <h3 className="text-3xl font-extrabold text-gray-800 mt-1">{safeEmployees.length}</h3>
                <span className="text-xs text-green-500 font-medium">Ver todos</span>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl text-blue-600">
                <PeopleIcon fontSize="large" />
              </div>
            </div>

            {/* Tarjetas Dinámicas por Plantel (Click para filtrar) */}
            {statsArray.map(([nombre, cantidad], index) => (
              <div 
                key={index} 
                onClick={() => setSelectedPlantel(nombre)} // <--- FILTRA POR ESTE PLANTEL
                className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-300 cursor-pointer ${selectedPlantel === nombre ? "ring-2 ring-emerald-500 bg-emerald-50" : ""}`}
              >
                <div className="overflow-hidden">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider truncate" title={nombre}>
                    {nombre}
                  </p>
                  <h3 className="text-3xl font-extrabold text-gray-800 mt-1">{cantidad}</h3>
                  <span className="text-xs text-gray-400 font-medium">Click para filtrar</span>
                </div>
                <div className="p-4 bg-emerald-100 rounded-xl text-emerald-600">
                  <BusinessIcon fontSize="large" />
                </div>
              </div>
            ))}
          </div>

          {/* --- BARRA DE HERRAMIENTAS --- */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Izquierda: Buscador y Filtros */}
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              
              {/* Buscador */}
              <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <SearchIcon fontSize="small" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Filtro de Plantel (Se sincroniza automáticamente con las cards) */}
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FilterAltIcon fontSize="small" />
                </div>
                <select
                  value={selectedPlantel}
                  onChange={(e) => setSelectedPlantel(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="">Todos los planteles</option>
                  {plantelesUnicos.map((plantel, index) => (
                    <option key={index} value={plantel}>
                      {plantel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Derecha: Botón de Acción */}
            <div className="w-full md:w-auto">
              <Link
                to="/add-employee"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm"
              >
                <AddIcon fontSize="small" />
                <span>Nuevo Empleado</span>
              </Link>
            </div>
          </div>

          {/* --- TABLA DE DATOS --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <EmployeeCard employees={employeesFilteredByPlantel} searchTerm={searchTerm} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default EmployeePage;