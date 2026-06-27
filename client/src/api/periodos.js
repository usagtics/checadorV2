import axios from './axios'; 

export const getPeriodosRequest = () => axios.get('/periodos');

export const createPeriodoRequest = (periodo) => axios.post('/periodos', periodo);

export const marcarPeriodoActivoRequest = (id) => axios.patch(`/periodos/${id}/activo`);