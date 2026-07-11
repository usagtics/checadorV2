import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// ✅ IMPORTAMOS LOS DOS CONTEXTOS
import { useDirectivo } from "../../context/DirectivoContext";
import { useDocentes } from "../../context/DocenteContext"; 

// Asegúrate de que la ruta a tu logo sea correcta
import logo from "../../assets/logo.png"; 

export function DirectivoLoginPage() {
  const [isDocente, setIsDocente] = useState(true);

  const { register, handleSubmit, reset, formState: { errors: formErrors } } = useForm();
  const navigate = useNavigate();

  const { signinDirectivo, isAuthenticated: isAuthDir, errors: errDir } = useDirectivo();
  const { signinDocente, isAuthenticated: isAuthDoc, errors: errDoc } = useDocentes();

  useEffect(() => {
    if (isAuthDoc) {
      navigate("/docente/inicio"); 
    }
    if (isAuthDir) {
      navigate("/admin"); 
    }
  }, [isAuthDoc, isAuthDir, navigate]);

  const onSubmit = handleSubmit((data) => {
    console.log("Enviando datos:", data); 
    if (isDocente) {
      signinDocente(data); 
    } else {
      signinDirectivo(data); 
    }
  });

  const handleSwitch = (modoDocente) => {
    setIsDocente(modoDocente);
    reset(); 
  };

  const currentErrors = isDocente ? errDoc : errDir;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans overflow-hidden selection:bg-blue-900/10 selection:text-blue-900">
      
   
      <div className="w-full lg:w-[60%] flex items-center justify-center p-8 sm:p-12 relative z-10 bg-gray-50">
        
        <div className="w-full max-w-md bg-white p-10 sm:p-12 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
          
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">
              Somos <span className="text-blue-900">USAG</span>
            </h1>
            <p className="text-gray-500 font-medium text-sm">Selecciona tu perfil de acceso</p>
          </div>

          <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 border border-gray-100">
            <button
              type="button"
              onClick={() => handleSwitch(true)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isDocente ? 'bg-white text-blue-900 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Docente
            </button>
            <button
              type="button"
              onClick={() => handleSwitch(false)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isDocente ? 'bg-white text-blue-900 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Administrativo
            </button>
          </div>

          {currentErrors?.map((error, i) => (
            <div key={i} className="bg-red-50 border border-red-200 text-red-600 p-4 text-sm font-bold rounded-2xl mb-6 text-center flex items-center justify-center gap-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          ))}

          <form onSubmit={onSubmit} className="space-y-6">
            
            {isDocente ? (
              <div>
                <label className="block text-gray-500 text-[10px] font-black mb-2 uppercase tracking-widest px-1">Nombre de Usuario</label>
                <input 
                  type="text" 
                  {...register("username", { required: true })} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all shadow-sm font-bold" 
                  placeholder="ej. marta.g"
                />
                {formErrors.username && <p className="text-red-500 text-xs mt-2 px-1 font-bold">El usuario es obligatorio</p>}
              </div>
            ) : (
              <div>
                <label className="block text-gray-500 text-[10px] font-black mb-2 uppercase tracking-widest px-1">Correo Institucional</label>
                <input 
                  type="email" 
                  {...register("email", { required: true })} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all shadow-sm font-bold" 
                  placeholder="ejemplo@usag.edu.mx"
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-2 px-1 font-bold">El correo es obligatorio</p>}
              </div>
            )}

            <div>
              <label className="block text-gray-500 text-[10px] font-black mb-2 uppercase tracking-widest px-1">Contraseña</label>
              <input 
                type="password" 
                {...register("password", { required: true })} 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all shadow-sm tracking-widest font-bold" 
                placeholder="••••••••"
              />
              {formErrors.password && <p className="text-red-500 text-xs mt-2 px-1 font-bold">La contraseña es obligatoria</p>}
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-900 hover:bg-blue-950 text-white font-black py-5 mt-4 rounded-2xl transition-all shadow-lg shadow-blue-900/30 transform active:scale-95 flex items-center justify-center gap-2"
            >
              Entrar al Panel
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[40%] bg-blue-950 relative items-center justify-center z-20">
        
        <div className="absolute top-[-10%] -left-[80px] w-[160px] h-[120%] bg-blue-950 rounded-[100%] shadow-[-15px_0_30px_rgba(0,0,0,0.15)] pointer-events-none"></div>
        
        <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-10"></div>

        <div className="relative z-30 flex flex-col items-center px-8">
          <img 
            src={logo} 
            alt="USAG Logo" 
            className="w-96 xl:w-[450px] h-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
      
    </div>
  );
}