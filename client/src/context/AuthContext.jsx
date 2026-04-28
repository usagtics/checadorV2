import React, { createContext, useState, useContext, useEffect } from "react";
import {
  registerRequest,
  loginRequest,
  verityTokenRequest,
} from "../api/auth.js";
import Cookies from "js-cookie";
export const AuthContext = createContext();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [isAuthenticated, setisAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const signup = async (user) => {
    try {
      const res = await registerRequest(user);
      console.log(res.data);
      setUser({
        id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        tipoHorario: res.data.tipoHorario,
        empleadoId: res.data.empleadoId, 
      });
      
      setisAuthenticated(true);
    } catch (error) {
      setErrors(error.response.data);
    }
  };
  const signin = async (user) => {
    try {
      const res = await loginRequest(user);
      console.log("Respuesta del backend:", res.data); 
  
      setUser({
        id: res.data.id,
        name: res.data.username,
        email: res.data.email,
        role: res.data.role,
        tipoHorario: res.data.tipoHorario,
        empleadoId: res.data.empleadoId,
      });
      
  
      setisAuthenticated(true);
    } catch (error) {
      if (Array.isArray(error.response.data)) {
        return setErrors(error.response.data);
      }
      setErrors([error.response.data.message]);
    }
  };
  
  const logout = () => {
    Cookies.remove("token");
    setisAuthenticated(false);
    setUser(null);
  }
  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);
  useEffect(() => {
    async function checkLogin() {
      const cookies = Cookies.get();
      if (!cookies.token) {
        setisAuthenticated(false);
        setLoading(false);
        return setUser(null);
      }
      try {
        const res = await verityTokenRequest(cookies.token);
        if (!res.data) {
          setisAuthenticated(false);
          setLoading(false);
          return;
        }
        setUser({
          id: res.data.id, 
          name: res.data.username, 
          email: res.data.email,
          role: res.data.role,
          tipoHorario: res.data.tipoHorario,
          empleadoId: res.data.empleadoId, 
        });
        
        setisAuthenticated(true);
        setLoading(false);
      } catch (error) {
        setisAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    }
    checkLogin();
  }, []);
  return (
    <AuthContext.Provider
      value={{
        signup,
        signin,
        logout,
        loading,
        user,
        isAuthenticated,
        errors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
