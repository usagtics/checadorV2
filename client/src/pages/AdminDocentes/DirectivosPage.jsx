import React, { useEffect } from 'react';
import { useDirectivo } from '../../context/DirectivoContext';
import { Link } from 'react-router-dom';

import MenuDocentes from '../../menu/MenuDocentes';
export default function DirectivosPage() {
    const { 
        getDirectivos, 
        directivos, 
        deleteDirectivo, 
        updateDirectivoRole,
        loading 
    } = useDirectivo();

    useEffect(() => {
        if (getDirectivos) getDirectivos();
    }, []);

    const handleDelete = async (id, name) => {
        if (window.confirm(`¿Estás seguro de eliminar el acceso a ${name}?`)) {
            await deleteDirectivo(id);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        await updateDirectivoRole(id, newRole);
    };

    return (
        // ✅ ESTRUCTURA DE PANTALLA DIVIDIDA: flex, h-screen, overflow-hidden
        <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-900/10 overflow-hidden">
            
            {/* --- MENÚ LATERAL (Izquierda) --- */}
            <MenuDocentes />

            {/* --- CONTENIDO PRINCIPAL (Derecha con scroll propio) --- */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-6xl mx-auto">
                    
                    {/* --- ENCABEZADO --- */}
                    <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="h-8 w-1.5 bg-blue-900 rounded-full"></div>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                                    Gestión de <span className="text-blue-900">Directivos</span>
                                </h1>
                            </div>
                            <p className="text-gray-500 font-medium ml-4">Control de privilegios y accesos al sistema USAG.</p>
                        </div>

                        <Link 
                            to="/admin/directivos/nuevo" 
                            className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all flex items-center gap-3 transform active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Directivo
                        </Link>
                    </header>
                    
                    {/* --- TABLA --- */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
                        
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900 mb-4"></div>
                                <p className="text-gray-400 font-medium italic">Sincronizando con la base de datos...</p>
                            </div>
                        ) : !directivos || directivos.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No hay directivos registrados actualmente</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Directivo</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Carrera / Área</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-b border-gray-100">Nivel de Acceso</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right border-b border-gray-100">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {directivos.map((d, index) => (
                                            <tr key={`${d._id}-${index}`} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 bg-blue-100 text-blue-900 rounded-2xl flex items-center justify-center font-black text-sm uppercase shadow-sm border border-blue-200">
                                                            {(d.username ? d.username.charAt(0) : '?').toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm leading-tight">{d.username}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1 font-bold">{d.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-6">
                                                    <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tight border border-gray-200">
                                                        {d.carrera || 'No asignada'}
                                                    </span>
                                                </td>

                                                <td className="px-8 py-6 text-center">
                                                    <select 
                                                        value={d.role}
                                                        onChange={(e) => handleRoleChange(d._id, e.target.value)}
                                                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all outline-none ${
                                                            d.role === 'super-admin' 
                                                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                                                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                        }`}
                                                    >
                                                        <option value="admin">Director (Admin)</option>
                                                        <option value="super-admin">Super Admin</option>
                                                    </select>
                                                </td>

                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={() => handleDelete(d._id, d.username)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm ml-auto"
                                                        title="Eliminar Acceso"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}