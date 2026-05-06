import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useDocentes } from '../../context/DocenteContext';
import { useNavigate, Link, useParams } from 'react-router-dom';
import MenuDocentes from '../../menu/MenuDocentes';

interface DataToSend {
    [key: string]: any;
    pagoHoraSabatino: number;
    pagoHoraMatutino: number;
    pagoHoraLinea: number;
    password?: string;
}

export default function DocenteFormPage() {
    const { createDocente, getDocente, updateDocente } = useDocentes();
    const navigate = useNavigate();
    const params = useParams<{ id: string }>();

    const [docente, setDocente] = useState({
        nombre: '',
        apellidos: '',
        numeroEmpleado: '',
        email: '',
        username: '', 
        password: '', 
        pagoBase: '200', 
        metodoPago: 'TARJETA',
        turno: 'Matutino'
    });

    const [loading, setLoading] = useState(false);
    
    const [showModal, setShowModal] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);

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
                        password: '', 
                        pagoBase: String(docenteActual.pagoHoraMatutino || '200'), 
                        metodoPago: docenteActual.metodoPago || 'TARJETA',
                        turno: docenteActual.turno || 'Matutino'
                    });
                }
            }
        };
        cargarDocente();
    }, [params.id]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setDocente({
            ...docente,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const { password, pagoBase, ...restoDatos } = docente;

            const dataToSend: DataToSend = {
                ...restoDatos,
                pagoHoraSabatino: Number(pagoBase),
                pagoHoraMatutino: Number(pagoBase),
                pagoHoraLinea: Number(pagoBase)
            };

            if (!params.id || (password && password.trim() !== '')) {
                dataToSend.password = password;
            }

            if (params.id) {
                await updateDocente(params.id, dataToSend);
                navigate('/admin/docentes'); 
            } else {
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
        <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-900/10 overflow-hidden relative">
            
            <MenuDocentes />

            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-10">
                    
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/admin/docentes" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-900 hover:border-blue-900 transition-all shadow-sm" title="Volver a Plantilla Docente">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="h-8 w-1.5 bg-blue-900 rounded-full"></div>
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
                                        {params.id ? "Editar" : "Alta de Nuevo"} <span className="text-blue-900">Docente</span>
                                    </h1>
                                </div>
                                <p className="text-gray-500 font-medium text-sm ml-4">
                                    {params.id ? "Modifique la información del perfil del docente." : "Registre la información para generar el acceso y código QR."}
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/60 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="w-6 h-6 bg-blue-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">01</span>
                                    <h2 className="text-blue-900 font-black uppercase tracking-widest text-xs">Información Personal</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre(s)</label>
                                        <input type="text" name="nombre" value={docente.nombre} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Apellidos</label>
                                        <input type="text" name="apellidos" value={docente.apellidos} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Número de Empleado</label>
                                        <input type="text" name="numeroEmpleado" value={docente.numeroEmpleado} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Correo Institucional</label>
                                        <input type="email" name="email" value={docente.email} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-900 outline-none transition-all" />
                                    </div>
                                </div>
                            </section>

                            <section className="bg-emerald-50/30 p-6 rounded-[2rem] border border-emerald-100/50">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">02</span>
                                    <h2 className="text-emerald-700 font-black uppercase tracking-widest text-xs">Tabulador de Nómina</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Pago por Hora ($)</label>
                                        <input type="number" name="pagoBase" value={docente.pagoBase} onChange={handleChange} required className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Método de Pago</label>
                                        <select name="metodoPago" value={docente.metodoPago} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all cursor-pointer">
                                            <option value="TARJETA">TARJETA BANCARIA</option>
                                            <option value="EFECTIVO">EFECTIVO / NÓMINA FÍSICA</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black">03</span>
                                    <h2 className="text-indigo-700 font-black uppercase tracking-widest text-xs">Acceso al Sistema (Portal Docente)</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Usuario</label>
                                        <input type="text" name="username" value={docente.username} onChange={handleChange} required className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Contraseña {params.id && '(Opcional)'}</label>
                                        <input type="password" name="password" placeholder={params.id ? "•••••••• (Dejar en blanco para conservar)" : ""} value={docente.password} onChange={handleChange} required={!params.id} className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" />
                                    </div>
                                </div>
                            </section>

                            <div className="pt-6 flex justify-end">
                                <button type="submit" disabled={loading} className={`min-w-[300px] bg-blue-900 text-white font-black py-5 px-8 rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-blue-950 transition-all flex justify-center items-center transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            GUARDANDO...
                                        </div>
                                    ) : (params.id ? 'ACTUALIZAR PERFIL DOCENTE' : 'REGISTRAR DOCENTE')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showModal && qrCodeData && (
                <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-1">¡Registro Exitoso!</h2>
                        <p className="text-blue-900 font-bold text-[10px] uppercase tracking-widest mb-8">Código QR de Asistencia</p>

                        <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-dashed border-gray-200 mb-8 inline-block">
                            <img src={qrCodeData} alt="QR Docente" className="w-48 h-48 mx-auto shadow-sm rounded-lg" />
                        </div>

                        <div className="space-y-3">
                            <button onClick={descargarQR} className="w-full bg-blue-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-950 transition-all shadow-lg shadow-blue-900/20 transform active:scale-95">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                DESCARGAR IMAGEN
                            </button>
                            <button 
                                onClick={() => { 
                                    setShowModal(false); 
                                    navigate('/admin/docentes'); 
                                }} 
                                className="w-full text-gray-400 font-bold text-xs uppercase tracking-[0.2em] py-3 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                            >
                                Continuar al listado
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}