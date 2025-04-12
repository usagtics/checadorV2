import React, { useEffect, useState } from "react";
import { useEmployees } from "../../context/EmpleadoContext";
import { useTipoHorarios } from "../../context/tipoHorarioContext";
import { updateEmployeeRequest } from "../../api/empleados"; 
import MenuAdmin from "../../menu/menuAdmin";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function EmployeePage() {
  const { getEmployees, employees, deleteEmployee } = useEmployees();
  const { getTipoHorarios, tipoHorarios } = useTipoHorarios();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const employeesPerPage = 5;

  useEffect(() => {
    getEmployees();
    getTipoHorarios();
  }, []);

  const filteredEmployees = employees.filter((employee) =>
    [employee.name, employee.email, employee.role]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleHorarioChange = async (employeeId, tipoHorarioId) => {
    if (!tipoHorarioId) {
      alert("Debes seleccionar un tipo de horario");
      return;
    }
  
    try {
      await updateEmployeeRequest(employeeId, { tipoHorario: tipoHorarioId });
      getEmployees();
    } catch (error) {
      console.error("Error al actualizar el tipo de horario:", error.response?.data || error.message);
    }
  };
  
  

  return (
    <div className="flex">
      <MenuAdmin />
      <div className="flex-1 p-6">

        <div className="p-10 flex justify-center">
          <Link
            to="/add-employee"
            className="flex items-center gap-3 py-3 bg-gradient-to-r from-blue-900 to-blue-400 px-8 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <AddIcon fontSize="small" className="opacity-80" />
            <span className="text-sm font-semibold tracking-wide">Agregar Empleado</span>
          </Link>
        </div>


        <div className="mb-6 flex justify-end">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all shadow-sm"
            />
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103 10.5a7.5 7.5 0 0013.15 6.15z"
                />
              </svg>
            </span>
          </div>
        </div>

 
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-gray-800 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-sm uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Correo Electrónico</th>
                <th className="px-6 py-3 text-left">Rol</th>
                <th className="px-6 py-3 text-left">Tipo de Horario</th>
                <th className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentEmployees.map((employee) => (
                <tr
                  key={employee._id}
                  className="hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <td className="px-6 py-4">{employee.name}</td>
                  <td className="px-6 py-4">{employee.email}</td>
                  <td className="px-6 py-4">{employee.role}</td>
                  <td className="px-6 py-4">
                    <select
                      value={employee.tipoHorario?._id || ""}
                      onChange={(e) => handleHorarioChange(employee._id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="">Sin asignar</option>
                      {tipoHorarios.map((horario) => (
                        <option key={horario._id} value={horario._id}>
                          {horario.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/employees/${employee._id}`}
                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm mr-2 transition"
                    >
                      <EditIcon fontSize="small" />
                    </Link>
                    <button
                      onClick={() => deleteEmployee(employee._id)}
                      className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm mt-2">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeePage;
