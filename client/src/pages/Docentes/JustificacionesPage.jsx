import React, { useEffect, useState } from "react";
import { useJustificaciones } from "../../context/JustificacionContext";
import { 
    HiOutlineDocumentAdd, 
    HiOutlineDocumentText, 
    HiOutlineCheckCircle, 
    HiOutlineXCircle, 
    HiOutlineClock 
} from "react-icons/hi";

function JustificacionesPage() {
    const { justificaciones, getMisJustificaciones, createJustificacion, loading } = useJustificaciones();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [fechaAusencia, setFechaAusencia] = useState("");
    const [motivo, setMotivo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [evidencia, setEvidencia] = useState(null);

    const isProd = import.meta.env?.PROD;
    const API_URL = import.meta.env?.VITE_API_URL 
        ? import.meta.env.VITE_API_URL 
        : (isProd ? "https://asiste-usag.com.mx/api" : "http://localhost:4000/api");

    useEffect(() => {
        getMisJustificaciones();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("fechaAusencia", fechaAusencia);
        formData.append("motivo", motivo);
        formData.append("descripcion", descripcion);
        if (evidencia) {
            formData.append("evidencia", evidencia); 
        }

        const success = await createJustificacion(formData);
        if (success) {
            setIsModalOpen(false);
            setFechaAusencia("");
            setMotivo("");
            setDescripcion("");
            setEvidencia(null);
        }
    };

    const getStatusBadge = (estado) => {
        switch (estado) {
            case 'Aprobada':
                return (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                        <HiOutlineCheckCircle className="text-sm"/> Aprobada
                    </span>
                );
            case 'Rechazada':
                return (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-200">
                        <HiOutlineXCircle className="text-sm"/> Rechazada
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                        <HiOutlineClock className="text-sm"/> Pendiente
                    </span>
                );
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-blue-900 tracking-tight">Mis Justificaciones</h1>
                    <p className="text-gray-500 mt-1 text-sm">Historial de solicitudes e incidencias registradas.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5"
                >
                    <HiOutlineDocumentAdd className="text-xl"/>
                    Nueva Solicitud
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha de Ausencia</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Motivo y Detalles</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Comentarios del Directivo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                                            <p className="text-sm font-medium">Cargando historial...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : justificaciones.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <HiOutlineDocumentText className="text-5xl mb-3 text-gray-300"/>
                                            <p className="text-base font-medium text-gray-600">No hay justificaciones registradas</p>
                                            <p className="text-sm mt-1">Tus solicitudes aparecerán en este panel.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                justificaciones.map((j) => (
                                    <tr key={j._id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {new Date(j.fechaAusencia).toLocaleDateString('es-MX', { 
                                                    timeZone: 'UTC',
                                                    weekday: 'long', 
                                                    day: 'numeric', 
                                                    month: 'long', 
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded w-fit">
                                                    {j.motivo}
                                                </span>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2" title={j.descripcion}>
                                                    {j.descripcion}
                                                </p>
                                                
                                                {j.evidencia && (
                                                    <a 
                                                        href={`${API_URL}/justificaciones/evidencia/${j.evidencia}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium mt-2 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors w-fit"
                                                    >
                                                        <HiOutlineDocumentText className="text-sm"/> 
                                                        Ver Documento Adjunto
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            {getStatusBadge(j.estado)}
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className={`text-sm ${j.comentariosDirectivo ? 'text-gray-700 italic' : 'text-gray-400'}`}>
                                                {j.comentariosDirectivo ? `"${j.comentariosDirectivo}"` : 'Sin comentarios'}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <HiOutlineDocumentAdd className="text-2xl opacity-80"/>
                                Registrar Nueva Justificación
                            </h2>
                        </div>
                        
                        {/* Cuerpo del Modal */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de la Ausencia *</label>
                                <input 
                                    type="date" 
                                    required 
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-colors"
                                    value={fechaAusencia}
                                    onChange={(e) => setFechaAusencia(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Motivo Principal *</label>
                                <select 
                                    required 
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-colors"
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                >
                                    <option value="" disabled>Selecciona una opción...</option>
                                    <option value="Salud">🏥 Motivos de Salud (Requiere receta)</option>
                                    <option value="Trámite Administrativo">📄 Trámite Administrativo</option>
                                    <option value="Asunto Personal">👤 Asunto Personal</option>
                                    <option value="Falla Técnica">💻 Falla Técnica / Conectividad</option>
                                    <option value="Otro">📌 Otro Motivo</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción Detallada *</label>
                                <textarea 
                                    required 
                                    rows="3"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 transition-colors resize-none"
                                    placeholder="Proporciona detalles sobre la incidencia..."
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Documento Probatorio (Opcional)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <HiOutlineDocumentText className="mx-auto h-12 w-12 text-gray-400"/>
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Sube un archivo</span>
                                                <input 
                                                    type="file" 
                                                    accept="image/*,.pdf"
                                                    className="sr-only"
                                                    onChange={(e) => setEvidencia(e.target.files[0])}
                                                />
                                            </label>
                                            <p className="pl-1">o arrástralo aquí</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, PDF (Max 5MB)</p>
                                        {evidencia && (
                                            <p className="text-sm font-semibold text-green-600 mt-2">
                                                 Archivo seleccionado: {evidencia.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer del Modal */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5"
                                >
                                    Enviar Solicitud
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JustificacionesPage;