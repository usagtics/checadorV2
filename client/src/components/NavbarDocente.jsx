import { Link } from "react-router-dom";
import { useDocentes } from "../context/DocenteContext";
import logo from "../assets/logo.png";
import React from 'react';

function NavbarDocente() {
  const { logoutDocente, docente } = useDocentes();

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-10 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <Link to="/docente/inicio" className="flex items-center gap-3">
        <img src={logo} alt="USAG Logo" className="w-10 h-auto" />
        <span className="text-blue-900 font-black tracking-tighter text-xl hidden sm:block">
          Portal <span className="text-gray-900">Docente</span>
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-gray-900 font-bold text-sm leading-none">
            {docente?.nombre}
          </span>
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
            Profesor Activo
          </span>
        </div>

        <button
          onClick={() => logoutDocente()}
          className="bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 p-3 rounded-xl transition-all border border-gray-100 group"
          title="Cerrar Sesión"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default NavbarDocente;