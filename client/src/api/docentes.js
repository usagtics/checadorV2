// CAMBIA ESTO:
// import axios from "axios";

// POR ESTO (asegúrate de que la ruta sea correcta hacia tu archivo axios.js):
import axios from "./axios"; 

// Peticiones de Administración (requieren token)
export const getDocentesRequest = () => axios.get('/docentes');

export const getDocenteRequest = (id) => axios.get(`/docentes/${id}`);

export const createDocenteRequest = (docente) => axios.post('/docentes', docente);

export const updateDocenteRequest = (id, docente) => axios.put(`/docentes/${id}`, docente);

export const deleteDocenteRequest = (id) => axios.delete(`/docentes/${id}`);

// Petición del Kiosco / Checador
export const checarQRRequest = (numeroEmpleado) => axios.post('/checar-qr', { numeroEmpleado });
// Agrega esto a tu archivo de llamadas a la API (api/docentes.js)
export const loginDocenteRequest = (user) => axios.post(`/login-docente`, user);
export const verifyDocenteTokenRequest = () => axios.get(`/verify-docente`);