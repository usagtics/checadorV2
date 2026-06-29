import axios from './axios'; 

export const getCarrerasRequest = () => axios.get('/carreras');

export const createCarreraRequest = (carrera) => axios.post('/carreras', carrera);