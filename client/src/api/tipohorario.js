
import axios from "./axios";

export const getTipoHorariosRequest = () => axios.get("/tipohorarios");

export const getTipoHorarioRequest = (id) => axios.get(`/tipohorarios/${id}`);

export const createTipoHorarioRequest = (tipoHorario) =>
  axios.post("/tipohorarios", tipoHorario);

export const updateTipoHorarioRequest = (id, tipoHorario) =>
  axios.put(`/tipohorarios/${id}`, tipoHorario);

export const deleteTipoHorarioRequest = (id) =>
  axios.delete(`/tipohorarios/${id}`);
