import axios from './axios';

export const getGruposRequest = (params) => axios.get('/grupos', { params });

export const getGrupoRequest = (id) => axios.get(`/grupos/${id}`);

export const createGrupoRequest = (grupo) => axios.post('/grupos', grupo);

export const updateGrupoRequest = (id, grupo) => axios.put(`/grupos/${id}`, grupo);

export const deleteGrupoRequest = (id) => axios.delete(`/grupos/${id}`);