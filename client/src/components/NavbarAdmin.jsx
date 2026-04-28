import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDirectivo } from "../context/DirectivoContext";
import { useDocentes } from "../context/DocenteContext"; // ✅ Agregamos Docentes
import logo from "../assets/logo.png"; 

function Navbar() {
  const navigate = useNavigate();

  // Traemos los 3 contextos
  const { isAuthenticated: isAuthGeneral, logout: logoutGeneral, user: userGeneral } = useAuth();
  const { isAuthenticated: isAuthDirectivo, user: userDirectivo } = useDirectivo();
  const { isAuthenticated: isAuthDocente, docente, logoutDocente } = useDocentes(); // ✅ Agregamos Docente

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lógica de detección unificada
  const isLogged = isAuthGeneral || isAuthDirectivo || isAuthDocente;
  const currentUser = userDirectivo || userGeneral || docente; // ✅ Incluye al docente
  
  // Ajuste de nombres (Docentes usan 'nombre', otros usan 'name' o 'username')
  const nombreUsuario = currentUser?.nombre || currentUser?.name || currentUser?.username;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const handleLogout = () => {
    if (isAuthDocente) {
      logoutDocente();
      navigate("/directivo/login");
    } else if (isAuthDirectivo) {
      // Usamos el logout del contexto si existe, sino la cookie manual
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/directivo/login";
    } else {
      logoutGeneral();
      navigate("/login");
    }
  };

  // Determinar la etiqueta del rol
  const getRoleLabel = () => {
    if (isAuthDocente) return "Docente USAG";
    if (isAuthDirectivo) return `Director ${userDirectivo?.carrera || ''}`;
    if (isAuthGeneral) return "Administrador";
    return "";
  };

  return (
    <nav className="bg-blue-900 shadow-2xl text-white font-sans sticky top-0 z-50 border-b border-blue-800">
      <div className="w-full px-4 md:px-8"> 
        <div className="flex items-center justify-between h-20 md:h-24"> 
          
          <Link to="/" className="flex items-center gap-4 group hover:opacity-95 transition duration-300">
            <div className="p-2 rounded-xl shadow-md transform group-hover:scale-105 transition duration-300 flex items-center justify-center">
              <img src={logo} alt="USAG Logo" className="h-10 w-auto md:h-14 object-contain" />
            </div>
            
            <div className="flex flex-col justify-center">
              <span className="text-xs sm:text-sm font-bold tracking-wider text-blue-200 uppercase">Universidad</span>
              <span className="text-sm sm:text-xl md:text-2xl font-black tracking-tight text-white drop-shadow-lg leading-none">
                San Andrés de Guanajuato
              </span>
            </div>
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              {isLogged ? (
                <>
                  <div className="flex items-center gap-3 bg-blue-950/40 border border-blue-700/30 py-2 px-5 rounded-full backdrop-blur-sm shadow-inner transition hover:bg-blue-950/60">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-white text-blue-900 flex items-center justify-center shadow-sm">
                        <span className="font-black text-lg">{getInitial(nombreUsuario)}</span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-900 rounded-full animate-pulse"></div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-blue-300 font-semibold">
                        {getRoleLabel()}
                      </span>
                      <span className="text-sm md:text-base font-bold text-white leading-none whitespace-nowrap max-w-[200px] truncate">
                        {nombreUsuario} 
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="bg-white text-blue-900 hover:bg-gray-100 transition-all duration-300 rounded-full px-6 py-2 shadow-lg font-black text-sm border-2 border-transparent transform hover:-translate-y-0.5"
                  >
                    Salir
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button onClick={toggleMenu} className="p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-800 transition">
              {!isMenuOpen ? (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-950 shadow-inner border-t border-blue-800">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {isLogged ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-white text-blue-900 flex items-center justify-center shadow-md mb-2">
                    <span className="text-3xl font-black">{getInitial(nombreUsuario)}</span>
                  </div>
                  <span className="text-blue-300 text-sm">{getRoleLabel()}</span>
                  <span className="text-xl font-bold text-white text-center px-2">{nombreUsuario}</span>
                </div>
                <button onClick={handleLogout} className="w-full bg-white text-red-600 rounded-xl px-5 py-3 shadow-md font-black">
                  Cerrar sesión
                </button>
              </div>
            ) : <div className="text-center text-white p-4">Inicia sesión</div>}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;