import React, { createContext, useContext, useState, useCallback } from "react";
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

  // --- FUNCIÓN PARA OBTENER HORARIOS ---
  const fetchTiposHorario = useCallback(async () => {
    try {
      // ✅ CORRECCIÓN: Usar variable de entorno para evitar errores de red en producción
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${apiUrl}/tipohorarios`);
      const data = await res.json();
      setTiposHorario(data);
    } catch (error) {
      console.error("Error al cargar los tipos de horario:", error);
    }
  }, []);

  // --- FUNCIÓN PARA CREAR EMPLEADO ---
  const createEmployee = async (employee) => {
    try {
      // ✅ CORRECCIÓN: Limpieza preventiva por si envían objetos completos
      const dataToSend = {
        ...employee,
        plantel: typeof employee.plantel === 'object' && employee.plantel !== null ? employee.plantel._id : employee.plantel,
        tipoHorario: typeof employee.tipoHorario === 'object' && employee.tipoHorario !== null ? employee.tipoHorario._id : employee.tipoHorario,
      };

      const res = await createEmployeeRequest(dataToSend);
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

  // --- FUNCIÓN PARA ELIMINAR EMPLEADO ---
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

  // --- FUNCIÓN PARA OBTENER UN EMPLEADO ---
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
      // 1. EL FILTRO MÁGICO: Sacamos los campos que a MongoDB/Zod no le gustan
      const { _id, createdAt, updatedAt, __v, ...cleanEmployee } = employee;

      // 2. Usamos 'cleanEmployee' en lugar de 'employee'
      const dataToSend = {
        ...cleanEmployee,
        plantel: typeof cleanEmployee.plantel === 'object' && cleanEmployee.plantel !== null 
                 ? cleanEmployee.plantel._id 
                 : cleanEmployee.plantel,
        tipoHorario: typeof cleanEmployee.tipoHorario === 'object' && cleanEmployee.tipoHorario !== null 
                     ? cleanEmployee.tipoHorario._id 
                     : cleanEmployee.tipoHorario,
      };

      // Enviamos la data limpia
      const res = await updateEmployeeRequest(id, dataToSend);
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
        fetchTiposHorario
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}