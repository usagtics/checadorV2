import axios from "axios";

const API_URL = "http://localhost:4000/api"; 

// Solicitar el post de una checada
export const postChecadaRequest = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/checadas`, data);
    return response.data;
  } catch (error) {
    console.error("Error al registrar checada:", error);
    throw error;
  }
};

export const getChecadasRequest = async (empleadoId) => {
  try {
    const response = await axios.get(`${API_URL}/checadas/${empleadoId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener checadas del empleado:", error);
    throw error;
  }
};

export const getReporteChecadasRequest = async (params = {}) => {
  try {
    return axios.get(`${API_URL}/reporte`, { params }); 
    return response.data;
  } catch (error) {
    console.error("Error al obtener reporte de checadas:", error);
    throw error;
  }
};
