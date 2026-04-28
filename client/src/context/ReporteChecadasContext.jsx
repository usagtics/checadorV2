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
  const [error, setError] = useState(null);  // Manejo de errores

  const obtenerChecadas = async () => {
    setLoading(true);
    setError(null);  // Restablecer el error en cada nueva solicitud
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

  // Agrupación de checadas por empleado
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
        checadas, // lista plana
        checadasAgrupadas, // agrupadas por empleado
        setChecadas,
        empleadoId,
        setEmpleadoId,
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,
        loading,
        error, // Añadimos el error para que pueda ser utilizado en los componentes
        obtenerChecadas,
      }}
    >
      {children}
    </ReporteChecadasContext.Provider>
  );
};

export const useReporteChecadas = () => useContext(ReporteChecadasContext);
