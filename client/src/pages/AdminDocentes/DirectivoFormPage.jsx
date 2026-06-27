import React from 'react';
import { useForm } from "react-hook-form";
import { useDirectivo } from "../../context/DirectivoContext";
import { useNavigate, Link } from "react-router-dom";
import MenuDocentes from '../../menu/MenuDocentes';

export default function DirectivoFormPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signupDirectivo, errors: registerErrors } = useDirectivo();
    const navigate = useNavigate();

    // Lista de todas tus carreras disponibles
    const listaCarreras = [
        'Radiología', 'Fisioterapia', 'Nutrición', 
        'Administración', 'Odontología', 'Enfermería', 'General'
    ];

    const onSubmit = handleSubmit(async (values) => {
        try {
            // 'values.carreras' ya es un arreglo automático gracias a los checkboxes de react-hook-form
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
                        <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-blue-900 leading-tight">Registrar Directivo</h1>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">Acceso Administrativo USAG</p>
                    </div>

                    {Array.isArray(registerErrors) && registerErrors.length > 0 && registerErrors.map((error, i) => (
                        <div key={i} className="bg-red-50 text-red-500 p-3 rounded-2xl text-[10px] font-black uppercase mb-4 border border-red-100 text-center">
                            {typeof error === 'string' ? error : error.message || "Error en el servidor"}
                        </div>
                    ))}

                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* Usuario */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Nombre Completo</label>
                            <input 
                                type="text" 
                                {...register("username", { required: "El nombre es obligatorio" })}
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all font-bold text-gray-700 outline-none"
                            />
                            {errors.username && <p className="text-red-500 text-[9px] font-black ml-4 mt-1 uppercase">{errors.username.message}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Correo Institucional</label>
                            <input 
                                type="email" 
                                {...register("email", { required: "El correo es obligatorio" })}
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all font-bold text-gray-700 outline-none"
                            />
                            {errors.email && <p className="text-red-500 text-[9px] font-black ml-4 mt-1 uppercase">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Contraseña Temporal</label>
                            <input 
                                type="password" 
                                {...register("password", { required: "La contraseña es obligatoria", minLength: 6 })}
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all font-bold text-gray-700 outline-none"
                            />
                            {errors.password && <p className="text-red-500 text-[9px] font-black ml-4 mt-1 uppercase">Mínimo 6 caracteres</p>}
                        </div>

                        {/* Rango */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Rango de Acceso</label>
                            <select 
                                {...register("role", { required: true })}
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-[10px] font-black text-gray-700 uppercase focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                            >
                                <option value="admin">Director (Área Específica)</option>
                                <option value="super-admin">Super Admin (Acceso Total)</option>
                            </select>
                        </div>

                        {/* 👇 CHECKBOXES DE CARRERAS MÚLTIPLES 👇 */}
                        <div className="bg-gray-50 p-5 rounded-2xl">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-3 block border-b border-gray-200 pb-2">
                                Áreas Asignadas (Selecciona una o varias)
                            </label>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                {listaCarreras.map((carrera) => (
                                    <label key={carrera} className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            value={carrera}
                                            {...register("carreras", { required: "Selecciona al menos un área" })}
                                            className="w-4 h-4 text-blue-900 bg-white border-gray-300 rounded focus:ring-blue-900 cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-gray-600 group-hover:text-blue-900 transition-colors">
                                            {carrera}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.carreras && <p className="text-red-500 text-[9px] font-black mt-3 uppercase">{errors.carreras.message}</p>}
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <button type="submit" className="w-full bg-blue-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all uppercase tracking-widest text-[10px] transform active:scale-95">
                                Dar de Alta Directivo
                            </button>
                            <Link to="/admin/directivos" className="text-center text-[10px] font-black text-gray-400 uppercase hover:text-blue-900 transition-colors">
                                Cancelar y volver
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}