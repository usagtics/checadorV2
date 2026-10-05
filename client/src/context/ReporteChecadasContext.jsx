import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getReporteChecadasRequest } from '../api/checadaReporte';
import dayjs from 'dayjs';

const ReporteChecadasContext = createContext();

export const ReporteChecadasProvider = ({ children }) => {
  const [checadas, setChecadas] = useState([]);
  const [empleadoId, setEmpleadoId] = useState('');
  const [fechaInicio, setFechaInicio] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [fechaFin, setFechaFin] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  

  const obtenerChecadas = async () => {
    setLoading(true);
    setError(null); 
    try {
      const response = await getReporteChecadasRequest({
        empleadoId,
        fechaInicio,
        fechaFin,
      });
      setChecadas(response.data.checadas || []);
    } catch (error) {
      console.error('Error al obtener checadas:', error);
      setError('Hubo un problema al cargar los datos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (empleadoId && fechaInicio && fechaFin) {
      obtenerChecadas();
    }
  }, [empleadoId, fechaInicio, fechaFin]);

  const checadasAgrupadas = useMemo(() => {
    return checadas.reduce((acc, checada) => {
      const id = checada.empleado?._id || 'desconocido';
      if (!acc[id]) {
        acc[id] = {
          empleado: checada.empleado,
          checadas: [],
        };
      }
      acc[id].checadas.push(checada);
      return acc;
    }, {});
  }, [checadas]);

  return (
    <ReporteChecadasContext.Provider
      value={{
        checadas, 
        checadasAgrupadas,
        setChecadas,
        empleadoId,
        setEmpleadoId,
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,
        loading,
        error, 
        obtenerChecadas,
      }}
    >
      {children}
    </ReporteChecadasContext.Provider>
  );
};

export const useReporteChecadas = () => useContext(ReporteChecadasContext);
