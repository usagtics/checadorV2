// api/checadas.js
import axios from "axios";

const API_URL = "http://localhost:4000/api"; 

export const postChecadaRequest = (data) => {
  return axios.post(`${API_URL}/checadas`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getChecadasRequest = (empleadoId) => {
  return axios.get(`${API_URL}/checadas/${empleadoId}`);
};

// 👇 AQUÍ ESTABA EL ERROR: Agregamos ${API_URL} al principio
export const getStatsRequest = (params) => {
  return axios.get(`${API_URL}/checadas/stats`, { params });
};