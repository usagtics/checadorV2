import React, { createContext, useContext, useState } from "react";
import {
  getMateriasRequest,
  createMateriaRequest, // <-- IMPORTANTE: Debe estar importada
  getGruposRequest,
  getOfertasRequest,
  createOfertaAcademicaRequest
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

  // 👇 ESTA ES LA FUNCIÓN QUE TE ESTÁ PIDIENDO EL FORMULARIO 👇
  const createMateria = async (materia) => {
    try {
      const res = await createMateriaRequest(materia);
      // Opcional: actualizamos el estado local para que la tabla se refresque sola
      setMaterias([...materias, res.data]);
      return res.data;
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data?.message || ["Error al crear materia"]);
    }
  };

  // --- OTROS ---
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
      const res = await createOfertaAcademicaRequest(asignacionData);
      return res.data; 
    } catch (error) {
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
        createMateria, // <--- REVISA QUE ESTO ESTÉ AQUÍ (Es la salida)
        getGrupos,
        createOfertaAcademica,
        errors,
      }}
    >
      {children}
    </AcademicoContext.Provider>
  );
}