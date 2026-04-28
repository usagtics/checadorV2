// src/context/checadasContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { postChecadaRequest, getChecadasRequest, getStatsRequest } from "../api/checadas";

const ChecadasContext = createContext();

export const useChecadas = () => useContext(ChecadasContext);

export const ChecadasProvider = ({ children }) => {
  const [checadas, setChecadas] = useState([]);
  
  // 👇 CAMBIO: Inicializamos 'porPlantel' como array vacío para evitar errores
  const [stats, setStats] = useState({ 
      asistencias: 0, 
      retardos: 0, 
      faltas: 0, 
      porPlantel: [] 
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registrarChecada = async (data) => {
    try {
      const res = await postChecadaRequest(data);
      return res.data;
    } catch (error) {
      console.error("Error al registrar checada:", error.response?.data || error.message);
      throw error;
    }
  };

  const obtenerChecadasEmpleado = async (empleadoId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getChecadasRequest(empleadoId);
      setChecadas(res.data);
    } catch (err) {
      setError("Error al obtener las checadas");
    } finally {
      setLoading(false);
    }
  };

  const obtenerEstadisticas = async (fechas) => {
    try {
      const res = await getStatsRequest(fechas);
      // El backend ahora devuelve { asistencias, retardos, faltas, porPlantel }
      setStats(res.data); 
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  return (
    <ChecadasContext.Provider
      value={{
        checadas,
        stats, 
        loading,
        error,
        registrarChecada,
        obtenerChecadasEmpleado,
        obtenerEstadisticas, 
      }}
    >
      {children}
    </ChecadasContext.Provider>
  );
};