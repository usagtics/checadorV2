import React, { createContext, useContext, useState, useCallback } from "react";
// Asegúrate de que las rutas de importación sean correctas según tu proyecto
import { createEmployeeRequest, getEmployeesRequest, deleteEmployeeRequest, getEmployeeRequest, updateEmployeeRequest } from "../api/empleados";
import Swal from "sweetalert2";

const EmployeeContext = createContext();

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployees must be used within an EmployeeProvider");
  }
  return context;
};

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [tiposHorario, setTiposHorario] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // --- FUNCIÓN PARA OBTENER EMPLEADOS ---
  const getEmployees = useCallback(async () => {
    try {
      const res = await getEmployeesRequest();
      setEmployees(res.data);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    }
  }, []);

  // --- FUNCIÓN PARA OBTENER HORARIOS (OPCIONAL EN CONTEXTO) ---
  const fetchTiposHorario = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:4000/api/tipohorarios");
      const data = await res.json();
      setTiposHorario(data);
    } catch (error) {
      console.error("Error al cargar los tipos de horario:", error);
    }
  }, []);

  // ❌ ELIMINADO: useEffect(() => { getEmployees(); ... }, [])
  // Ya no cargamos datos aquí automáticamente. 
  // Dejamos que EmployeePage.js decida cuándo cargar.

  const createEmployee = async (employee) => {
    try {
      const res = await createEmployeeRequest(employee);
      setEmployees((prevEmployees) => [...prevEmployees, res.data]);
      Swal.fire({
        icon: "success",
        title: "Empleado creado",
        text: "El empleado se ha registrado correctamente.",
      });
    } catch (error) {
      console.error("Error al crear empleado:", error);
      Swal.fire({
        icon: "error",
        title: "Error al crear",
        text: error.response?.data?.message || "No se pudo crear el empleado.",
      });
    }
  };

  const deleteEmployee = async (id) => {
    try {
      const confirm = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará al empleado permanentemente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (confirm.isConfirmed) {
        const res = await deleteEmployeeRequest(id);
        if (res.status === 204) {
          setEmployees((prev) => prev.filter((employee) => employee._id !== id));
          Swal.fire({
            icon: "success",
            title: "Empleado eliminado",
            text: "El empleado ha sido eliminado exitosamente.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el empleado.",
      });
    }
  };

  const getEmployee = async (id) => {
    try {
      const res = await getEmployeeRequest(id);
      setCurrentEmployee(res.data);
      return res.data;
    } catch (error) {
      console.error("No se encontró el empleado o hubo un error:", error);
    }
  };

  const updateEmployee = async (id, employee) => {
    try {
      const res = await updateEmployeeRequest(id, employee);
      console.log("Respuesta del update:", res.data);

      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp._id === id ? { ...emp, ...res.data } : emp
        )
      );

      Swal.fire({
        icon: "success",
        title: "Empleado actualizado",
        text: "La información del empleado ha sido actualizada.",
      });
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: error.response?.data?.message || "No se pudo actualizar el empleado.",
      });
    }
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        tiposHorario,
        currentEmployee,
        createEmployee,
        getEmployees,
        deleteEmployee,
        getEmployee,
        updateEmployee,
        fetchTiposHorario // Exportamos esto por si quieres usarlo luego
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}