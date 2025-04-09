import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import React, { useEffect, useState } from 'react';

function ProtectedRoute() {
  const { loading, isAuthenticated, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      setIsAdmin(true);
    }
  }, [user]); // Cuando el 'user' cambie, actualizamos el estado de 'isAdmin'

  // Si está cargando, muestra un mensaje de carga
  if (loading) return <h1>Loading...</h1>;

  // Si el usuario no está autenticado, redirige al login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Si el usuario es admin, redirige a la página de Principal.tsx
  if (isAdmin && window.location.pathname !== '/add-employee' && window.location.pathname !== '/employees') {
    return <Navigate to="/employees" replace />;
  }

  // Si está autenticado y no es admin, renderiza las rutas hijas
  return <Outlet />;
}

export default ProtectedRoute;
