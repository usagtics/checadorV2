import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  loginDirectivoRequest, 
  registerDirectivoRequest, 
  verifyDirectivoTokenRequest,
  getDirectivosRequest,
  deleteDirectivoRequest,
  updateDirectivoRoleRequest  
} from "../api/directivoAuth";
import Cookies from "js-cookie";

export const DirectivoContext = createContext();

export const useDirectivo = () => {
  const context = useContext(DirectivoContext);
  if (!context) throw new Error("useDirectivo debe usarse dentro de DirectivoProvider");
  return context;
};

export function DirectivoProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true); // <--- Este es el que controla la pantalla blanca
  const [directivos, setDirectivos] = useState([]);

  // 1. Registro de nuevos directivos (Alta)
  const signupDirectivo = async (user) => {
    try {
      const res = await registerDirectivoRequest(user);
      setDirectivos([...directivos, res.data]);
      return res.data;
    } catch (error) {
      if (Array.isArray(error.response?.data)) {
        setErrors(error.response.data);
      } else {
        setErrors([error.response?.data?.message || "Error al registrar"]);
      }
      throw error; 
    }
  };

  // 2. Obtener todos los directivos
  const getDirectivos = async () => {
    try {
      const res = await getDirectivosRequest();
      setDirectivos(res.data);
    } catch (error) {
      console.error("Error al obtener directivos:", error);
    }
  };

  // 3. Login de directivo
  const signinDirectivo = async (user) => {
    try {
      const res = await loginDirectivoRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
    } catch (error) {
      setErrors(Array.isArray(error.response?.data) ? error.response.data : [error.response?.data?.message]);
    }
  };

  // 4. Eliminar directivo
  const deleteDirectivo = async (id) => {
    try {
      await deleteDirectivoRequest(id);
      setDirectivos(directivos.filter((d) => d._id !== id));
    } catch (error) {
      console.log("Error al eliminar:", error);
    }
  };

  // 5. Actualizar rol
  const updateDirectivoRole = async (id, role) => {
    try {
      await updateDirectivoRoleRequest(id, role);
      setDirectivos(directivos.map(d => d._id === id ? { ...d, role } : d));
    } catch (error) {
      console.log("Error al actualizar rol:", error);
    }
  };

  // 6. VERIFICACIÓN CRÍTICA DE SESIÓN (Evita pantalla blanca)
  useEffect(() => {
    async function checkLogin() {
      const cookies = Cookies.get();
      
      if (!cookies.token) {
        setIsAuthenticated(false);
        setLoading(false); // <--- APAGAR LOADING
        return setUser(null);
      }

      try {
        const res = await verifyDirectivoTokenRequest(cookies.token);
        if (!res.data) {
          setIsAuthenticated(false);
          setLoading(false); // <--- ¡AQUÍ ESTABA EL ERROR! Faltaba apagarlo
          return;
        }

        setIsAuthenticated(true);
        setUser(res.data);
        setLoading(false); // <--- APAGAR LOADING SI TODO OK
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false); // <--- APAGAR LOADING SI HAY ERROR
      }
    }
    checkLogin();
  }, []);

  // Limpiar errores automáticamente después de 5 segundos
  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  return (
    <DirectivoContext.Provider value={{
      signupDirectivo,
      signinDirectivo,
      getDirectivos,
      deleteDirectivo,
      updateDirectivoRole,
      directivos,
      user,
      isAuthenticated,
      errors,
      loading
    }}>
      {children}
    </DirectivoContext.Provider>
  );
}