import React, { createContext, useContext, useState } from 'react';
import { 
    getPeriodosRequest, 
    createPeriodoRequest, 
    marcarPeriodoActivoRequest 
} from '../api/periodos';

const PeriodoContext = createContext();

export const usePeriodos = () => {
    const context = useContext(PeriodoContext);
    if (!context) throw new Error("usePeriodos debe ser usado dentro de un PeriodoProvider");
    return context;
};

export function PeriodoProvider({ children }) {
    const [periodos, setPeriodos] = useState([]);

    const getPeriodos = async () => {
        try {
            const res = await getPeriodosRequest();
            setPeriodos(res.data);
        } catch (error) {
            console.error("Error al obtener periodos:", error);
        }
    };

    const createPeriodo = async (periodo) => {
        try {
            await createPeriodoRequest(periodo);
            await getPeriodos();
        } catch (error) {
            console.error("Error al crear periodo:", error);
        }
    };

    const activarPeriodo = async (id) => {
        try {
            await marcarPeriodoActivoRequest(id);
            await getPeriodos();
        } catch (error) {
            console.error("Error al activar periodo:", error);
        }
    };

    return (
  <PeriodoContext.Provider value={{ 
        periodos, 
        getPeriodos,     // <--- ESTA LÍNEA FALTABA O ESTABA MAL ESCRITA
        createPeriodo, 
        activarPeriodo 
    }}>
        {children}
    </PeriodoContext.Provider>
    );
}