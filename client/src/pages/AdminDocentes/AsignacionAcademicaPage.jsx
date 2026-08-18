import React, { useState, useEffect, useRef } from 'react';
import { useDocentes } from '../../context/DocenteContext';
import { useAcademico } from '../../context/AcademicoContext';
import { useDirectivo } from '../../context/DirectivoContext';
import { usePeriodos } from '../../context/PeriodoContext'; 
import { useSearchParams } from 'react-router-dom';
import MenuDocentes from '../../menu/MenuDocentes';

const SearchableSelect = ({ options, value, onChange, name, disabled, placeholder, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const selectedOption = options.find((opt) => opt.value === value);
    const filteredOptions = options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div
                className={`w-full border-2 rounded-2xl px-4 py-3.5 text-gray-900 outline-none transition-all font-bold flex gap-3 items-center ${
                    disabled
                        ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                        : "bg-white border-gray-100 hover:border-blue-200 cursor-pointer focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-600"
                }`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className="text-gray-400">{icon}</span>
                <span className={`flex-1 truncate ${selectedOption ? "text-gray-900" : "text-gray-400 font-medium"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                        <input
                            type="text"
                            className="w-full bg-gray-50/50 border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-50 transition-all placeholder:font-medium"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <ul className="max-h-52 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <li
                                    key={opt.value}
                                    className={`px-4 py-2.5 text-sm font-bold rounded-xl cursor-pointer transition-all mx-1 my-0.5 ${
                                        value === opt.value
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                    onClick={() => {
                                        onChange({ target: { name, value: opt.value } });
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                >
                                    {opt.label}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-4 text-sm font-bold text-gray-400 text-center flex flex-col items-center gap-2">
                                <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Sin resultados
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default function AsignacionAcademicaPage() {
    const [searchParams] = useSearchParams();
    const docenteIdURL = searchParams.get("docente");
    const { user } = useDirectivo();

    const { docentes, getDocentes } = useDocentes();
    const { materias, grupos, getMaterias, getGrupos, createOfertaAcademica, updateOfertaAcademica, deleteOfertaAcademica, errors: formErrors } = useAcademico();
    const { periodos, getPeriodos } = usePeriodos();

    useEffect(() => {
        getDocentes();
        getMaterias();
        getGrupos();
        getPeriodos(); 
    }, []);

    const [asignacion, setAsignacion] = useState({
        docente: docenteIdURL || '',
        materia: '',
        grupo: '',
        turno: 'Matutino',
        periodo: '' 
    });

    const [horarios, setHorarios] = useState([{ diaSemana: 'Lunes', horaInicio: '', horaFin: '' }]);
    const [loading, setLoading] = useState(false);
    const [exitoMsg, setExitoMsg] = useState('');
    const [editandoId, setEditandoId] = useState(null);

    useEffect(() => {
        if (docenteIdURL && docentes.length > 0 && !editandoId) {
            setAsignacion(prev => ({ ...prev, docente: docenteIdURL }));
        }
    }, [docenteIdURL, docentes, editandoId]);

    const handleChange = (e) => setAsignacion({ ...asignacion, [e.target.name]: e.target.value });

    const handleHorarioChange = (index, campo, valor) => {
        const nuevosHorarios = [...horarios];
        nuevosHorarios[index] = { ...nuevosHorarios[index], [campo]: valor };
        setHorarios(nuevosHorarios);
    };

    const agregarHorario = () => setHorarios([...horarios, { diaSemana: 'Lunes', horaInicio: '', horaFin: '' }]);
    const eliminarHorario = (index) => setHorarios(horarios.filter((_, i) => i !== index));

    const handleCargarEdicion = (oferta) => {
        setEditandoId(oferta._id);
        setAsignacion({
            docente: oferta.docente?._id || oferta.docente || asignacion.docente,
            materia: oferta.materia?._id || oferta.materia || '',
            grupo: oferta.grupo?._id || oferta.grupo || '',
            turno: oferta.turno || 'Matutino',
            periodo: oferta.periodo?._id || oferta.periodo || '' 
        });

        if (oferta.horarios?.length > 0) {
            setHorarios(oferta.horarios.map(h => ({ diaSemana: h.dia || h.diaSemana || 'Lunes', horaInicio: h.horaInicio || '', horaFin: h.horaFin || '' })));
        } else {
            setHorarios([{ diaSemana: 'Lunes', horaInicio: '', horaFin: '' }]);
        }
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
            } catch (error) {}
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
        } finally {
            setLoading(false);
        }
    };

    // FUNCIÓN NUEVA: Calcula las horas totales
    const calcularHorasTotales = (ofertas) => {
        if (!ofertas || ofertas.length === 0) return 0;
        let totalMinutos = 0;

        ofertas.forEach(oferta => {
            if (oferta.horarios && oferta.horarios.length > 0) {
                oferta.horarios.forEach(h => {
                    if (h.horaInicio && h.horaFin) {
                        const [hIni, mIni] = h.horaInicio.split(':').map(Number);
                        const [hFin, mFin] = h.horaFin.split(':').map(Number);
                        const inicioMinutos = (hIni * 60) + mIni;
                        const finMinutos = (hFin * 60) + mFin;
                        totalMinutos += (finMinutos - inicioMinutos);
                    }
                });
            }
        });

        // Convierte a horas y deja 1 o 0 decimales según corresponda
        return (totalMinutos / 60).toFixed(1).replace('.0', ''); 
    };

    const docenteSeleccionado = docentes.find(d => d._id === asignacion.docente);
    const horasAsignadasSemanales = calcularHorasTotales(docenteSeleccionado?.ofertaAcademica);

    const docentesOptions = docentes.map(d => ({ value: d._id, label: `${d.nombre} ${d.apellidos}` }));
    const materiasOptions = materias.map(m => ({ value: m._id, label: m.nombre }));
    const gruposOptions = grupos.map(g => ({ value: g._id, label: g.nombre }));

    return (
        <div className="flex h-screen bg-[#F4F7FE] font-sans overflow-hidden selection:bg-blue-900/10">
            <MenuDocentes />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
           
                <header className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            Asignación de Carga Académica
                        </h1>
                        <p className="text-gray-500 font-medium text-sm mt-1 ml-5 flex items-center gap-2">
                        </p>
                    </div>
                    {editandoId && (
                        <div className="animate-pulse bg-amber-50 border border-amber-200 text-amber-600 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Modo Edición
                        </div>
                    )}
                </header>

                <div className="flex-1 overflow-hidden p-6 flex flex-col lg:flex-row gap-6">
                    
                    {/* PANEL IZQUIERDO: FORMULARIO */}
                    <div className="w-full lg:w-[450px] xl:w-[500px] flex flex-col h-full bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden shrink-0">
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            
                            {exitoMsg && (
                                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-black flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">✓</div>
                                    {exitoMsg}
                                </div>
                            )}

                            {formErrors && formErrors.length > 0 && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold">
                                    {formErrors.map((err, i) => <p key={i} className="flex items-center gap-2">⚠️ {err}</p>)}
                                </div>
                            )}

                            <form id="asignacion-form" onSubmit={handleSubmit} className="space-y-8">
                                
                                {/* SECCIÓN 1: DATOS GENERALES */}
                                <div className="space-y-5">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-5 h-px bg-gray-200"></span> Datos Principales
                                    </h3>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest pl-1">Docente</label>
                                        <SearchableSelect 
                                            options={docentesOptions} value={asignacion.docente} onChange={handleChange} name="docente" disabled={editandoId !== null} placeholder="Selecciona un docente"
                                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest pl-1">Materia</label>
                                        <SearchableSelect 
                                            options={materiasOptions} value={asignacion.materia} onChange={handleChange} name="materia" placeholder="Busca la materia"
                                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-gray-600 uppercase tracking-widest pl-1">Grupo</label>
                                            <SearchableSelect 
                                                options={gruposOptions} value={asignacion.grupo} onChange={handleChange} name="grupo" placeholder="Ej: A"
                                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-gray-600 uppercase tracking-widest pl-1">Turno</label>
                                            <select name="turno" value={asignacion.turno} onChange={handleChange} required className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none cursor-pointer">
                                                <option value="Matutino">Matutino</option>
                                                <option value="Sabatino">Sabatino</option>
                                                <option value="Virtual">Virtual</option>
                                                <option value="Dominical">Dominical</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest pl-1">Periodo</label>
                                        <select name="periodo" value={asignacion.periodo} onChange={handleChange} required className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none cursor-pointer">
                                            <option value="">Selecciona el periodo...</option>
                                            {periodos && periodos.map((p) => (
                                                <option key={p._id} value={p._id}>{p.nombre} {p.activo ? '⭐' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* SECCIÓN 2: HORARIOS */}
                                <div className="space-y-5 pt-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-5 h-px bg-gray-200"></span> Horario Semanal
                                        </h3>
                                        <button type="button" onClick={agregarHorario} className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest transition-colors">
                                            + Día
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {horarios.map((horario, index) => (
                                            <div key={index} className="flex flex-col gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 relative group">
                                                {horarios.length > 1 && (
                                                    <button type="button" onClick={() => eliminarHorario(index)} className="absolute -top-2 -right-2 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full p-1.5 shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                )}
                                                <select value={horario.diaSemana} onChange={(e) => handleHorarioChange(index, 'diaSemana', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none appearance-none">
                                                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => <option key={dia} value={dia}>{dia}</option>)}
                                                </select>
                                                <div className="flex gap-3">
                                                    <input type="time" value={horario.horaInicio} onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)} required className="w-1/2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-center" />
                                                    <div className="flex items-center text-gray-300 font-black">-</div>
                                                    <input type="time" value={horario.horaFin} onChange={(e) => handleHorarioChange(index, 'horaFin', e.target.value)} required className="w-1/2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-center" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        {/* FOOTER DEL FORMULARIO (FIJO) */}
                        <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-3">
                            <button type="submit" form="asignacion-form" disabled={loading || !asignacion.docente || !asignacion.materia || !asignacion.grupo} className={`w-full ${editandoId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-900 hover:bg-blue-950 shadow-blue-900/20'} text-white font-black py-4 rounded-xl transition-all shadow-lg flex justify-center items-center active:scale-[0.98] ${loading || !asignacion.docente || !asignacion.materia || !asignacion.grupo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {loading ? 'PROCESANDO...' : (editandoId ? 'ACTUALIZAR CARGA' : 'ASIGNAR MATERIA')}
                            </button>
                            {editandoId && (
                                <button type="button" onClick={handleCancelarEdicion} className="w-full py-3 text-gray-500 font-bold text-sm hover:text-gray-800 transition-colors">
                                    Cancelar Edición
                                </button>
                            )}
                        </div>
                    </div>

                    {/* PANEL DERECHO: VISOR DEL DOCENTE */}
                    <div className="flex-1 bg-blue-950 rounded-[2rem] shadow-xl border border-blue-900 flex flex-col overflow-hidden relative">
                        {/* Patrón de fondo */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#60a5fa 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        
                        {!docenteSeleccionado ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 z-10">
                                <div className="w-20 h-20 bg-blue-900 rounded-3xl flex items-center justify-center mb-6 border border-blue-800">
                                    <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Agenda del Docente</h3>
                                <p className="text-blue-200 font-medium max-w-sm">Selecciona un docente en el panel izquierdo para visualizar su carga académica actual y evitar empalmes de horario.</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col z-10 overflow-hidden">
                                <div className="p-8 pb-6 border-b border-blue-900 bg-blue-950/80 backdrop-blur-sm">
                                    <h3 className="text-2xl font-black tracking-tight text-white mb-1">
                                        {docenteSeleccionado.nombre} {docenteSeleccionado.apellidos}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                        <span className="bg-blue-900 text-blue-100 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-800">
                                            Matrícula: {docenteSeleccionado.numeroEmpleado || 'N/A'}
                                        </span>
                                        <span className="bg-blue-900/50 text-blue-400 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-blue-800">
                                            {docenteSeleccionado.ofertaAcademica?.length || 0} Clases
                                        </span>
                                        {/* 👇 ETIQUETA INYECTADA PARA HORAS TOTALES 👇 */}
                                        <span className="bg-emerald-900/60 text-emerald-400 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-emerald-800/50 flex items-center gap-1.5 shadow-sm shadow-emerald-900/20">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            {horasAsignadasSemanales} Horas semanales
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                    {docenteSeleccionado.ofertaAcademica && docenteSeleccionado.ofertaAcademica.length > 0 ? (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                            {docenteSeleccionado.ofertaAcademica.map((oferta, idx) => (
                                                <div key={idx} className="bg-blue-900/40 border border-blue-800 rounded-2xl p-5 hover:bg-blue-900/60 transition-all group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-white leading-tight mb-2 pr-4">{oferta.materia?.nombre || 'Materia sin nombre'}</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className="bg-blue-800 text-blue-200 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-blue-700">Grupo {oferta.grupo?.nombre || 'N/A'}</span>
                                                                <span className="bg-emerald-900/60 text-emerald-300 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-emerald-800/50">{oferta.turno || 'Matutino'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleCargarEdicion(oferta)} className="p-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                                                            <button onClick={() => handleEliminar(oferta._id)} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                                        </div>
                                                    </div>
                                                    <div className="bg-blue-950 rounded-xl p-3 space-y-2 border border-blue-900">
                                                        {oferta.horarios?.map((h, hIdx) => (
                                                            <div key={hIdx} className="flex justify-between items-center text-xs">
                                                                <span className="font-bold text-blue-300 capitalize">{h.dia || h.diaSemana}</span>
                                                                <span className="font-black text-white">{h.horaInicio} - {h.horaFin}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-blue-800 rounded-2xl">
                                            <svg className="w-12 h-12 text-blue-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            <p className="text-blue-300 font-bold text-sm">Este docente aún no tiene asignaciones.<br/>¡Aprovecha, tiene disponibilidad completa!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}