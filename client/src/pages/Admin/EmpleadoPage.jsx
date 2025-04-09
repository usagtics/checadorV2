import React, { useEffect } from "react";
import { useEmployees } from "../../context/EmpleadoContext";  // Asegúrate de que la ruta es correcta
import EmployeeCard from "../../components/EmpleadoCard";

function EmployeePage() {
  const { getEmployees, employees } = useEmployees();

  useEffect(() => {
    getEmployees();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 container mx-auto px-10">
      {employees.map((employee) => (
        <EmployeeCard employee={employee} key={employee._id} />
      ))}
    </div>
  );
}

export default EmployeePage;
