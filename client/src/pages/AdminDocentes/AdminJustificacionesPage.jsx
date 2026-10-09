import React, { useEffect, useState } from "react";
import { useJustificaciones } from "../../context/JustificacionContext";
import MenuDocentes from '../../menu/MenuDocentes';

function AdminJustificacionesPage() {
    const { justificaciones, getTodasJustificaciones, updateEstadoJustificacion, loading } = useJustificaciones();
    
    const [selectedJustificacion, setSelectedJustificacion] = useState(null);
    const [comentarios, setComentarios] = useState("");
    const [nuevoEstado, setNuevoEstado] = useState("Aprobada");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isProd = import.meta.env?.PROD;
    const API_URL = import.meta.env?.VITE_API_URL 
        ? import.meta.env.VITE_API_URL 
        : (isProd ? "https://asiste-usag.com.mx/api" : "http://localhost:4000/api");

    useEffect(() => {
        getTodasJustificaciones();
    }, []);

    const handleOpenModal = (j) => {
        setSelectedJustificacion(j);
        setComentarios(j.comentariosDirectivo || "");
        setNuevoEstado(j.estado === 'Pendiente' ? 'Aprobada' : j.estado);
        setIsModalOpen(true);
    };

    const handleUpdateEstado = async (e) => {
        e.preventDefault();
        if (!selectedJustificacion) return;

        const success = await updateEstadoJustificacion(selectedJustificacion._id, {
            estado: nuevoEstado,
            comentariosDirectivo: comentarios
        });

        if (success) {
            setIsModalOpen(false);
            setSelectedJustificacion(null);
            getTodasJustificaciones(); 
        }
    };

    const getStatusBadge = (estado) => {
        switch (estado) {
            case 'Aprobada':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Aprobada</span>;
            case 'Rechazada':
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Rechazada</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pendiente</span>;
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <MenuDocentes />

            <div className="flex-1 p-8 md:p-12 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-200">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bandeja de Justificaciones</h1>
                        <p className="text-slate-500 text-sm mt-1">Revisa y gestiona las solicitudes de ausencia de los docentes asignados.</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/75">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Docente</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Ausencia</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Motivo y Descripción</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Evidencia</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-12 text-slate-400 font-medium">Cargando solicitudes...</td></tr>
                            ) : justificaciones.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-12 text-slate-400 font-medium">No hay solicitudes registradas en el sistema.</td></tr>
                            ) : (
                                justificaciones.map((j) => (
                                    <tr key={j._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                                            {j.docente?.nombre || 'Docente'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                                            {new Date(j.fechaAusencia).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="font-bold text-slate-800">{j.motivo}</div>
                                            <div className="text-slate-500 text-xs mt-0.5 truncate">{j.descripcion}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {j.evidencia ? (
                                                <a 
                                                    href={`${API_URL}/justificaciones/evidencia/${j.evidencia}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                                                >
                                                    📄 Ver archivo
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Sin archivo</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(j.estado)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button 
                                                onClick={() => handleOpenModal(j)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-sm shadow-blue-200 transition-all hover:scale-105"
                                            >
                                                Evaluar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && selectedJustificacion && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 transform transition-all">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 text-lg">Evaluar Justificación</h3>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none"
                                >
                                    &times;
                                </button>
                            </div>
                            
                            <form onSubmit={handleUpdateEstado} className="p-6 space-y-5">
                                <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                                    <div>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Docente</span>
                                        <p className="text-sm font-bold text-slate-800">{selectedJustificacion.docente?.nombre}</p>
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Motivo y Detalles</span>
                                        <p className="text-sm font-semibold text-slate-700">{selectedJustificacion.motivo}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{selectedJustificacion.descripcion}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Decisión</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                                        value={nuevoEstado}
                                        onChange={(e) => setNuevoEstado(e.target.value)}
                                    >
                                        <option value="Aprobada" className="text-emerald-700">Aprobar Solicitud</option>
                                        <option value="Rechazada" className="text-rose-700">Rechazar Solicitud</option>
                                        <option value="Pendiente" className="text-amber-700">Dejar Pendiente</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Comentarios / Observaciones</label>
                                    <textarea 
                                        rows="3"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-slate-800"
                                        placeholder="Escribe un comentario opcional para el docente..."
                                        value={comentarios}
                                        onChange={(e) => setComentarios(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition"
                                    >
                                        Guardar Resolución
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminJustificacionesPage;