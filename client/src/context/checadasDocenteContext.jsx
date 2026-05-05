import React, { createContext, useContext, useState } from "react";
import { getChecadasRequest, justificarAsistenciaRequest } from "../api/asistencias";

const ChecadasDocenteContext = createContext();

export const useChecadasDocente = () => {
  const context = useContext(ChecadasDocenteContext);
  if (!context) {
    throw new Error("useChecadasDocente debe usarse dentro de un ChecadasDocenteProvider");
  }
  return context;
};

export function ChecadasDocenteProvider({ children }) {
  const [checadas, setChecadas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState([]);

  const getChecadas = async () => {
    try {
      setCargando(true);
      const res = await getChecadasRequest();
      setChecadas(res.data);
    } catch (error) {
      console.error("Error al obtener las checadas:", error);
      setErrores(error.response?.data?.message || ["Error de conexión"]);
    } finally {
      setCargando(false);
    }
  };

const justificarAsistencia = async (id, motivo) => { // ✅ AHORA RECIBE EL MOTIVO
    try {
        const res = await justificarAsistenciaRequest(id, motivo);
        
        // Actualizamos la lista plana agregando el motivo en vivo
        setChecadas(prevChecadas => 
            prevChecadas.map(checada => 
                checada._id === id ? { ...checada, estatus: 'Justificado', motivoJustificacion: motivo } : checada
            )
        );
        
        return res.data;
    } catch (err) {
        console.error("Error al justificar:", err);
        setError("Error al justificar la asistencia");
        throw err; 
    }
  };

  return (
    <ChecadasDocenteContext.Provider
      value={{
        checadas,
        getChecadas,
        justificarAsistencia, 
        cargando,
        errores
      }}
    >
      {children}
    </ChecadasDocenteContext.Provider>
  );
}