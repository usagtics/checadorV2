import axios from './axios';

export const getChecadasRequest = () => axios.get('/asistencias/reporte');

export const getNominaRequest = (fechaInicio, fechaFin) => axios.get(`/asistencias/nomina-detalle?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);