// api/checadas.js
import axios from "./axios";

export const postChecadaRequest = (data) => {
  return axios.post(`/checadas`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getChecadasRequest = (empleadoId) => {
  return axios.get(`/checadas/${empleadoId}`);
};

export const getStatsRequest = (params) => {
  return axios.get(`/checadas/stats`, { params });
};