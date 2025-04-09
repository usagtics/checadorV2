import React from "react";
import { useEmployees } from "../context/EmpleadoContext";  // Asegúrate de que la ruta es correcta
import { Link } from "react-router-dom";

function EmployeeCard({ employee }) {
  const { deleteEmployee } = useEmployees();

  return (
    <div className="bg-zinc-600 max-w-md w-full p-6 rounded-md shadow-md">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
        <h2 className="text-xl font-semibold text-white break-words">
          {employee.name}
        </h2>
        <div className="flex gap-2 flex-wrap">
          <Link
            to={`/employees/${employee._id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Edit
          </Link>
          <button
            onClick={() => deleteEmployee(employee._id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Delete
          </button>
        </div>
      </header>
      <p className="text-slate-300 mb-1 break-words">Email: {employee.email}</p>
      <p className="text-slate-300 mb-1 break-words">Role: {employee.role}</p>
    </div>
  );
}

export default EmployeeCard;
