import axios from './axios';

// Obtener todos los grupos
export const getGruposRequest = (params) => axios.get('/grupos', { params });

// Obtener un solo grupo por ID
export const getGrupoRequest = (id) => axios.get(`/grupos/${id}`);

// Registrar un nuevo grupo
export const createGrupoRequest = (grupo) => axios.post('/grupos', grupo);

// 👇 ESTA ES LA QUE TE FALTA 👇
export const updateGrupoRequest = (id, grupo) => axios.put(`/grupos/${id}`, grupo);

// Eliminar un grupo
export const deleteGrupoRequest = (id) => axios.delete(`/grupos/${id}`);