import React, { createContext, useContext, useState } from "react"; 
import { 
    getCarrerasRequest, 
    createCarreraRequest 
} from "../api/carreras.js";

const CarreraContext = createContext();

export const useCarreras = () => {
    const context = useContext(CarreraContext);
    if (!context) throw new Error("useCarreras debe usarse dentro de un CarreraProvider");
    return context;
};

export const CarreraProvider = ({ children }) => {
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(true);

    const getCarreras = async () => {
        try {
            const res = await getCarrerasRequest();
            setCarreras(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener carreras:", error);
            setLoading(false);
        }
    };

    const createCarrera = async (carreraData) => {
        try {
            const res = await createCarreraRequest(carreraData);
            setCarreras([...carreras, res.data]);
        } catch (error) {
            console.error("Error al crear carrera:", error);
            throw error;
        }
    };

    return (
        <CarreraContext.Provider value={{ 
            carreras, 
            getCarreras, 
            createCarrera,
            loading 
        }}>
            {children}
        </CarreraContext.Provider>
    );
};