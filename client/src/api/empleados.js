import axios from "./axios";

export const getEmployeesRequest = () => axios.get("/employees");

export const getEmployeeRequest = (id) => axios.get(`/employees/${id}`);

export const createEmployeeRequest = (employee) => axios.post("/employees", employee);

export const updateEmployeeRequest = (id, employee) =>
  axios.put(`/employees/${id}`, employee);

export const deleteEmployeeRequest = (id) => axios.delete(`/employees/${id}`);
