import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import MenuDocentes from '../../menu/MenuDocentes'; // Ajusta la ruta de tu menú
import api from '../../api/axios'; // Ajusta la ruta de tu instancia de axios

export default function CarrerasPage() {
    const [carreras, setCarreras] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // Cargar el catálogo al entrar a la página
    const fetchCarreras = async () => {
        try {
            const res = await api.get('/carreras');
            setCarreras(res.data);
        } catch (error) {
            console.error("Error al cargar carreras:", error);
        }
    };

    useEffect(() => {
        fetchCarreras();
    }, []);

    // Función para guardar una nueva carrera
    const onSubmit = handleSubmit(async (values) => {
        try {
            setErrorMsg("");
            await api.post('/carreras', values);
            reset(); // Limpia el formulario
            fetchCarreras(); // Recarga la lista para que aparezca la nueva
        } catch (error) {
            setErrorMsg(error.response?.data?.message || "Error al guardar la carrera");
        }
    });

    return (
        <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-900/10 overflow-hidden">
            <MenuDocentes />
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Encabezado */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-blue-900 leading-tight">Planes de Estudio</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
                            Gestión del Catálogo Institucional
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* 1. FORMULARIO PARA AGREGAR NUEVA CARRERA */}
                        <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 h-fit">
                            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-6 border-b pb-4">
                                Nueva Carrera
                            </h2>
                            
                            {errorMsg && (
                                <div className="bg-red-50 text-red-500 p-3 rounded-xl text-[10px] font-black uppercase mb-4 text-center">
                                    {errorMsg}
                                </div>
                            )}

                            <form onSubmit={onSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Clave del Plan</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej. 06AUXENF"
                                        {...register("clave", { required: "La clave es obligatoria" })}
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all font-bold text-gray-700 outline-none uppercase"
                                    />
                                    {errors.clave && <p className="text-red-500 text-[9px] font-black ml-4 mt-1 uppercase">{errors.clave.message}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej. Auxiliar de Enfermería"
                                        {...register("nombre", { required: "El nombre es obligatorio" })}
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all font-bold text-gray-700 outline-none uppercase"
                                    />
                                    {errors.nombre && <p className="text-red-500 text-[9px] font-black ml-4 mt-1 uppercase">{errors.nombre.message}</p>}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-4 mb-1 block">Campus</label>
                                    <select 
                                        {...register("campus", { required: "Selecciona un campus" })}
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all font-bold text-gray-700 outline-none uppercase cursor-pointer"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Campus Centro">Campus Centro</option>
                                        <option value="Campus Veracruz">Campus Veracruz</option>
                                        <option value="Campus Cuba">Campus Cuba</option>
                                        <option value="Campus Centenario">Campus Centenario</option>
                                    </select>
                                    {errors.campus && <p className="text-red-500 text-[9px] font-black ml-4 mt-1 uppercase">{errors.campus.message}</p>}
                                </div>

                                <button type="submit" className="w-full bg-blue-900 text-white font-black py-4 mt-2 rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all uppercase tracking-widest text-[10px] transform active:scale-95">
                                    Registrar Plan
                                </button>
                            </form>
                        </div>

                        {/* 2. LISTA DE CARRERAS (CATÁLOGO) */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-6 border-b pb-4 flex justify-between items-center">
                                Catálogo Activo
                                <span className="bg-blue-50 text-blue-900 px-3 py-1 rounded-full text-[10px]">
                                    {carreras.length} Registros
                                </span>
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                            <th className="p-4">Clave</th>
                                            <th className="p-4">Nombre del Plan</th>
                                            <th className="p-4">Campus</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs font-bold text-gray-600">
                                        {carreras.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="p-8 text-center text-gray-400 font-normal">
                                                    No hay planes de estudio registrados. Usa el formulario para crear uno.
                                                </td>
                                            </tr>
                                        ) : (
                                            carreras.map((c) => (
                                                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                    <td className="p-4 text-blue-900 font-black">{c.clave}</td>
                                                    <td className="p-4 uppercase">{c.nombre}</td>
                                                    <td className="p-4">
                                                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-[10px]">
                                                            {c.campus}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}