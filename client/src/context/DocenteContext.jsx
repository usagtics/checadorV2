import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getDocentesRequest,
  createDocenteRequest,
  updateDocenteRequest,
  deleteDocenteRequest,
  getDocenteRequest,
  checarQRRequest,
  loginDocenteRequest, // ✅ Nueva
  verifyDocenteTokenRequest // ✅ Nueva (para persistencia)
} from "../api/docentes";
import Cookies from "js-cookie";

export const DocenteContext = createContext();

export const useDocentes = () => {
  const context = useContext(DocenteContext);
  if (!context) {
    throw new Error("useDocentes debe ser usado dentro de un DocenteProvider");
  }
  return context;
};

export function DocenteProvider({ children }) {
  const [docentes, setDocentes] = useState([]);
  const [docente, setDocente] = useState(null); // Datos del docente logueado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 🔐 SECCIÓN DE AUTENTICACIÓN ---

  // 1. Login de Docente
  const signinDocente = async (user) => {
    try {
      const res = await loginDocenteRequest(user);
      setDocente(res.data);
      setIsAuthenticated(true);
      setErrors([]);
    } catch (error) {
      const errorMsg = error.response?.data || ["Error al iniciar sesión"];
      setErrors(Array.isArray(errorMsg) ? errorMsg : [errorMsg]);
    }
  };

  // 2. Cerrar Sesión
  const logoutDocente = () => {
    Cookies.remove("token");
    setDocente(null);
    setIsAuthenticated(false);
  };

  // 3. Persistencia: Verificar token al cargar la app
  useEffect(() => {
    async function checkLogin() {
      const cookies = Cookies.get();
      if (!cookies.token) {
        setIsAuthenticated(false);
        setLoading(false);
        return setDocente(null);
      }

      try {
        const res = await verifyDocenteTokenRequest(cookies.token);
        if (!res.data) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setDocente(res.data);
        setLoading(false);
      } catch (error) {
        setIsAuthenticated(false);
        setDocente(null);
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

  // --- 📋 SECCIÓN DE GESTIÓN (CRUD) ---

  const getDocentes = async () => {
    try {
      const res = await getDocentesRequest();
      setDocentes(res.data);
    } catch (error) {
      console.error("Error al obtener docentes:", error);
    }
  };

  const getDocente = async (id) => {
    try {
      const res = await getDocenteRequest(id);
      return res.data;
    } catch (error) {
      console.error("Error al obtener el docente:", error);
    }
  };

  const createDocente = async (docenteData) => {
    try {
      setErrors([]);
      const res = await createDocenteRequest(docenteData);
      setDocentes([...docentes, res.data]); 
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error al crear docente";
      setErrors(Array.isArray(errorMsg) ? errorMsg : [errorMsg]);
      throw error; 
    }
  };

  const updateDocente = async (id, docenteData) => {
    try {
      await updateDocenteRequest(id, docenteData);
      getDocentes();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteDocente = async (id) => {
    try {
      const res = await deleteDocenteRequest(id);
      if (res.status === 204 || res.status === 200) {
        setDocentes(docentes.filter((d) => d._id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checarQR = async (numeroEmpleado) => {
    try {
      const res = await checarQRRequest({ numeroEmpleado }); 
      return res.data; 
    } catch (error) {
      throw error; 
    }
  };

  // Limpiar errores automáticamente
  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  return (
    <DocenteContext.Provider
      value={{
        docentes,
        docente,
        isAuthenticated,
        errors,
        loading,
        getDocentes,
        getDocente,
        createDocente,
        updateDocente,
        deleteDocente,
        checarQR,
        signinDocente,
        logoutDocente
      }}
    >
      {children}
    </DocenteContext.Provider>
  );
}