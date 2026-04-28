import React, { createContext, useContext, useState, useCallback } from "react";
import {
  createTipoHorarioRequest,
  getTipoHorariosRequest,
  deleteTipoHorarioRequest,
  getTipoHorarioRequest,
  updateTipoHorarioRequest
} from "../api/tipohorario";
import Swal from "sweetalert2";

const TipoHorarioContext = createContext();

export const useTipoHorario = () => {
  const context = useContext(TipoHorarioContext);
  if (!context) {
    throw new Error("useTipoHorario must be used within a TipoHorarioProvider");
  }
  return context;
};

const isValidTime = (time) => {
  const regex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
  return regex.test(time);
};

export function TipoHorarioProvider({ children }) {
  const [tipoHorarios, setTipoHorarios] = useState([]);

  const getTipoHorarios = useCallback(async () => {
    try {
      const res = await getTipoHorariosRequest();
      setTipoHorarios(res.data);
    } catch (error) {
      console.error("Error al obtener tipos de horario:", error);
    }
  }, []);

  const createTipoHorario = async (tipoHorario) => {
    if (!isValidTime(tipoHorario.hora_entrada) || !isValidTime(tipoHorario.hora_salida)) {
      return Swal.fire("Error", "Formato de hora de entrada o salida inválido. Usa HH:mm (24h)", "error");
    }

    if (!tipoHorario.nombre || !tipoHorario.hora_entrada || !tipoHorario.hora_salida || !tipoHorario.fechaCreacion) {
      return Swal.fire("Error", "Todos los campos son obligatorios.", "error");
    }

    try {
      const res = await createTipoHorarioRequest(tipoHorario);
      console.log("Tipo de horario creado:", res.data);
      Swal.fire("¡Éxito!", "Tipo de horario creado correctamente.", "success");
    } catch (error) {
      console.error("Error al crear tipo de horario:", error);
      if (error.response && error.response.data) {
        Swal.fire("Error", `Hubo un problema al crear el tipo de horario: ${error.response.data.message}`, "error");
      } else {
        Swal.fire("Error", "Hubo un problema al crear el tipo de horario.", "error");
      }
    }
  };

  const deleteTipoHorario = async (id) => {
    try {
      const res = await deleteTipoHorarioRequest(id);
      if (res.status === 204) {
        setTipoHorarios(tipoHorarios.filter((item) => item._id !== id));
        Swal.fire("Eliminado", "Tipo de horario eliminado correctamente.", "success");
      }
    } catch (error) {
      console.error("Error al eliminar tipo de horario:", error);
      Swal.fire("Error", "No se pudo eliminar el tipo de horario.", "error");
    }
  };

  const getTipoHorario = async (id) => {
    try {
      const res = await getTipoHorarioRequest(id);
      return res.data;
    } catch (error) {
      console.error("Error al obtener tipo de horario:", error);
    }
  };

  const updateTipoHorario = async (id, tipoHorario) => {
    if (!isValidTime(tipoHorario.hora_entrada) || !isValidTime(tipoHorario.hora_salida)) {
      return Swal.fire("Error", "Formato de hora de entrada o salida inválido. Usa HH:mm (24h)", "error");
    }

    try {
      await updateTipoHorarioRequest(id, tipoHorario);
      Swal.fire("¡Actualizado!", "El tipo de horario fue actualizado correctamente.", "success");
    } catch (error) {
      console.error("Error al actualizar tipo de horario:", error);
      Swal.fire("Error", "Hubo un problema al actualizar el tipo de horario.", "error");
    }
  };

  return (
    <TipoHorarioContext.Provider
      value={{
        tipoHorarios,
        createTipoHorario,
        getTipoHorarios,
        deleteTipoHorario,
        getTipoHorario,
        updateTipoHorario,
      }}
    >
      {children}
    </TipoHorarioContext.Provider>
  );
}
