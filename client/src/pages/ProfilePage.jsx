import React, { useState, createContext, useContext } from "react";
import { LogOut, User, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";

// --- INICIO: MOCK DEL CONTEXTO (SOLO PARA ESTA VISTA PREVIA) ---
// En tu código real, borra esta sección y usa: import { useAuth } from "../context/AuthContext";

const AuthContext = createContext();

const useAuth = () => {
  // Simulación de los datos que vendrían de tu AuthContext real
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback por si se usa fuera del provider en la preview
    return {
        user: { id: "1", name: "Administrador Demo", email: "admin@checador.com" },
        updatePassword: async () => new Promise(resolve => setTimeout(resolve, 1000)),
        logout: () => alert("Cerrando sesión (Demo)")
    }
  }
  return context;
};

// Componente Wrapper para que funcione la demo
const App = () => {
  const mockUser = { id: "1", name: "Paulina Galván", email: "cp.isabelusag@gmail.com" };
  const mockUpdatePassword = async (id, pass) => {
    console.log(`Actualizando password de ${id} a ${pass}`);
    return new Promise((resolve) => setTimeout(resolve, 800)); // Simula delay de red
  };
  const mockLogout = () => window.location.reload();

  return (
    <AuthContext.Provider value={{ user: mockUser, updatePassword: mockUpdatePassword, logout: mockLogout }}>
      <ProfilePage />
    </AuthContext.Provider>
  );
};
// --- FIN DEL MOCK ---


const ProfilePage = () => {
  // Usa el hook (en tu proyecto real, esto importará desde tu archivo de contexto)
  const { user, updatePassword, logout } = useAuth();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }
    
    if (newPassword.length < 6) {
        return setError("La contraseña debe tener al menos 6 caracteres");
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updatePassword(user.id, newPassword);
      setSuccess("Contraseña actualizada correctamente");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
        
        {/* Encabezado */}
        <div className="bg-blue-900 px-6 py-8 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Perfil del Usuario
            </h1>
            <p className="text-blue-200 text-sm sm:text-base mt-1 flex items-center justify-center sm:justify-start gap-2">
              <User size={16} /> Administra tu información personal
            </p>
          </div>
          {/* Avatar simple con inicial */}
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl border-4 border-blue-800/50 shadow-inner">
             {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Sección de Datos Personales */}
          <section className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
              <User className="text-blue-600" size={20} />
              Información Personal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Nombre Completo</p>
                <p className="text-gray-900 font-medium text-lg capitalize">{user?.name || "Cargando..."}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Correo Electrónico</p>
                <div className="flex items-center gap-2 text-gray-900 font-medium text-lg break-all">
                    <Mail size={16} className="text-gray-400 shrink-0" />
                    {user?.email || "Cargando..."}
                </div>
              </div>
            </div>
          </section>

          {/* Sección de Cambio de Contraseña */}
          <section>
            <h2 className="text-xl font-bold text-blue-900 mb-5 flex items-center gap-2">
              <Lock className="text-blue-600" size={24} />
              Cambiar contraseña
            </h2>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 border border-red-200 flex items-start sm:items-center gap-3 animate-pulse">
                <AlertCircle className="shrink-0" size={20} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 border border-green-200 flex items-start sm:items-center gap-3">
                <CheckCircle className="shrink-0" size={20} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-gray-700 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-gray-700 bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-md flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-800 hover:shadow-lg transform active:scale-95'}`}
                >
                  {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Actualizando...
                    </>
                  ) : (
                    "Actualizar Contraseña"
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Zona de Cerrar Sesión */}
          <section className="pt-8 border-t border-gray-200 mt-8">
            <button
                onClick={() => logout()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-red-600 hover:text-white border-2 border-red-100 hover:bg-red-600 hover:border-red-600 font-bold py-3 px-6 rounded-lg transition duration-300 group"
            >
                <LogOut className="text-red-600 group-hover:text-white transition-colors" size={20} />
                Cerrar Sesión
            </button>
          </section>

        </div>
      </div>
    </div>
  );
};

export default App; // Exportamos App para que funcione la preview con el Contexto