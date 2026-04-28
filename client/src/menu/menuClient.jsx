import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiChartPie,
  HiArrowSmRight,
  HiMenu, // Icono de hamburguesa
  HiX,    // Icono de cerrar (tache)
} from "react-icons/hi";

function MenuClient() {
  // Estado para controlar si el menú está abierto o cerrado en móvil
  const [isOpen, setIsOpen] = useState(false);

  // Función para cerrar el menú al dar clic en un enlace (para móvil)
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* --- BOTÓN DE MENÚ (Solo visible en Móvil/Tablet) --- */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-blue-900 text-white rounded-md shadow-lg hover:bg-blue-800 focus:outline-none"
          aria-label="Abrir menú"
        >
          {/* Si está abierto mostramos una X, si no, la hamburguesa */}
          {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* --- FONDO OSCURO (Overlay) --- */}
      {/* Solo aparece en móvil cuando el menú está abierto para oscurecer el fondo */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR (ASIDE) --- */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-72 
          bg-gradient-to-b from-blue-900 to-blue-600 text-white shadow-xl
          transition-transform duration-300 ease-in-out
          ${/* Lógica de visibilidad: */ ""}
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static 
        `}
      >
        {/* Encabezado del Menú (Opcional, para dar espacio en móvil) */}
        <div className="flex items-center justify-between px-6 py-6 md:py-8">
          <h2 className="text-2xl font-bold tracking-wide">Menú</h2>
          
          {/* Botón cerrar extra dentro del menú para móvil */}
          <button onClick={() => setIsOpen(false)} className="md:hidden">
            <HiX size={24} />
          </button>
        </div>

        {/* Links de Navegación */}
        <nav className="px-4 flex flex-col gap-4">
          <Link
            to="/checadas"
            onClick={handleLinkClick} // Cierra el menú al navegar
            className="flex items-center gap-4 px-4 py-3 rounded-md hover:bg-white/20 transition-all duration-200 group"
            aria-label="Ir a Checadas"
          >
            <HiChartPie className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-lg font-semibold">Checar</span>
            <HiArrowSmRight className="ml-auto text-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Ejemplo de link comentado (descomentar para probar) */}
          {/* <Link
            to="/profile"
            onClick={handleLinkClick}
            className="flex items-center gap-4 px-4 py-3 rounded-md hover:bg-white/20 transition-all duration-200 group"
          >
            <HiUser className="text-2xl" />
            <span className="text-lg font-semibold">Perfil</span>
            <HiArrowSmRight className="ml-auto text-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link> 
          */}
        </nav>
      </aside>
    </>
  );
}

export default MenuClient;