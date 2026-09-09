import axios from "./axios";

// Solicitar el post de una checada
export const postChecadaRequest = async (data) => {
  try {
    const response = await axios.post(`/checadas`, data);
    return response.data;
  } catch (error) {
    console.error("Error al registrar checada:", error);
    throw error;
  }
};

export const getChecadasRequest = async (empleadoId) => {
  try {
    const response = await axios.get(`/checadas/${empleadoId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener checadas del empleado:", error);
    throw error;
  }
};

export const getReporteChecadasRequest = async (params = {}) => {
  try {
    const response = await axios.get(`/reporte`, { params }); 
    return response; 
  } catch (error) {
    console.error("Error al obtener reporte de checadas:", error);
    throw error;
  }
};