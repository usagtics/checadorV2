import React, { createContext, useContext, useState } from "react";
import {
  createEmployeeRequest,
  getEmployeesRequest,
  deleteEmployeeRequest,
  getEmployeeRequest,
  updateEmployeeRequest
} from "../api/empleados";

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

  const getEmployees = async () => {
    try {
      const res = await getEmployeesRequest();
      setEmployees(res.data);
    } catch (error) {
      console.error(error);
    }
  };


  const createEmployee = async (employee) => {
        const res = await createEmployeeRequest(employee); 
       console.log(res)
  
    }
  const deleteEmployee = async (id) => {
    try {
      const res = await deleteEmployeeRequest(id);
      if (res.status === 204) {
        setEmployees(employees.filter((employee) => employee._id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getEmployee = async (id) => {
    try {
      const res = await getEmployeeRequest(id);
      return res.data;
    } catch (error) {
      console.error("No se encontró el empleado o hubo un error.", error);
    }
  };

  const updateEmployee = async (id, employee) => {
    try {
      await updateEmployeeRequest(id, employee);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        createEmployee,
        getEmployees,
        deleteEmployee,
        getEmployee,
        updateEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}
