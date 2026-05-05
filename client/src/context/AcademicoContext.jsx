import React, { createContext, useContext, useState } from "react";
import {
  getMateriasRequest,
  createMateriaRequest, 
  getGruposRequest,
  getOfertasRequest,
  createOfertaAcademicaRequest,
  updateOfertaAcademicaRequest, // ✅ NUEVO IMPORT
  deleteOfertaAcademicaRequest  // ✅ NUEVO IMPORT
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

  // --- MATERIAS ---
  const getMaterias = async () => {
    try {
      const res = await getMateriasRequest();
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

  // --- GRUPOS ---
  const getGrupos = async () => {
    try {
      const res = await getGruposRequest();
      setGrupos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // --- OFERTAS ACADÉMICAS (ASIGNACIONES) ---
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
      const res = await createOfertaAcademicaRequest(asignacionData);
      return res.data; 
    } catch (error) {
      throw error; 
    }
  };

  // ✅ NUEVO: Función para actualizar
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

  // ✅ NUEVO: Función para eliminar
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
        getOfertas,
        getMaterias,
        createMateria, 
        getGrupos,
        createOfertaAcademica,
        updateOfertaAcademica, 
        deleteOfertaAcademica, 
        errors,
      }}
    >
      {children}
    </AcademicoContext.Provider>
  );
}