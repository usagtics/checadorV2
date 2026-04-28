import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useDirectivo } from './context/DirectivoContext';
import { useDocentes } from './context/DocenteContext'; 
import React from 'react';

function ProtectedRoute() {
  const { loading: loadingAuth, isAuthenticated: isAuthGeneral, user: userGeneral } = useAuth();
  const { loading: loadingDirectivo, isAuthenticated: isAuthDirectivo, user: userDirectivo } = useDirectivo();
  const { loading: loadingDocente, isAuthenticated: isAuthDocente } = useDocentes(); 

  const location = useLocation();

  if (loadingAuth || loadingDirectivo || loadingDocente) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-xl font-black text-blue-900 animate-pulse">Sincronizando seguridad...</h1>
      </div>
    );
  }

  // =========================================================
  // 🛡️ REGLA 1: RUTAS EXCLUSIVAS PARA DOCENTES (/docente/...)
  // =========================================================
  if (location.pathname.startsWith('/docente')) {
    if (!isAuthDocente) {
      return <Navigate to="/directivo/login" replace />;
    }
    return <Outlet />; // ✅ ¡ESTO ES LO QUE FALTABA! ¡DÉJALOS PASAR!
  }

  // =========================================================
  // 🛡️ REGLA 2: RUTAS DE ADMINISTRACIÓN
  // =========================================================
  if (!isAuthGeneral && !isAuthDirectivo) {
    
    if (isAuthDocente) {
      console.warn("Acceso denegado: Los docentes no pueden entrar a rutas de administración.");
      return <Navigate to="/docente/inicio" replace />;
    }

    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/directivo')) {
      return <Navigate to="/directivo/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = userDirectivo?.role || userGeneral?.role;
  const isSuperAdmin = role === 'super-admin';
  const isAdmin = role === 'admin'; 

  if (location.pathname.startsWith('/admin/directivos') && !isSuperAdmin) {
    console.warn("Acceso denegado: Se requiere nivel Super-Admin");
    return <Navigate to="/admin" replace />;
  }

  const canAccessAdmin = isSuperAdmin || isAdmin;
  if (location.pathname.startsWith('/admin') && !canAccessAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;