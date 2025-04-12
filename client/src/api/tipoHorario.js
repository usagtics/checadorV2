import axios from "./axios";

export const getTipoHorariosRequest = () => axios.get("/tipo-horario");

export const getTipoHorarioRequest = (id) => axios.get(`/tipo-horario/${id}`);

export const createTipoHorarioRequest = (data) => axios.post("/tipo-horario", data);

export const updateTipoHorarioRequest = (id, data) =>
  axios.put(`/tipo-horario/${id}`, data);

export const deleteTipoHorarioRequest = (id) =>
  axios.delete(`/tipo-horario/${id}`);
