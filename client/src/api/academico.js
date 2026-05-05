import axios from './axios'; 

export const getMateriasRequest = () => axios.get('/materias');
export const createMateriaRequest = (materia) => axios.post('/materias', materia);
export const deleteMateriaRequest = (id) => axios.delete(`/materias/${id}`);
export const getGruposRequest = () => axios.get('/grupos');
export const getOfertasRequest = (programa) => 
    axios.get(programa ? `/oferta-academica?programa=${programa}` : '/oferta-academica');

export const createOfertaAcademicaRequest = (asignacion) => 
    axios.post('/oferta-academica', asignacion);

export const updateOfertaAcademicaRequest = (id, oferta) => axios.put(`/oferta-academica/${id}`, oferta);

export const deleteOfertaAcademicaRequest = (id) => axios.delete(`/oferta-academica/${id}`);