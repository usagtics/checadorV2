import React, { useState, useEffect } from 'react';
import { useDocentes } from '../../context/DocenteContext';
import { useAcademico } from '../../context/AcademicoContext';
import { useDirectivo } from '../../context/DirectivoContext';
// 1. IMPORTAMOS EL NUEVO CONTEXTO DE PERIODOS
import { usePeriodos } from '../../context/PeriodoContext'; 
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
        updateOfertaAcademica,
        deleteOfertaAcademica,
        errors: formErrors 
    } = useAcademico();

    // 2. EXTRAEMOS LOS PERIODOS DEL CONTEXTO
    const { periodos, getPeriodos } = usePeriodos();

    useEffect(() => {
        getDocentes();
        getMaterias();
        getGrupos();
        getPeriodos(); // 3. CARGAMOS LOS PERIODOS AL MONTAR EL COMPONENTE
    }, []);

    // 4. AÑADIMOS 'periodo' AL ESTADO INICIAL
    const [asignacion, setAsignacion] = useState({
        docente: docenteIdURL || '',
        materia: '',
        grupo: '',
        turno: 'Matutino',
        periodo: '' // Nuevo campo
    });

    const [horarios, setHorarios] = useState([
        { diaSemana: 'Lunes', horaInicio: '', horaFin: '' }
    ]);

    const [loading, setLoading] = useState(false);
    const [exitoMsg, setExitoMsg] = useState('');
    const [editandoId, setEditandoId] = useState(null);

    useEffect(() => {
        if (docenteIdURL && docentes.length > 0 && !editandoId) {
            setAsignacion(prev => ({ ...prev, docente: docenteIdURL }));
        }
    }, [docenteIdURL, docentes, editandoId]);

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

    const handleCargarEdicion = (oferta) => {
        setEditandoId(oferta._id);
        setAsignacion({
            docente: oferta.docente?._id || oferta.docente || asignacion.docente,
            materia: oferta.materia?._id || oferta.materia || '',
            grupo: oferta.grupo?._id || oferta.grupo || '',
            turno: oferta.turno || 'Matutino',
            periodo: oferta.periodo?._id || oferta.periodo || '' // 5. CARGAMOS EL PERIODO SI EXISTE
        });

        if (oferta.horarios && oferta.horarios.length > 0) {
            const horariosFormateados = oferta.horarios.map(h => ({
                diaSemana: h.dia || h.diaSemana || 'Lunes',
                horaInicio: h.horaInicio || '',
                horaFin: h.horaFin || ''
            }));
            setHorarios(horariosFormateados);
        } else {
            setHorarios([{ diaSemana: 'Lunes', horaInicio: '', horaFin: '' }]);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelarEdicion = () => {
        setEditandoId(null);
        setAsignacion(prev => ({ ...prev, materia: '', grupo: '', turno: 'Matutino', periodo: '' }));
        setHorarios([{ diaSemana: 'Lunes', horaInicio: '', horaFin: '' }]);
    };

    const handleEliminar = async (ofertaId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta clase asignada?")) {
            try {
                if(deleteOfertaAcademica) {
                    await deleteOfertaAcademica(ofertaId);
                    await getDocentes();
                }
            } catch (error) {
                console.error("Error al eliminar", error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setExitoMsg('');
        
        try {
            const payloadFinal = { ...asignacion, horarios };
            
            if (editandoId) {
                if(updateOfertaAcademica) {
                    await updateOfertaAcademica(editandoId, payloadFinal);
                    setExitoMsg('Asignación actualizada correctamente.');
                }
            } else {
                await createOfertaAcademica(payloadFinal);
                setExitoMsg('Asignación guardada correctamente.');
            }
            
            await getDocentes(); 
            handleCancelarEdicion();
            
            setTimeout(() => setExitoMsg(''), 3000);
        } catch (error) {
            console.error("Error al guardar asignación:", error);
        } finally {
            setLoading(false);
        }
    };

    const docenteSeleccionado = docentes.find(d => d._id === asignacion.docente);

    return (
        <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-900/10 overflow-hidden">
            
            <MenuDocentes />

            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-6xl mx-auto space-y-10">
                    
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="h-8 w-1.5 bg-blue-900 rounded-full"></div>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Asignación Académica</h1>
                            </div>
                            <p className="text-gray-500 font-medium ml-4">
                                {editandoId ? (
                                    <span className="text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">✏️ Modo Edición Activo</span>
                                ) : (
                                    <>Carga académica para la carrera de <span className="font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{user?.carrera || 'General'}</span></>
                                )}
                            </p>
                        </div>
                    </header>

                    <div className={`bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border transition-all ${editandoId ? 'border-amber-300 shadow-amber-100/50' : 'border-gray-100 shadow-gray-200/60'}`}>
                        
                        {exitoMsg && (
                            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-black flex items-center gap-3 animate-bounce">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">✓</div>
                                {exitoMsg}
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
                            
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className={`w-6 h-6 text-white rounded-lg flex items-center justify-center text-[10px] font-black ${editandoId ? 'bg-amber-500' : 'bg-blue-900'}`}>01</span>
                                    <h2 className={`${editandoId ? 'text-amber-600' : 'text-blue-900'} font-black uppercase tracking-widest text-xs`}>Detalles de la Carga</h2>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Docente</label>
                                        <select name="docente" value={asignacion.docente} onChange={handleChange} required disabled={editandoId} className={`w-full border rounded-2xl px-5 py-4 text-gray-900 outline-none transition-all font-bold appearance-none ${editandoId ? 'bg-gray-100 border-gray-200 opacity-70 cursor-not-allowed' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 cursor-pointer'}`}>
                                            <option value="">Seleccione...</option>
                                            {docentes && docentes.map((d) => (
                                                <option key={d._id} value={d._id}>{d.nombre} {d.apellidos}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Materia</label>
                                        <select name="materia" value={asignacion.materia} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all cursor-pointer font-bold appearance-none">
                                            <option value="">Seleccione...</option>
                                            {materias && materias.map((m) => (
                                                <option key={m._id} value={m._id}>{m.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Grupo</label>
                                        <select name="grupo" value={asignacion.grupo} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all cursor-pointer font-bold appearance-none">
                                            <option value="">Seleccione...</option>
                                            {grupos && grupos.map((g) => (
                                                <option key={g._id} value={g._id}>{g.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-emerald-600 uppercase tracking-widest ml-1">Turno</label>
                                        <select name="turno" value={asignacion.turno} onChange={handleChange} required className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 text-emerald-900 font-black focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none transition-all cursor-pointer appearance-none shadow-sm">
                                            <option value="Matutino">Matutino</option>
                                            <option value="Sabatino">Sabatino</option>
                                            <option value="Virtual">Virtual</option>
                                            <option value="Dominical">Dominical</option>
                                        </select>
                                    </div>

                                    {/* 6. NUEVO CAMPO: SELECTOR DE PERIODO */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-purple-600 uppercase tracking-widest ml-1">Periodo</label>
                                        <select 
                                            name="periodo" 
                                            value={asignacion.periodo} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4 text-purple-900 font-black focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all cursor-pointer appearance-none shadow-sm"
                                        >
                                            <option value="">Seleccione...</option>
                                            {periodos && periodos.map((p) => (
                                                <option key={p._id} value={p._id}>
                                                    {p.nombre} {p.activo ? '⭐ (Activo)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-6 h-6 text-white rounded-lg flex items-center justify-center text-[10px] font-black ${editandoId ? 'bg-amber-500' : 'bg-blue-900'}`}>02</span>
                                        <h2 className={`${editandoId ? 'text-amber-600' : 'text-blue-900'} font-black uppercase tracking-widest text-xs`}>Horario Semanal</h2>
                                    </div>
                                    <button type="button" onClick={agregarHorario} className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-black uppercase tracking-widest transition-all shadow-sm">
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

                            <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-end gap-4">
                                {editandoId && (
                                    <button type="button" onClick={handleCancelarEdicion} className="px-8 py-5 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-all">
                                        CANCELAR
                                    </button>
                                )}
                                <button type="submit" disabled={loading} className={`min-w-[300px] ${editandoId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-900 hover:bg-blue-950 shadow-blue-900/20'} text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl flex justify-center items-center transform active:scale-95 ${loading ? 'opacity-70' : ''}`}>
                                    {loading ? 'GUARDANDO...' : (editandoId ? 'ACTUALIZAR ASIGNACIÓN' : 'GUARDAR ASIGNACIÓN')}
                                </button>
                            </div>
                        </form>
                    </div>

                    {docenteSeleccionado && (
                        <div className="bg-indigo-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-indigo-800 text-white animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight mb-1">Carga Actual del Docente</h3>
                                    <p className="text-indigo-200 font-medium text-sm">
                                        Revisa el horario existente de <span className="font-bold text-white">{docenteSeleccionado.nombre} {docenteSeleccionado.apellidos}</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-indigo-950/50 rounded-3xl overflow-hidden border border-indigo-800/50">
                                <div className="overflow-x-auto max-h-[400px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-indigo-950 border-b border-indigo-800 sticky top-0">
                                                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-black">Materia / Grupo</th>
                                                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-black">Horario / Periodo</th>
                                                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-black text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-indigo-800/50">
                                            {docenteSeleccionado.ofertaAcademica && docenteSeleccionado.ofertaAcademica.length > 0 ? (
                                                docenteSeleccionado.ofertaAcademica.map((oferta, idx) => (
                                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-5">
                                                            <span className="font-bold block leading-tight text-base text-white">
                                                                {oferta.materia?.nombre || 'Materia sin nombre'}
                                                            </span>
                                                            <div className="flex gap-2 mt-2">
                                                                <span className="bg-indigo-800/60 text-indigo-200 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                                                                    Grupo: {oferta.grupo?.nombre || 'General'}
                                                                </span>
                                                                <span className="bg-emerald-900/40 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                                                                    {oferta.turno || 'Matutino'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="px-6 py-5">
                                                            <div className="space-y-1">
                                                                {/* MOSTRAMOS EL PERIODO DE ESTA CLASE */}
                                                                {oferta.periodo && (
                                                                    <div className="mb-2">
                                                                        <span className="bg-purple-900/40 text-purple-300 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                                                                            Periodo: {oferta.periodo?.nombre || 'Sin definir'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {oferta.horarios && oferta.horarios.map((h, hIdx) => (
                                                                    <div key={hIdx} className="flex gap-3 text-sm">
                                                                        <span className="font-bold text-indigo-200 w-20 capitalize">{h.dia || h.diaSemana}:</span>
                                                                        <span className="font-black text-emerald-400">{h.horaInicio} - {h.horaFin}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-5">
                                                            <div className="flex justify-center gap-2">
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => handleCargarEdicion(oferta)}
                                                                    className="p-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white rounded-xl transition-all"
                                                                    title="Editar Asignación"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                                </button>
                                                                
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => handleEliminar(oferta._id)}
                                                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                                    title="Eliminar Asignación"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-12 text-center text-indigo-300/50 font-bold text-sm">
                                                        Este docente aún no tiene materias asignadas. ¡Tiene disponibilidad total!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}