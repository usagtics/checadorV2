import React, { useState, useEffect } from 'react';
import { useDocentes } from '../../context/DocenteContext';
import { useAcademico } from '../../context/AcademicoContext';
import { useDirectivo } from '../../context/DirectivoContext';
import { useSearchParams } from 'react-router-dom';

import MenuDocentes from '../../menu/MenuDocentes';

export default function AsignacionAcademicaPage() {
    const [searchParams] = useSearchParams();
    const docenteIdURL = searchParams.get("docente");
    const { user } = useDirectivo();

    const { docentes, getDocentes } = useDocentes();
    const { 
        materias, 
        grupos, 
        getMaterias, 
        getGrupos, 
        createOfertaAcademica, 
        errors: formErrors 
    } = useAcademico();

    useEffect(() => {
        getDocentes();
        getMaterias();
        getGrupos();
    }, []);

    const [asignacion, setAsignacion] = useState({
        docente: docenteIdURL || '',
        materia: '',
        grupo: '',
        turno: 'Matutino'
    });

    const [horarios, setHorarios] = useState([
        { diaSemana: 'Lunes', horaInicio: '', horaFin: '' }
    ]);

    const [loading, setLoading] = useState(false);
    const [exitoMsg, setExitoMsg] = useState(false);

    useEffect(() => {
        if (docenteIdURL && docentes.length > 0) {
            setAsignacion(prev => ({ ...prev, docente: docenteIdURL }));
        }
    }, [docenteIdURL, docentes]);

    const handleChange = (e) => {
        setAsignacion({ ...asignacion, [e.target.name]: e.target.value });
    };

    const handleHorarioChange = (index, campo, valor) => {
        const nuevosHorarios = [...horarios];
        nuevosHorarios[index] = { ...nuevosHorarios[index], [campo]: valor };
        setHorarios(nuevosHorarios);
    };

    const agregarHorario = () => {
        setHorarios([...horarios, { diaSemana: 'Lunes', horaInicio: '', horaFin: '' }]);
    };

    const eliminarHorario = (index) => {
        setHorarios(horarios.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setExitoMsg(false);
        
        try {
            const payloadFinal = {
                ...asignacion,
                horarios
            };
            await createOfertaAcademica(payloadFinal);
            setExitoMsg(true);
            
            setAsignacion({ docente: '', materia: '', grupo: '', turno: 'Matutino' });
            setHorarios([{ diaSemana: 'Lunes', horaInicio: '', horaFin: '' }]);
            
            setTimeout(() => setExitoMsg(false), 3000);
        } catch (error) {
            console.error("Error al guardar asignación:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        // ✅ ESTRUCTURA DE PANTALLA DIVIDIDA: flex, h-screen, overflow-hidden
        <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-900/10 overflow-hidden">
            
            {/* --- MENÚ LATERAL --- */}
            <MenuDocentes />

            {/* --- CONTENIDO PRINCIPAL (Derecha con scroll propio) --- */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-6xl mx-auto">
                    
                    {/* --- ENCABEZADO --- */}
                    <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="h-8 w-1.5 bg-blue-900 rounded-full"></div>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Asignación Académica</h1>
                            </div>
                            <p className="text-gray-500 font-medium ml-4">
                                Carga académica para la carrera de <span className="font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{user?.carrera || 'Radiología'}</span>
                            </p>
                        </div>
                    </header>

                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/60 border border-gray-100 mb-10">
                        
                        {/* Alertas */}
                        {exitoMsg && (
                            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-black flex items-center gap-3 animate-bounce">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">✓</div>
                                Asignación guardada correctamente en el sistema.
                            </div>
                        )}

                        {formErrors && formErrors.length > 0 && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold">
                                {formErrors.map((err, i) => (
                                    <p key={i} className="flex items-center gap-2">⚠️ {err}</p>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-10">
                            
                            {/* SECCIÓN 1: DATOS PRINCIPALES */}
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="w-6 h-6 bg-blue-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">01</span>
                                    <h2 className="text-blue-900 font-black uppercase tracking-widest text-xs">Detalles de la Carga</h2>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Docente</label>
                                        <select name="docente" value={asignacion.docente} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all cursor-pointer font-bold appearance-none">
                                            <option value="">Seleccione un docente...</option>
                                            {docentes && docentes.map((d) => (
                                                <option key={d._id} value={d._id}>{d.nombre} {d.apellidos}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Materia</label>
                                        <select name="materia" value={asignacion.materia} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all cursor-pointer font-bold appearance-none">
                                            <option value="">Seleccione una materia...</option>
                                            {materias && materias.map((m) => (
                                                <option key={m._id} value={m._id}>{m.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Grupo</label>
                                        <select name="grupo" value={asignacion.grupo} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all cursor-pointer font-bold appearance-none">
                                            <option value="">Seleccione un grupo...</option>
                                            {grupos && grupos.map((g) => (
                                                <option key={g._id} value={g._id}>{g.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-emerald-600 uppercase tracking-widest ml-1">Turno de Pago</label>
                                        <select 
                                            name="turno" 
                                            value={asignacion.turno} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 text-emerald-900 font-black focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none transition-all cursor-pointer appearance-none shadow-sm"
                                        >
                                            <option value="Matutino">Matutino</option>
                                            <option value="Sabatino">Sabatino</option>
                                            <option value="Virtual">Virtual</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* SECCIÓN 2: HORARIOS DINÁMICOS */}
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">02</span>
                                        <h2 className="text-blue-900 font-black uppercase tracking-widest text-xs">Horario Semanal</h2>
                                    </div>
                                    <button type="button" onClick={agregarHorario} className="text-[10px] bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest transition-all shadow-md shadow-blue-900/10">
                                        + Agregar Día
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    {horarios.map((horario, index) => (
                                        <div key={index} className="group flex flex-col md:flex-row gap-6 items-end bg-gray-50 p-6 rounded-[2rem] border border-gray-100 transition-all hover:bg-white hover:shadow-lg hover:border-blue-100">
                                            <div className="flex-1 w-full space-y-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Día</label>
                                                <select 
                                                    value={horario.diaSemana} 
                                                    onChange={(e) => handleHorarioChange(index, 'diaSemana', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none"
                                                >
                                                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => (
                                                        <option key={dia} value={dia}>{dia}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex-1 w-full space-y-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Inicio</label>
                                                <input 
                                                    type="time" 
                                                    value={horario.horaInicio} 
                                                    onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)}
                                                    required
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none"
                                                />
                                            </div>
                                            <div className="flex-1 w-full space-y-2">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fin</label>
                                                <input 
                                                    type="time" 
                                                    value={horario.horaFin} 
                                                    onChange={(e) => handleHorarioChange(index, 'horaFin', e.target.value)}
                                                    required
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none"
                                                />
                                            </div>
                                            {horarios.length > 1 && (
                                                <button type="button" onClick={() => eliminarHorario(index)} className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="pt-10 border-t border-gray-50 flex justify-end">
                                <button type="submit" disabled={loading} className={`min-w-[300px] bg-blue-900 hover:bg-blue-950 text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl shadow-blue-900/20 flex justify-center items-center transform active:scale-95 ${loading ? 'opacity-70' : ''}`}>
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            GUARDANDO...
                                        </div>
                                    ) : 'GUARDAR ASIGNACIÓN'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}