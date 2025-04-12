import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createTipoHorarioRequest,
  getTipoHorariosRequest,
  deleteTipoHorarioRequest,
  getTipoHorarioRequest,
  updateTipoHorarioRequest,
} from "../api/tipoHorario"; 

const TipoHorarioContext = createContext();

export const useTipoHorarios = () => {
  const context = useContext(TipoHorarioContext);
  if (!context) {
    throw new Error("useTipoHorarios must be used within a TipoHorarioProvider");
  }
  return context;
};

export function TipoHorarioProvider({ children }) {
  const [tipoHorarios, setTipoHorarios] = useState([]);


  useEffect(() => {
    getTipoHorarios(); 
  }, []);

  const getTipoHorarios = async () => {
    try {
      const res = await getTipoHorariosRequest();
      setTipoHorarios(res.data);
    } catch (error) {
      console.error("Error al obtener los tipos de horario:", error);
    }
  };

  const createTipoHorario = async (tipoHorario) => {
    try {
      const res = await createTipoHorarioRequest(tipoHorario);
      console.log("Tipo de horario creado:", res.data);
      setTipoHorarios((prevTipoHorarios) => [...prevTipoHorarios, res.data]);
    } catch (error) {
      console.error("Error al crear el tipo de horario:", error);
    }
  };

  const deleteTipoHorario = async (id) => {
    try {
      const res = await deleteTipoHorarioRequest(id);
      if (res.status === 200 || res.status === 204) { 
        setTipoHorarios((prevTipoHorarios) =>
          prevTipoHorarios.filter((tipo) => tipo._id !== id)
        );
      } else {
        console.error("Error al eliminar el tipo de horario: ", res.status);
      }
    } catch (error) {
      console.error("Error al eliminar el tipo de horario:", error);
    }
  };

  const getTipoHorario = async (id) => {
    try {
      const res = await getTipoHorarioRequest(id);
      return res.data;
    } catch (error) {
      console.error("Error al obtener el tipo de horario:", error);
    }
  };

  const updateTipoHorario = async (id, tipoHorario) => {
    try {
      const res = await updateTipoHorarioRequest(id, tipoHorario);
      console.log("Tipo de horario actualizado:", res.data);
      setTipoHorarios((prevTipoHorarios) =>
        prevTipoHorarios.map((tipo) => (tipo._id === id ? res.data : tipo))
      );
    } catch (error) {
      console.error("Error al actualizar el tipo de horario:", error);
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
