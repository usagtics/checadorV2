import React, { createContext, useContext, useState } from "react";
import { getChecadasRequest } from "../api/asistencias";
const ChecadasDocenteContext = createContext();

// 2. Hook personalizado
export const useChecadasDocente = () => {
  const context = useContext(ChecadasDocenteContext);
  if (!context) {
    throw new Error("useChecadasDocente debe usarse dentro de un ChecadasDocenteProvider");
  }
  return context;
};

// 3. El Provider
export function ChecadasDocenteProvider({ children }) {
  const [checadas, setChecadas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState([]);

  // Función para pedir el reporte
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

  return (
    <ChecadasDocenteContext.Provider
      value={{
        checadas,
        getChecadas,
        cargando,
        errores
      }}
    >
      {children}
    </ChecadasDocenteContext.Provider>
  );
}