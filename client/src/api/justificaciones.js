import axios from './axios'; 

export const crearJustificacionRequest = (justificacionFormData) => 
    axios.post('/justificaciones', justificacionFormData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

export const getMisJustificacionesRequest = () => axios.get('/justificaciones/mis-solicitudes');

export const getTodasJustificacionesRequest = (estado = '') => {
    const query = estado ? `?estado=${estado}` : '';
    return axios.get(`/justificaciones${query}`);
};

export const updateEstadoJustificacionRequest = (id, data) => 
    axios.put(`/justificaciones/${id}/estado`, data);