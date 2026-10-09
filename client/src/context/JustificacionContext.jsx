import React, { createContext, useContext, useState } from "react"; 
import { 
    crearJustificacionRequest, 
    getMisJustificacionesRequest, 
    getTodasJustificacionesRequest, 
    updateEstadoJustificacionRequest 
} from "../api/justificaciones";

const JustificacionContext = createContext();

export const useJustificaciones = () => {
    const context = useContext(JustificacionContext);
    if (!context) {
        throw new Error("useJustificaciones debe usarse dentro de un JustificacionProvider");
    }
    return context;
};

export function JustificacionProvider({ children }) {
    const [justificaciones, setJustificaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    const getMisJustificaciones = async () => {
        try {
            setLoading(true);
            const res = await getMisJustificacionesRequest();
            setJustificaciones(res.data);
        } catch (error) {
            console.error("Error al obtener mis justificaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTodasJustificaciones = async (estado) => {
        try {
            setLoading(true);
            const res = await getTodasJustificacionesRequest(estado);
            setJustificaciones(res.data);
        } catch (error) {
            console.error("Error al obtener todas las justificaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    const createJustificacion = async (formData) => {
        try {
            const res = await crearJustificacionRequest(formData);
            setJustificaciones([res.data, ...justificaciones]);
            return true;
        } catch (error) {
            console.error("Error al crear justificación:", error);
            return false;
        }
    };

    const updateEstadoJustificacion = async (id, data) => {
        try {
            const res = await updateEstadoJustificacionRequest(id, data);
            setJustificaciones(justificaciones.map(j => (j._id === id ? res.data : j)));
            return true;
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            return false;
        }
    };

    return (
        <JustificacionContext.Provider value={{
            justificaciones,
            loading,
            getMisJustificaciones,
            getTodasJustificaciones,
            createJustificacion,
            updateEstadoJustificacion
        }}>
            {children}
        </JustificacionContext.Provider>
    );
}