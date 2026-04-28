import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useChecadas } from "../context/checadasContext";
import { usePlanteles } from "../context/plantelesContext";
import { Wifi, Clock, LogIn, LogOut, MapPin } from "lucide-react"; 
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { FaRegClock } from "react-icons/fa";

// Interfaces actualizadas
interface Checada {
  _id: string;
  hora: Date;
  tipo: string;
  status?: string; // Nuevo campo
  tarde?: boolean;
  empleado: {
    tipoHorario: {
      nombre: string;
      hora_entrada: string;
      hora_salida: string;
    };
  };
  plantel: { nombre: string };
}

interface Plantel {
  _id: string;
  nombre: string;
}

const ChecadaPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const empleadoId = user?.empleadoId;

  const {
    checadas,
    loading,
    registrarChecada,
    obtenerChecadasEmpleado,
  } = useChecadas();

  const { planteles, getPlanteles } = usePlanteles();

  const [tipoChecada, setTipoChecada] = useState("entrada");
  const [selectedPlantel, setSelectedPlantel] = useState("");
  const [checadasFiltradas, setChecadasFiltradas] = useState<Checada[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
  });
  const [horaActual, setHoraActual] = useState(new Date());
  const [tipoHorario, setTipoHorario] = useState<any>(null);
  
  // Cámara
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);


  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        // Solicitamos la cámara
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error: any) {
        console.error("Error de cámara:", error);

        // CASO 1: El usuario dio click en "Bloquear" o el navegador no tiene permiso
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
             Swal.fire({
                icon: 'warning',
                title: 'Cámara Bloqueada',
                html: `
                    <p>No podemos registrar tu asistencia sin la cámara.</p>
                    <ul style="text-align: left; margin-top: 10px;">
                        <li>1. Haz clic en el 🔒 <b>candado</b> o icono de ajustes junto a la URL (arriba).</li>
                        <li>2. Busca la opción <b>Cámara</b> y selecciona <b>"Permitir"</b>.</li>
                        <li>3. Recarga la página.</li>
                    </ul>
                `,
                confirmButtonText: 'Entendido',
                footer: 'Es necesario para validar tu identidad.'
             });
        } 
        // CASO 2: No se encontró cámara o está siendo usada por otra app
        else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
             toast.error("No se detectó ninguna cámara conectada.");
        } 
        // CASO 3: Error genérico
        else {
             toast.error("Error al acceder a la cámara: " + error.message);
        }
      }
    };

    initCamera();

    // Limpieza al desmontar
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturarFoto = (): Blob | null => {
    if (!canvasRef.current || !videoRef.current) return null;
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL("image/jpeg");

    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  // --- CARGA DE DATOS ---
  useEffect(() => {
    getPlanteles();
  }, []);

  useEffect(() => {
    if (user?.tipoHorario) {
      setTipoHorario(user.tipoHorario);
    } else {
      setTipoHorario(null);
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchChecadas = async () => {
      if (!authLoading && isAuthenticated && empleadoId) {
        try {
          const id = typeof empleadoId === 'object' ? (empleadoId as any)._id : empleadoId;
          await obtenerChecadasEmpleado(id);
        } catch (err) {
          console.error("Error al obtener checadas:", err);
        }
      }
    };
    fetchChecadas();
  }, [authLoading, isAuthenticated, empleadoId]);

  useEffect(() => {
    const filtradas = checadas.filter((checada: Checada) => {
      const fechaChecada = new Date(checada.hora).toISOString().split("T")[0];
      return fechaChecada === fechaSeleccionada;
    });
    setChecadasFiltradas(filtradas);
  }, [checadas, fechaSeleccionada]);


  // --- LÓGICA DE REGISTRO CON TOLERANCIA ---
  const handleRegistrarChecada = async () => {
    const yaRegistroEntrada = checadasFiltradas.some((checada) => checada.tipo === "entrada");
    const yaRegistroSalida = checadasFiltradas.some((checada) => checada.tipo === "salida");

    if (tipoChecada === "entrada" && yaRegistroEntrada) {
      return Swal.fire({ icon: "warning", title: "Entrada ya registrada", text: "Ya registraste entrada hoy." });
    }
    if (tipoChecada === "salida" && yaRegistroSalida) {
      return Swal.fire({ icon: "warning", title: "Salida ya registrada", text: "Ya registraste salida hoy." });
    }

    if (!empleadoId) return Swal.fire({ icon: "error", title: "Error", text: "ID de empleado inválido." });
    if (!selectedPlantel) return Swal.fire({ icon: "warning", title: "Selecciona Plantel", text: "Debes seleccionar un plantel." });
    if (!tipoHorario) return Swal.fire({ icon: "error", title: "Error", text: "No tienes horario asignado." });

    // --- CÁLCULO VISUAL DE ESTATUS (Para mostrar al usuario) ---
    const now = new Date();
    const horaTexto = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let mensajeFinal = "";
    let iconoAlerta: "success" | "warning" | "error" = "success";

    if (tipoChecada === "entrada") {
      const [h, m] = tipoHorario.hora_entrada.split(":").map(Number);
      const horaEntrada = new Date(now);
      horaEntrada.setHours(h, m, 0, 0);
      
      // Diferencia en minutos
      const diffMs = now.getTime() - horaEntrada.getTime();
      const diffMinutos = Math.floor(diffMs / 60000);

      if (diffMinutos <= 15) {
          mensajeFinal = `✅ Entrada A TIEMPO (${horaTexto}).`;
          iconoAlerta = "success";
      } else if (diffMinutos > 15 && diffMinutos <= 20) {
          mensajeFinal = `⚠️ Entrada con RETARDO (${horaTexto}).`;
          iconoAlerta = "warning";
      } else if (diffMinutos > 20) {
          mensajeFinal = `❌ Entrada registrada como FALTA (${horaTexto}).`;
          iconoAlerta = "error"; // Rojo para indicar que cuenta como falta
      } else {
          // Si llegó antes
          mensajeFinal = `✅ Entrada A TIEMPO (${horaTexto}).`;
          iconoAlerta = "success";
      }
    }

    if (tipoChecada === "salida") {
      const [h, m] = tipoHorario.hora_salida.split(":").map(Number);
      const horaSalida = new Date(now);
      horaSalida.setHours(h, m, 0, 0);
      
      if (now < horaSalida) {
          mensajeFinal = `⚠️ Salida ANTICIPADA (${horaTexto}).`;
          iconoAlerta = "warning";
      } else {
          mensajeFinal = `✅ Salida CORRECTA (${horaTexto}).`;
          iconoAlerta = "success";
      }
    }

    try {
      const fotoBlob = await capturarFoto();
      if (!fotoBlob) {
        return Swal.fire({ icon: "error", title: "Error de cámara", text: "No se pudo capturar la foto." });
      }

      const empleadoRealId = typeof empleadoId === "object" ? (empleadoId as any)._id : empleadoId;

      const formData = new FormData();
      formData.append("empleadoId", empleadoRealId);
      formData.append("tipo", tipoChecada);
      formData.append("plantelId", selectedPlantel);
      formData.append("foto", fotoBlob, "checada.jpg");
      
      await registrarChecada(formData);
      await obtenerChecadasEmpleado(empleadoRealId);

      Swal.fire({
        icon: iconoAlerta,
        title: tipoChecada === "entrada" ? "Registro de Entrada" : "Registro de Salida",
        text: mensajeFinal,
      });

    } catch (err: any) {
      console.error("Error al registrar:", err);
      
      if (err.response && err.response.status === 403) {
        Swal.fire({
          icon: "error",
          title: "WiFi Incorrecto",
          text: "No estás conectado al WiFi de la Institución. Conéctate e intenta de nuevo.",
          footer: '<span style="color:red">IP no autorizada</span>'
        });
      } else {
        const msg = err.response?.data?.message || "No se pudo registrar la checada.";
        Swal.fire({
          icon: "error",
          title: "Error",
          text: msg,
        });
      }
    }
  };

  // Cambio automático
  useEffect(() => {
    const yaRegistroEntrada = checadasFiltradas.some((checada) => checada.tipo === "entrada");
    const yaRegistroSalida = checadasFiltradas.some((checada) => checada.tipo === "salida");

    if (yaRegistroEntrada && !yaRegistroSalida) {
      setTipoChecada("salida");
    } else if (!yaRegistroEntrada) {
      setTipoChecada("entrada");
    }
  }, [checadasFiltradas]);

  const colorClase = tipoChecada === "entrada" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="flex-1 relative flex flex-col items-center justify-center bg-blue-100 p-6 overflow-hidden">

        <div className="w-full max-w-xl md:max-w-3xl relative z-10">
          <h1 className="text-3xl font-bold text-center mb-4 text-blue-900">
            Checador de Personal
          </h1>

          {/* RELOJ */}
          <div className="flex flex-col items-center justify-center mb-6 space-y-2">
            <FaRegClock className="w-16 h-16 animate-spin-slow text-blue-400 opacity-30" />
            <div className="flex flex-col items-center justify-center mb-6 space-y-1">
              <div className="text-5xl font-semibold text-blue-900 bg-blue-100 px-10 py-3 rounded-lg shadow-md select-none">
                {horaActual.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-blue-600 bg-white px-4 py-1 rounded-full text-sm shadow-sm">
               <Wifi className="w-4 h-4" />
               <span>Asegúrate de estar conectado al WiFi del Plantel</span>
            </div>
          </div>

          {/* INFO HORARIO */}
          {tipoHorario ? (
            <div className="text-center text-lg text-gray-600 mb-6">
              <p>Horario: <strong>{tipoHorario.nombre}</strong></p>
              <p className="text-sm">
                Entrada: <strong>{tipoHorario.hora_entrada || "N/A"}</strong> | 
                Salida: <strong>{tipoHorario.hora_salida || "N/A"}</strong>
              </p>
            </div>
          ) : (
            <p className="text-center text-lg text-red-500 mb-6">Sin horario asignado.</p>
          )}

          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow-md rounded-xl p-6 border border-blue-100 space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-gray-700 font-semibold mb-2 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" /> Tipo
                  </label>
                  <div className={`w-full px-3 py-2 rounded-lg font-semibold text-center ${tipoChecada === "entrada" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}>
                    {tipoChecada === "entrada" ? "ENTRADA" : "SALIDA"}
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-gray-700 font-semibold mb-2 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" /> Plantel
                  </label>
                  <select
                    value={selectedPlantel}
                    onChange={(e) => setSelectedPlantel(e.target.value)}
                    className="w-full border border-blue-300 rounded-lg px-3 py-2 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Selecciona tu ubicación</option>
                    {planteles.map((p: Plantel) => (
                      <option key={p._id} value={p._id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CÁMARA */}
              <div className="mt-4 flex flex-col items-center justify-center gap-4">
                <div className="w-full max-w-md relative">
                   <video ref={videoRef} autoPlay muted playsInline className="rounded-lg w-full aspect-video object-cover bg-black" />
                   <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              <button
                onClick={handleRegistrarChecada}
                disabled={loading || !selectedPlantel}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-white text-lg font-semibold shadow-md transition duration-300 ${
                  loading ? "bg-gray-400 cursor-not-allowed" : colorClase
                }`}
              >
                {loading ? (
                  "Registrando..."
                ) : (
                  <>
                    {tipoChecada === "entrada" ? <LogIn className="w-6 h-6" /> : <LogOut className="w-6 h-6" />}
                    {tipoChecada === "entrada" ? "CHECAR ENTRADA" : "CHECAR SALIDA"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* HISTORIAL DIARIO */}
          <div className="mt-10 max-w-3xl mx-auto">
            <div className="bg-white shadow-md rounded-xl p-6 border border-blue-100">
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Fecha:</label>
                <input
                  type="date"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                  className="w-full border border-blue-300 rounded-lg px-4 py-2 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <h2 className="text-xl font-bold text-blue-900 mb-4 text-center">Historial de Hoy</h2>
              <ul className="divide-y divide-blue-100 rounded-lg bg-blue-50 max-h-60 overflow-y-auto">
                {checadasFiltradas.length === 0 ? (
                  <li className="p-6 text-blue-500 text-center">No hay registros hoy.</li>
                ) : (
                  checadasFiltradas.map((checada) => (
                    <li key={checada._id} className="flex justify-between items-center p-4 hover:bg-blue-100 transition">
                      <div className="flex items-center gap-4">
                        {checada.tipo === "entrada" ? <LogIn className="text-green-500 w-5 h-5" /> : <LogOut className="text-red-500 w-5 h-5" />}
                        <div>
                          <p className="font-semibold text-blue-800 capitalize">{checada.tipo}</p>
                          <p className="text-xs text-blue-600">{checada.plantel?.nombre || "Sin plantel"}</p>
                          {/* MOSTRAR ESTATUS EN LISTA */}
                          {checada.status && (
                             <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                 checada.status === 'Asistencia' ? 'bg-green-100 text-green-700' :
                                 checada.status === 'Retardo' ? 'bg-yellow-100 text-yellow-700' :
                                 'bg-red-100 text-red-700'
                             }`}>
                                {checada.status}
                             </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-blue-500 font-medium">
                        {new Date(checada.hora).toLocaleTimeString()}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChecadaPage;