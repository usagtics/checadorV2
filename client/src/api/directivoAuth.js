import axios from 'axios';

const API = 'http://localhost:4000/api';

const axiosInstance = axios.create({
  baseURL: API,
  withCredentials: true 
});

export const registerDirectivoRequest = (user) => axiosInstance.post(`/directivo/register`, user);

export const loginDirectivoRequest = (user) => axiosInstance.post(`/directivo/login`, user);

export const verifyDirectivoTokenRequest = () => axiosInstance.get(`/directivo/verify`);
export const getDocentesRequest = () => axiosInstance.get(`/docentes`);
export const getMateriasRequest = () => axiosInstance.get(`/materias`);

export const getDirectivosRequest = () => axiosInstance.get('/directivos');
export const deleteDirectivoRequest = (id) => axiosInstance.delete(`/directivos/${id}`);

export const updateDirectivoRoleRequest = (id, role) => 
    axiosInstance.put(`/directivos/${id}/role`, { role });

export const updateDirectivoRequest = (id, user) => 
    axiosInstance.put(`/directivos/${id}`, user);