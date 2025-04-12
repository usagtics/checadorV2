import React from "react";
import { useEmployees } from "../context/EmpleadoContext"; 
import { Link } from "react-router-dom";

function EmployeeCard() {
  const { employees, deleteEmployee } = useEmployees();

  return (
    <table className="min-w-full bg-zinc-600 text-white shadow-md rounded-md">
      <thead>
        <tr>
          <th className="p-4 text-left">Nombre</th>
          <th className="p-4 text-left">Correo Electrónico</th>
          <th className="p-4 text-left">Rol</th>
          <th className="p-4 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee._id} className="border-b border-zinc-500">
            <td className="p-4">{employee.name}</td>
            <td className="p-4">{employee.email}</td>
            <td className="p-4">{employee.role}</td>
            <td className="p-4 text-center">
              <Link
                to={`/employees/${employee._id}`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm mr-2"
              >
                Editar
              </Link>
              <button
                onClick={() => deleteEmployee(employee._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default EmployeeCard;
