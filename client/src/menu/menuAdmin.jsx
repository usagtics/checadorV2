import React from "react";
import { Link } from "react-router-dom";
import {
  HiArrowSmRight,
  HiChartPie,
  HiInbox,
  HiShoppingBag,
  HiTable,
  HiUser,
  HiViewBoards
} from "react-icons/hi";

function MenuAdmin() {
  return (
    <div className="w-68 h-screen bg-gradient-to-b from-blue-900 to-blue-400 text-white flex flex-col">
      <div className="px-4">
        <a
          href="#"
          className="flex items-center p-3 hover:bg-blue-400 rounded-md"
        >
          <HiChartPie className="mr-3 text-xl" />
          Dashboard
        </a>

        <Link
          to="/employees"
          className="flex items-center p-3 hover:bg-blue-400 rounded-md"
        >
          <HiUser className="mr-3 text-xl" />
          Empleados
        </Link>

        {/* ✅ Nuevo link agregado */}
        <Link
          to="/tipo-horario"
          className="flex items-center p-3 hover:bg-blue-400 rounded-md"
        >
          <HiTable className="mr-3 text-xl" />
          Tipos de Horario
        </Link>
      </div>
    </div>
  );
}

export default MenuAdmin;
