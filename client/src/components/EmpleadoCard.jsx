import React, { useEffect, useState } from "react";
import { useEmployees } from "../context/EmpleadoContext";
import { Link } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// 1. Recibimos 'employees' desde el padre
function EmployeeCard({ employees, searchTerm }) {
  // 2. ¡NO PEDIMOS getEmployees AQUÍ! Solo delete y update.
  const { deleteEmployee, updateEmployee } = useEmployees();
  
  const [tiposHorario, setTiposHorario] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    // --- CORRECCIÓN 2: BORRAMOS getEmployees() ---
    // Solo cargamos los horarios
    const fetchTiposHorario = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/tipohorarios");
        const data = await res.json();
        setTiposHorario(data);
      } catch (error) {
        console.error("Error al cargar los tipos de horario:", error);
      }
    };
    fetchTiposHorario();
  }, []); 

  const safeEmployees = employees || [];

  const filteredEmployees = safeEmployees.filter((employee) =>
    [employee.name, employee.email, employee.role]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const goToPreviousPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const goToNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  
  // Reiniciar página al cambiar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, employees]);

  const handleTipoHorarioChange = async (employeeId, tipoHorarioId) => {
    const updatedEmployee = { tipoHorario: { _id: tipoHorarioId } };
    await updateEmployee(employeeId, updatedEmployee);
  };

  return (
    <div>
      <table className="min-w-full bg-white text-gray-800 shadow-md rounded-md">
        <thead className="bg-gray-200">
          <tr className="border-b border-gray-300">
            <th className="py-2 px-4 text-left">Nombre</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Rol</th>
            <th className="py-2 px-4 text-left">Departamento</th>
            <th className="py-2 px-4 text-left">Hora Entrada</th>
            <th className="py-2 px-4 text-left">Hora Salida</th>
            <th className="py-2 px-4 text-left">Plantel</th>
            <th className="py-2 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentEmployees.length > 0 ? (
            currentEmployees.map((employee, index) => {
              const tipoHorario = tiposHorario.find(t => t._id === employee.tipoHorario?._id);
              const plantelNombre = employee.plantel?.nombre || "No asignado";

              return (
                <tr key={employee._id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                  <td className="py-2 px-4 border-t border-b border-gray-200">{employee.name}</td>
                  <td className="py-2 px-4 border-t border-b border-gray-200">{employee.email}</td>
                  <td className="py-2 px-4 border-t border-b border-gray-200">{employee.role}</td>
                  <td className="py-2 px-4 border-t border-b border-gray-200">
                    <select
                      value={employee.tipoHorario ? employee.tipoHorario._id : ""}
                      onChange={(e) => handleTipoHorarioChange(employee._id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-800"
                    >
                      <option value="">Seleccionar un departamento</option>
                      {tiposHorario.map((tipo) => (
                        <option key={tipo._id} value={tipo._id}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-4 border-t border-b border-gray-200">
                    {tipoHorario ? tipoHorario.hora_entrada : "No asignada"}
                  </td>
                  <td className="py-2 px-4 border-t border-b border-gray-200">
                    {tipoHorario ? tipoHorario.hora_salida : "No asignada"}
                  </td>
                  <td className="py-2 px-4 border-t border-b border-gray-200">{plantelNombre}</td>
                  <td className="py-2 px-4 border-t border-b border-gray-200 text-center">
                    <div className="flex justify-center space-x-4">
                      <Link to={`/employees/${employee._id}`} className="text-blue-500 hover:text-blue-600">
                        <EditIcon />
                      </Link>
                      <button onClick={() => deleteEmployee(employee._id)} className="text-red-500 hover:text-red-600">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-4 text-gray-500">No se encontraron empleados.</td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Paginación */}
      <div className="flex justify-center items-center space-x-4 mt-4">
        <button onClick={goToPreviousPage} disabled={currentPage === 1} className="px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300">
          <ChevronLeftIcon />
        </button>
        <span className="text-gray-800">{`${currentPage} / ${totalPages || 1}`}</span>
        <button onClick={goToNextPage} disabled={currentPage >= totalPages} className="px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300">
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}

export default EmployeeCard;