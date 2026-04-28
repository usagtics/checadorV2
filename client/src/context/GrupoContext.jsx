import React, { createContext, useContext, useState } from "react"; 
import { 
    getGruposRequest, 
    getGrupoRequest, 
    createGrupoRequest, 
    updateGrupoRequest, 
    deleteGrupoRequest 
} from "../api/grupos";

const GrupoContext = createContext();

export const useGrupos = () => {
    const context = useContext(GrupoContext);
    if (!context) {
        throw new Error("useGrupos debe usarse dentro de un GrupoProvider");
    }
    return context;
};

export const GrupoProvider = ({ children }) => {
    const [grupos, setGrupos] = useState([]);
    const [errors, setErrors] = useState([]);

    // Listar
    const getGrupos = async (filtros) => {
        try {
            const res = await getGruposRequest(filtros);
            setGrupos(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    // Crear
    const createGrupo = async (grupo) => {
        try {
            const res = await createGrupoRequest(grupo);
            setGrupos([...grupos, res.data]);
            return res.data;
        } catch (error) {
            setErrors(error.response?.data?.message || ["Error al crear el grupo"]);
            throw error;
        }
    };

    // Obtener uno solo
    const getGrupo = async (id) => {
        try {
            const res = await getGrupoRequest(id);
            return res.data;
        } catch (error) {
            console.error(error);
        }
    };

    // ACTUALIZAR (Esta es la función interna que usa updateGrupoRequest)
    const updateGrupo = async (id, grupo) => {
        try {
            await updateGrupoRequest(id, grupo);
        } catch (error) {
            console.error(error);
        }
    };

    // Eliminar
    const deleteGrupo = async (id) => {
        try {
            await deleteGrupoRequest(id);
            setGrupos(grupos.filter((grupo) => grupo._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <GrupoContext.Provider
            value={{
                grupos,
                getGrupos,
                createGrupo,
                getGrupo,
                updateGrupo, // <--- Esta es la que pasas al Provider
                deleteGrupo,
                errors,
            }}
        >
            {children}
        </GrupoContext.Provider>
    );
};