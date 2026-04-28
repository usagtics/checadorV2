import React, { useState, useEffect } from 'react';
import { useDocentes } from '../../context/DocenteContext';
// ✅ IMPORTAMOS useParams
import { useNavigate, Link, useParams } from 'react-router-dom';

export default function DocenteFormPage() {
    // ✅ Agregamos getDocente y updateDocente de tu contexto
    const { createDocente, getDocente, updateDocente, errors: formErrors } = useDocentes();
    const navigate = useNavigate();
    const params = useParams(); // Esto atrapa el ID de la URL

    const [docente, setDocente] = useState({
        nombre: '',
        apellidos: '',
        numeroEmpleado: '',
        email: '',
        username: '', 
        password: '', 
        pagoHoraSabatino: '200',
        pagoHoraMatutino: '200',
        pagoHoraLinea: '250',
        metodoPago: 'TARJETA',
        turno: 'Matutino'
    });

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [qrCodeData, setQrCodeData] = useState(null);

    // ✅ NUEVO: Efecto que carga los datos si venimos a Editar
    useEffect(() => {
        const cargarDocente = async () => {
            if (params.id) {
                const docenteActual = await getDocente(params.id);
                if (docenteActual) {
                    setDocente({
                        nombre: docenteActual.nombre || '',
                        apellidos: docenteActual.apellidos || '',
                        numeroEmpleado: docenteActual.numeroEmpleado || '',
                        email: docenteActual.email || '',
                        username: docenteActual.username || '',
                        password: '', // Lo dejamos vacío para no mostrar código encriptado
                        pagoHoraSabatino: docenteActual.pagoHoraSabatino || '200',
                        pagoHoraMatutino: docenteActual.pagoHoraMatutino || '200',
                        pagoHoraLinea: docenteActual.pagoHoraLinea || '250',
                        metodoPago: docenteActual.metodoPago || 'TARJETA',
                        turno: docenteActual.turno || 'Matutino'
                    });
                }
            }
        };
        cargarDocente();
    }, [params.id]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setDocente({
            ...docente,
            [e.target.name]: e.target.value
        });
    };
const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // 1. Extraemos el 'password' y guardamos lo demás en 'restoDatos'
            const { password, ...restoDatos } = docente;

            // 2. Preparamos el paquete base SIN la contraseña
            const dataToSend: Record<string, any> = {
                ...restoDatos,
                pagoHoraSabatino: Number(docente.pagoHoraSabatino),
                pagoHoraMatutino: Number(docente.pagoHoraMatutino),
                pagoHoraLinea: Number(docente.pagoHoraLinea)
            };

            // 3. SOLO agregamos la contraseña si estamos creando uno nuevo, 
            //    o si estamos editando y el usuario SÍ escribió una nueva.
            if (!params.id || (password && password.trim() !== '')) {
                dataToSend.password = password;
            }

            if (params.id) {
                // 🔄 MODO EDICIÓN
                await updateDocente(params.id, dataToSend);
                navigate('/admin/docentes'); 
            } else {
                // ➕ MODO CREACIÓN
                const res = await createDocente(dataToSend);
                if (res && res.qrCode) {
                    setQrCodeData(res.qrCode);
                    setShowModal(true);
                } else {
                    navigate('/admin/docentes'); 
                }
            }
            
        } catch (error) {
            console.error("Error al guardar:", error);
        } finally {
            setLoading(false);
        }
    };

    const descargarQR = () => {
        if (!qrCodeData) return;
        const link = document.createElement("a");
        link.href = qrCodeData;
        link.download = `QR_${docente.nombre}_${docente.numeroEmpleado}.png`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans selection:bg-blue-900/10 relative">
            <div className="max-w-4xl mx-auto">
                
                <header className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link 
                            to="/admin/docentes" 
                            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-900 hover:border-blue-900 transition-all shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            {/* ✅ Título dinámico */}
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
                                {params.id ? "Editar" : "Alta de Nuevo"} <span className="text-blue-900">Docente</span>
                            </h1>
                            <p className="text-gray-500 font-medium text-sm">
                                {params.id ? "Modifique la información necesaria y guarde los cambios." : "Registre la información académica y credenciales de acceso."}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/60 border border-gray-100">
            {formErrors && formErrors.length > 0 && (
    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold">
        {formErrors.map((err: string, i: number) => (
            <p key={i} className="flex items-center gap-2">⚠️ {err}</p>
        ))}
    </div>
)}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-6 h-6 bg-blue-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">01</span>
                                <h2 className="text-blue-900 font-black uppercase tracking-widest text-xs">Información Personal</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre(s)</label>
                                    <input type="text" name="nombre" value={docente.nombre} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Apellidos</label>
                                    <input type="text" name="apellidos" value={docente.apellidos} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Número de Empleado</label>
                                    <input type="text" name="numeroEmpleado" value={docente.numeroEmpleado} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none font-mono font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Correo Institucional</label>
                                    <input type="email" name="email" value={docente.email} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none font-bold" />
                                </div>
                            </div>
                        </section>

                        <section className="bg-emerald-50/30 p-6 rounded-[2rem] border border-emerald-100/50">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">02</span>
                                <h2 className="text-emerald-700 font-black uppercase tracking-widest text-xs">Tabulador de Nómina</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Pago Matutino ($)</label>
                                    <input type="number" name="pagoHoraMatutino" value={docente.pagoHoraMatutino} onChange={handleChange} required className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Pago Sabatino ($)</label>
                                    <input type="number" name="pagoHoraSabatino" value={docente.pagoHoraSabatino} onChange={handleChange} required className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Pago Línea ($)</label>
                                    <input type="number" name="pagoHoraLinea" value={docente.pagoHoraLinea} onChange={handleChange} required className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Método de Pago</label>
                                    <select name="metodoPago" value={docente.metodoPago} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none font-bold appearance-none cursor-pointer">
                                        <option value="TARJETA">TARJETA</option>
                                        <option value="EFECTIVO">EFECTIVO</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-6 h-6 bg-blue-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">03</span>
                                <h2 className="text-blue-900 font-black uppercase tracking-widest text-xs">Acceso al Sistema</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre de Usuario</label>
                                    <input type="text" name="username" value={docente.username} onChange={handleChange} required className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        Contraseña
                                        {params.id && <span className="text-blue-500 lowercase normal-case">(Dejar en blanco para no cambiar)</span>}
                                    </label>
                                    {/* ✅ Si estamos editando, ya NO es obligatorio llenar la contraseña */}
                                    <input type="password" name="password" value={docente.password} onChange={handleChange} required={!params.id} placeholder={params.id ? "••••••••" : ""} className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none font-bold" />
                                </div>
                            </div>
                        </section>

                        <div className="pt-8 flex justify-end">
                            <button type="submit" disabled={loading} className={`min-w-[280px] bg-blue-900 hover:bg-blue-950 text-white font-black py-5 px-8 rounded-2xl shadow-xl flex justify-center items-center transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {/* ✅ Botón dinámico */}
                                {loading ? 'GUARDANDO...' : (params.id ? 'ACTUALIZAR DOCENTE' : 'REGISTRAR DOCENTE')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODAL DE ÉXITO (SOLO CREACIÓN) */}
            {showModal && !params.id && (
                <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-2">¡Registro Exitoso!</h2>
                        <div className="bg-gray-50 p-4 rounded-[2rem] border-2 border-dashed border-gray-200 mb-8 inline-block shadow-inner">
                            {qrCodeData && <img src={qrCodeData} alt="QR Docente" className="w-48 h-48 mx-auto" />}
                        </div>
                        <div className="space-y-3">
                            <button onClick={descargarQR} className="w-full bg-blue-800 text-white font-black py-4 rounded-2xl hover:bg-blue-900 transition-all flex items-center justify-center gap-2">
                                DESCARGAR QR
                            </button>
                            <button onClick={() => navigate('/admin/docentes')} className="w-full text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-blue-900 transition-all">
                                Finalizar y salir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}