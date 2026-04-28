import { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import gifAnimation from "../assets/gifLeon.gif";
import { FaRegClock } from "react-icons/fa";

function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="flex items-center gap-3 text-blue-700 bg-white/90 px-6 py-3 rounded-lg shadow-md w-fit border border-blue-300">
      <FaRegClock className="text-2xl animate-pulse" />
      <div className="text-xl font-semibold tracking-widest font-mono">
        {formatTime(time)}
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute z-0 w-80 h-80 bg-blue-400 rounded-full opacity-30 top-10 left-[-100px] blur-3xl animate-pulse"></div>
      <div className="absolute z-0 w-96 h-96 bg-blue-500 rounded-full opacity-30 bottom-[-120px] right-[-80px] blur-2xl animate-pulse"></div>

   <div className="relative z-10 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-10 px-6 py-12 md:py-20">
  {/* Contenido textual */}
  <div className="w-full md:w-1/2 space-y-6">
    <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight drop-shadow-md">
      Sistema de Checador USAG
    </h1>
    <p className="text-gray-800 text-lg leading-relaxed font-medium">
      Controla la asistencia del{" "}
      <strong className="text-blue-800">
        Colegio San Andrés de Guanajuato
      </strong>{" "}
      de forma precisa.
    </p>

    <DigitalClock />

    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      <Link
        to="/login"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md hover:shadow-xl"
      >
        Iniciar Sesión
      </Link>
      <Link
        to="/register"
        className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-medium transition shadow-md hover:shadow-xl"
      >
        Registrarse
      </Link>
    </div>
  </div>

  {/* Imagen animada ilustrativa */}
  <div className="w-full md:w-1/2 flex items-center justify-center relative">
    <div className="absolute -inset-10 bg-gradient-to-br from-blue-300/20 to-blue-100/10 rounded-full blur-2xl z-0 animate-pulse"></div>
    <img
      src={gifAnimation}
      alt="Animación USAG"
      className="relative z-10 w-80 h-80 object-contain animate-float"
    />
  </div>
</div>

    </div>
  );
}

export default HomePage;
