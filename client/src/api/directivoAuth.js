import axios from "./axios";

export const registerDirectivoRequest = (user) => axios.post(`/directivo/register`, user);

export const loginDirectivoRequest = (user) => axios.post(`/directivo/login`, user);

export const verifyDirectivoTokenRequest = () => axios.get(`/directivo/verify`);
export const getDocentesRequest = () => axios.get(`/docentes`);
export const getMateriasRequest = () => axios.get(`/materias`);

export const getDirectivosRequest = () => axios.get('/directivos');
export const deleteDirectivoRequest = (id) => axios.delete(`/directivos/${id}`);

export const updateDirectivoRoleRequest = (id, role) =>
  axios.put(`/directivos/${id}/role`, { role });

export const updateDirectivoRequest = (id, user) =>
  axios.put(`/directivos/${id}`, user);