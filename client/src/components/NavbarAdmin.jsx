import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import usagLogo from "../assets/usagg.png"; 

function NavbarAdmin() {
  const { isAuthenticated, logout, user } = useAuth();
    console.log("User desde NavbarAdmin:", user); 


  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-400 text-white py-4 px-8 shadow-md">
      <div className="flex justify-between items-center">
      
        <div className="flex items-center gap-4">
          <img src={usagLogo} alt="USAG Logo" className="h-13 w-auto" />
          <h1 className="text-xl font-bold">Panel de Administración</h1>
        </div>

 
        <ul className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <li className="text-sm">
           <span className="font-semibold">{user?.username}</span>
              </li>
              {/*
              <li>
                <Link to="/employees" className="hover:underline">
                  Empleados
                </Link>
              </li>
              {/*<li>
               <Link to="/add-employee" className="hover:underline">
                  Agregar Empleado
                </Link>
              </li>
              */}<li>
                <button
                  onClick={logout}
                  className="text-red-300 hover:text-red-500 transition"
                >
                  Cerrar sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="hover:underline">Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:underline">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default NavbarAdmin;
