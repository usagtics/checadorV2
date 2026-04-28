import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import usaggLogo from "../assets/usagg.png";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

    {/* CAMBIO: Se quitó el degradado y se puso un azul sólido e institucional (blue-600) */}
    <nav className="bg-blue-600 shadow-md text-white font-sans sticky top-0 z-50">
      
      <div className="w-full px-4 md:px-8"> 
        <div className="flex items-center justify-between h-20 md:h-24"> 
          
          {/* --- LOGO Y TÍTULO --- */}
          <Link to="/" className="flex items-center gap-4 group hover:opacity-95 transition duration-300">
            {/* Contenedor blanco del logo (tal como en tu imagen) */}
            <div className="bg-white p-2 rounded-xl shadow-sm transform group-hover:scale-105 transition duration-300 flex items-center justify-center">
              <img
                src={usaggLogo}
                alt="USAGG Logo"
                className="h-10 w-auto md:h-14 object-contain" 
              />
            </div>
            
            <div className="flex flex-col justify-center">
              <span className="text-xs sm:text-sm font-bold tracking-wider text-blue-100 uppercase">
                Universidad
              </span>
              <span className="text-sm sm:text-xl md:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm leading-none">
                San Andrés de Guanajuato
              </span>
            </div>
          </Link>

          {/* --- MENÚ DE ESCRITORIO --- */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  {/* Tarjeta de Usuario - Ajustada para fondo azul sólido */}
                  <div className="flex items-center gap-3 bg-blue-700/50 border border-blue-500/50 py-2 px-5 rounded-full backdrop-blur-sm shadow-inner transition hover:bg-blue-700/70">
                    <div className="relative">
                      {/* Círculo de avatar */}
                      <div className="w-10 h-10 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-sm">
                        <span className="font-black text-lg">
                          {getInitial(user?.name)}
                        </span>
                      </div>
                      {/* Puntito verde de "En línea" */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-700 rounded-full animate-pulse"></div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-blue-200 font-semibold">
                        Bienvenid@
                      </span>
                      <span className="text-sm md:text-base font-bold text-white leading-none whitespace-nowrap max-w-[200px] truncate">
                        {user?.name} 
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="bg-white text-blue-700 hover:bg-gray-50 transition-all duration-300 rounded-full px-6 py-2 shadow-md font-bold text-sm border border-transparent transform hover:-translate-y-0.5"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>

          {/* --- BOTÓN HAMBURGUESA (MÓVIL) --- */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none transition"
            >
              <span className="sr-only">Abrir menú</span>
              {!isMenuOpen ? (
                <svg className="block h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENÚ MÓVIL --- */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-700 shadow-inner border-t border-blue-500" id="mobile-menu">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {isAuthenticated ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-md mb-2">
                    <span className="text-3xl font-black">{getInitial(user?.name)}</span>
                  </div>
                  <span className="text-blue-200 text-sm">Hola,</span>
                  <span className="text-xl font-bold text-white text-center px-2">{user?.name}</span>
                </div>

                <div className="w-full border-t border-blue-500 my-1"></div>

                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full bg-white hover:bg-gray-100 text-red-600 transition rounded-xl px-5 py-3 shadow-sm font-black flex items-center justify-center gap-2"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
               <div className="text-center text-white p-4">Inicia sesión</div>
            )}
          </div>
        </div>
      )}
    </nav>

}

export default Navbar;