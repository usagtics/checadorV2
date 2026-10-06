import React, { createContext, useContext, useState } from "react";
import {
  getMateriasRequest,
  createMateriaRequest, 
  getMateriaRequest,     
  updateMateriaRequest,  
  deleteMateriaRequest,  
  getGruposRequest,
  getOfertasRequest,
  createOfertaAcademicaRequest,
  updateOfertaAcademicaRequest, 
  deleteOfertaAcademicaRequest  
} from "../api/academico";

export const AcademicoContext = createContext();

export const useAcademico = () => {
  const context = useContext(AcademicoContext);
  if (!context) {
    throw new Error("useAcademico debe ser usado dentro de un AcademicoProvider");
  }
  return context;
};

export function AcademicoProvider({ children }) {
  const [materias, setMaterias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [errors, setErrors] = useState([]);

  const getMaterias = async (periodo = "") => {
    try {
      const res = await getMateriasRequest(periodo);
      setMaterias(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createMateria = async (materia) => {
    try {
      const res = await createMateriaRequest(materia);
      setMaterias([...materias, res.data]);
      return res.data;
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data?.message || ["Error al crear materia"]);
    }
  };

  const getMateria = async (id) => {
    try {
      const res = await getMateriaRequest(id);
      return res.data;
    } catch (error) {
      console.error(error);
    }
  };

  const updateMateria = async (id, materia) => {
    try {
      await updateMateriaRequest(id, materia);
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data?.message || ["Error al actualizar la materia"]);
    }
  };

  const deleteMateria = async (id) => {
    try {
      const res = await deleteMateriaRequest(id);
      if (res.status === 200 || res.status === 204) {
        setMaterias(materias.filter((m) => m._id !== id));
      }
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data?.message || ["Error al eliminar la materia"]);
    }
  };

  const getGrupos = async () => {
    try {
      const res = await getGruposRequest();
      setGrupos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getOfertas = async (programa) => {
    try {
      const res = await getOfertasRequest(programa);
      setOfertas(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createOfertaAcademica = async (asignacionData) => {
    try {
      const dataLimpia = { ...asignacionData };
      if (!dataLimpia.periodo || dataLimpia.periodo === "") {
        delete dataLimpia.periodo;
      }
      const res = await createOfertaAcademicaRequest(dataLimpia);
      return res.data; 
    } catch (error) {
      setErrors(error.response?.data?.message || ["Error al crear asignación"]);
      throw error; 
    }
  };

  const updateOfertaAcademica = async (id, asignacionData) => {
    try {
      const res = await updateOfertaAcademicaRequest(id, asignacionData);
      return res.data;
    } catch (error) {
      console.error("Error al actualizar oferta:", error);
      setErrors(error.response?.data?.message || ["Error al actualizar la asignación"]);
      throw error;
    }
  };

  const deleteOfertaAcademica = async (id) => {
    try {
      const res = await deleteOfertaAcademicaRequest(id);
      return res.data;
    } catch (error) {
      console.error("Error al eliminar oferta:", error);
      setErrors(error.response?.data?.message || ["Error al eliminar la asignación"]);
      throw error;
    }
  };

  return (
    <AcademicoContext.Provider
      value={{
        materias,
        grupos,
        ofertas,
        errors,
        getOfertas,
        getMaterias,
        createMateria, 
        getMateria,        
        updateMateria,    
        deleteMateria,  
        getGrupos,
        createOfertaAcademica,
        updateOfertaAcademica, 
        deleteOfertaAcademica, 
      }}
    >
      {children}
    </AcademicoContext.Provider>
  );
}