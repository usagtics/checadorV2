import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useDocentes } from '../../context/DocenteContext'; 

export function ChecadorPage() {
    const { checarQR } = useDocentes();
    const [scanResult, setScanResult] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [noCamera] = useState(false);
    
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const isProcessingRef = useRef(false); 

    const playSound = (type: 'success' | 'error' | 'warning') => {
        try {
            const audio = new Audio(`/sounds/${type}.mp3`);
            audio.play();
        } catch (e) { /* Silencioso si no hay archivo de audio */ }
    };

    const getEstatusStyle = (estatus: string) => {
        switch (estatus) {
            case 'A tiempo': return 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-500/10';
            case 'Retardo': return 'bg-amber-50 border-amber-200 text-amber-800 shadow-amber-500/10';
            case 'Falta': return 'bg-red-50 border-red-200 text-red-800 shadow-red-500/10';
            default: return 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-500/10';
        }
    };

    useEffect(() => {
        const onScanSuccess = async (decodedText: string) => {
            if (isProcessingRef.current || !decodedText) return;
            
            isProcessingRef.current = true; 
            setLoading(true);
            if (scannerRef.current) scannerRef.current.pause(true); 
            
            try {
                const respuesta = await checarQR(decodedText);
                setScanResult(respuesta);
                playSound(respuesta.estatus === 'A tiempo' ? 'success' : 'warning');
            } catch (error: any) {
                setErrorMsg(error.response?.data?.message || 'Error de conexión');
                playSound('error');
            } finally {
                setLoading(false);
                setTimeout(() => {
                    setScanResult(null);
                    setErrorMsg(null);
                    isProcessingRef.current = false;
                    if (scannerRef.current) scannerRef.current.resume();
                }, 5000);
            }
        };

        const iniciarEscanner = () => {
            if (scannerRef.current) return;
            const scanner = new Html5QrcodeScanner('reader', {
                qrbox: { width: 250, height: 250 }, 
                fps: 10, 
                rememberLastUsedCamera: true,
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                aspectRatio: 1.0 
            }, false);

            scanner.render(onScanSuccess, () => {}); 
            scannerRef.current = scanner;
        };

        iniciarEscanner();

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Limpiando scanner:", e));
                scannerRef.current = null;
            }
        };
    }, []);

    return (
        /* 👇 AQUÍ ESTÁ LA MAGIA: fixed inset-0 z-[100] hace que cubra todo el navegador tapando la barra azul 👇 */
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-gray-50 flex flex-col items-center justify-center p-4 font-sans selection:bg-blue-900/10">
            
            <div className="w-full max-w-lg mb-6 flex items-center justify-between border-b border-gray-200 pb-4 px-2 mt-8 md:mt-0">
                 <div>
                    <h2 className="text-blue-900 text-xs font-black uppercase tracking-[0.2em]">USAG Digital</h2>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Terminal de acceso v2.0</p>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{loading ? 'Procesando' : 'En línea'}</span>
                     <div className={`h-2.5 w-2.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'}`}></div>
                 </div>
            </div>

            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100 p-8 md:p-12 relative mb-8">
                
                <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5 pointer-events-none">
                    <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor" className="text-blue-900">
                        <path d="M12 2L2 22h20L12 2zm0 3.5l7.5 14.5h-15L12 5.5z"/>
                    </svg>
                </div>

                <header className="mb-8 relative z-10 text-center">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-1">Registro de Asistencia</h1>
                    <p className="text-gray-500 text-sm font-medium">Posicione su código QR frente a la cámara</p>
                </header>

                <div className="relative group mx-auto w-full max-w-sm">
                    <div id="reader" className={`mx-auto w-full rounded-[2rem] overflow-hidden border-4 transition-all duration-500 bg-gray-50 min-h-[250px] relative block ${
                        loading ? 'border-amber-400 scale-[0.98]' : scanResult ? 'border-emerald-500' : errorMsg ? 'border-red-500' : 'border-dashed border-gray-300'
                    }`}>
                        {noCamera && <p className="text-red-500 font-bold p-6 text-center z-20">⚠️ CÁMARA NO DETECTADA</p>}
                    </div>
                    
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-[2rem] animate-in fade-in duration-300">
                            <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-3 shadow-lg"></div>
                            <span className="text-blue-900 font-black text-xs tracking-widest uppercase">Verificando...</span>
                        </div>
                    )}

                    {!loading && !scanResult && !errorMsg && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-scan z-10 pointer-events-none rounded-full"></div>
                    )}
                </div>

                <div className="mt-8 min-h-[160px] flex items-center justify-center">
                    {scanResult ? (
                        <div className={`w-full p-6 rounded-3xl border-2 shadow-lg animate-in zoom-in duration-300 ${getEstatusStyle(scanResult.estatus)}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70 bg-white/50 px-2 py-1 rounded-md">{scanResult.tipo}</span>
                                <span className="bg-white/60 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider">{scanResult.estatus}</span>
                            </div>
                            <h2 className="text-2xl font-black leading-tight mb-1">{scanResult.docente}</h2>
                            <p className="text-sm font-bold opacity-80">{scanResult.clase || 'Jornada asignada'}</p>
                            
                            <div className="mt-4 pt-3 border-t border-current/20 text-[10px] font-black uppercase tracking-widest opacity-70 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {scanResult.message}
                            </div>
                        </div>
                    ) : errorMsg ? (
                        <div className="w-full p-6 rounded-3xl bg-red-50 border-2 border-red-200 text-red-700 animate-in slide-in-from-bottom-4 shadow-lg shadow-red-500/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 bg-red-100 rounded-full text-red-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                                <h2 className="text-lg font-black uppercase tracking-tighter">Acceso Denegado</h2>
                            </div>
                            <p className="text-sm font-bold opacity-90 leading-relaxed ml-11">
                                {errorMsg}
                            </p>
                        </div>
                    ) : (
                        <div className="text-center group cursor-default bg-gray-50/50 w-full py-8 rounded-3xl border border-gray-100">
                             <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                 </svg>
                             </div>
                             <p className="text-gray-400 text-xs font-black uppercase tracking-widest transition-colors">
                                {loading ? 'Consultando...' : 'Esperando Credencial...'}
                             </p>
                        </div>
                    )}
                </div>
            </div>
            
          <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
                .animate-scan {
                    position: absolute;
                    animation: scan 2.5s ease-in-out infinite;
                }
                
                #reader { border: none !important; box-shadow: none !important; }
                
                #reader__scan_region {
                    background-color: #f9fafb;
                    border-radius: 1.5rem;
                    overflow: hidden;
                }
                
                #reader video {
                    width: 100% !important;
                    height: auto !important;
                    object-fit: cover !important;
                    border-radius: 1.5rem !important;
                    display: block;
                }
                
                #reader__dashboard_section_csr {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    width: 100% !important;
                    padding: 10px 0;
                }

                #reader__dashboard_section_csr span { 
                    color: #6b7280 !important; 
                    font-family: sans-serif; 
                    font-size: 12px; 
                    font-weight: bold; 
                    text-transform: uppercase; 
                }
                
                #reader__dashboard_section_swaplink {
                    display: none !important;
                }
                
                #reader button {
                    width: 100% !important;
                    max-width: 200px;
                    background-color: #1e3a8a !important; 
                    color: white !important;
                    border: none !important;
                    border-radius: 1rem !important;
                    padding: 0.75rem 1.5rem !important;
                    font-weight: 900 !important;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 0.75rem;
                    cursor: pointer !important;
                    margin-top: 10px !important;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px -1px rgba(30, 58, 138, 0.2);
                }
                #reader button:hover {
                    background-color: #172554 !important;
                    transform: scale(0.98);
                }
                #reader select {
                    background-color: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.75rem;
                    padding: 0.5rem;
                    font-weight: bold;
                    color: #374151;
                    outline: none;
                    margin-bottom: 10px;
                    width: 100%;
                }
          `}</style>
        </div>
    );
}

export default ChecadorPage;