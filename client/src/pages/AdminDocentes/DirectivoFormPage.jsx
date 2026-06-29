import React, { useEffect } from 'react'; // Importamos useEffect
import { useForm } from "react-hook-form";
import { useDirectivo } from "../../context/DirectivoContext";
import { useCarreras } from "../../context/CarreraContext"; // Nuevo import
import { useNavigate, Link } from "react-router-dom";
import MenuDocentes from '../../menu/MenuDocentes';

export default function DirectivoFormPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signupDirectivo, errors: registerErrors } = useDirectivo();
    
    // 👇 Usamos el contexto de Carreras
    const { carreras, getCarreras } = useCarreras();
    const navigate = useNavigate();

    // 👇 Cargamos las carreras al montar el componente
    useEffect(() => {
        getCarreras();
    }, []);

    const onSubmit = handleSubmit(async (values) => {
        try {
            // values.carreras ahora enviará un arreglo de IDs (ej: ["6a428c792a1f..."])
            await signupDirectivo(values);
            navigate("/admin/directivos");
        } catch (error) {
            console.error("Error al registrar:", error);
        }
    });

    return (
        <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-900/10 overflow-hidden">
            <MenuDocentes />
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 flex items-center justify-center relative">
                <Link to="/admin/directivos" className="absolute top-10 left-10 text-gray-400 hover:text-blue-900 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver a la lista
                </Link>

                <div className="bg-white max-w-md w-full p-10 rounded-[3rem] shadow-2xl border border-gray-100 mt-10">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-black text-blue-900 leading-tight">Registrar Directivo</h1>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">Acceso Administrativo USAG</p>
                    </div>

                    {/* Errores del Backend */}
                    {Array.isArray(registerErrors) && registerErrors.map((error, i) => (
                        <div key={i} className="bg-red-50 text-red-500 p-3 rounded-2xl text-[10px] font-black uppercase mb-4 text-center">
                            {typeof error === 'string' ? error : error.message}
                        </div>
                    ))}

                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* Campos de texto (username, email, password, role) se mantienen igual */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Nombre Completo</label>
                            <input type="text" {...register("username", { required: true })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none" />
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Correo Institucional</label>
                            <input type="email" {...register("email", { required: true })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none" />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Contraseña</label>
                            <input type="password" {...register("password", { required: true })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none" />
                        </div>

                        {/* Rango */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Rango de Acceso</label>
                            <select {...register("role", { required: true })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black text-gray-700 uppercase outline-none cursor-pointer">
                                <option value="admin">Director (Área Específica)</option>
                                <option value="super-admin">Super Admin (Acceso Total)</option>
                            </select>
                        </div>

                        {/* 👇 CHECKBOXES DINÁMICOS CON IDs 👇 */}
                        <div className="bg-gray-50 p-5 rounded-2xl">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-3 block border-b border-gray-200 pb-2">
                                Áreas Asignadas
                            </label>
                            <div className="grid grid-cols-1 gap-3 mt-3">
                                {carreras.map((c) => (
                                    <label key={c._id} className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            value={c._id} // Ahora enviamos el ID de MongoDB
                                            {...register("carreras", { required: "Selecciona al menos un área" })}
                                            className="w-4 h-4 text-blue-900 rounded cursor-pointer"
                                        />
                                        <span className="text-[11px] font-bold text-gray-600 uppercase">
                                            {c.nombre} <span className="text-[9px] text-gray-400 font-normal">({c.clave})</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.carreras && <p className="text-red-500 text-[9px] font-black mt-3 uppercase">{errors.carreras.message}</p>}
                        </div>

                        <button type="submit" className="w-full bg-blue-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px]">
                            Dar de Alta Directivo
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}