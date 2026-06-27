import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useDocentes } from '../../context/DocenteContext'; 

export function ChecadorPage() {
    const { checarQR } = useDocentes();
    const [scanResult, setScanResult] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const isProcessingRef = useRef(false); 

    // Función para efectos de sonido
    const playSound = (type: 'success' | 'error' | 'warning') => {
        try {
            const audio = new Audio(`/sounds/${type}.mp3`);
            audio.play();
        } catch (e) { /* Fallback silencioso */ }
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
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const qrboxSize = Math.floor(minEdge * 0.75);
                    return { width: qrboxSize, height: qrboxSize };
                },
                fps: 15,
                rememberLastUsedCamera: true,
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                videoConstraints: {
                    facingMode: "environment" 
                },
                aspectRatio: 1.0 
            }, false);

             scanner.render(onScanSuccess, () => {          
            }); 
            scannerRef.current = scanner;
        };

        iniciarEscanner();

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Error al limpiar scanner:", e));
                scannerRef.current = null;
            }
        };
    }, []);

return (
    /* h-[100dvh] para ajustar al alto real del móvil evitando la barra de direcciones */
    <div className="fixed inset-0 z-[100] h-[100dvh] w-full overflow-hidden bg-white sm:bg-gray-50 flex flex-col items-center p-0 sm:p-4 font-sans select-none">
        
        {/* Header - Más pequeño en móvil para ganar espacio */}
        <div className="w-full max-w-md flex items-center justify-between border-b border-gray-100 pb-2 px-6 pt-4 sm:pt-0 mb-1 sm:mb-4">
             <div className="flex flex-col">
                <h2 className="text-blue-900 text-[10px] font-black uppercase tracking-[0.1em]">USAG Digital</h2>
                <p className="text-gray-400 text-[8px] font-bold uppercase leading-none">Terminal v2.5</p>
             </div>
             <div className="flex items-center gap-2">
                 <div className={`h-2 w-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]'}`}></div>
             </div>
        </div>

        {/* Contenedor Principal Flex */}
        <div className="w-full max-w-md flex-1 flex flex-col bg-white sm:rounded-[3rem] sm:shadow-2xl overflow-hidden px-4 sm:px-10 pb-6">
            
            <header className="mb-4 text-center pt-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter">Registro de Asistencia</h1>
                <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Enfoque el código QR</p>
            </header>

            {/* Zona de Cámara - Flex-1 para que ocupe el espacio disponible pero no más */}
            <div className="relative flex-1 min-h-0 w-full max-w-[280px] sm:max-w-[320px] mx-auto aspect-square sm:aspect-auto">
                <div id="reader" className={`w-full h-full rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-2 transition-all duration-500 bg-black ${
                    loading ? 'border-amber-400' : scanResult ? 'border-emerald-500' : errorMsg ? 'border-red-500' : 'border-gray-50'
                }`}>
                    {/* El video se auto-ajusta aquí */}
                </div>
                
                {loading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-[1.5rem]">
                        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-blue-900 font-black text-[9px] uppercase">Validando</span>
                    </div>
                )}

                {!loading && !scanResult && !errorMsg && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_blue] animate-scan z-10 rounded-full"></div>
                )}
            </div>

            {/* ZONA DE MENSAJE - Ahora tiene un alto fijo para que NUNCA desaparezca */}
            <div className="h-[130px] sm:h-[150px] mt-4 flex items-center justify-center w-full">
                {scanResult ? (
                    <div className={`w-full p-4 sm:p-5 rounded-[1.5rem] border-2 shadow-lg animate-in zoom-in duration-300 ${getEstatusStyle(scanResult.estatus)}`}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-70">{scanResult.tipo}</span>
                            <span className="bg-white/60 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">{scanResult.estatus}</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black leading-tight truncate">{scanResult.docente}</h2>
                        <p className="text-[10px] font-bold opacity-80 truncate">{scanResult.clase || 'Acceso Registrado'}</p>
                    </div>
                ) : errorMsg ? (
                    <div className="w-full p-4 sm:p-5 rounded-[1.5rem] bg-red-50 border-2 border-red-200 text-red-700 animate-in slide-in-from-bottom-2 shadow-md">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 bg-red-100 rounded-full text-red-600">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-[10px] font-black uppercase italic tracking-tighter">Acceso Denegado</h2>
                        </div>
                        <p className="text-[10px] sm:text-[11px] font-bold leading-tight">{errorMsg}</p>
                    </div>
                ) : (
                    <div className="text-center py-6 w-full rounded-[1.5rem] border-2 border-dashed border-gray-100 bg-gray-50/40">
                         <p className="text-gray-300 text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">
                            Esperando Escaneo
                         </p>
                    </div>
                )}
            </div>
        </div>

        <style>{`
            @keyframes scan {
                0% { top: 5%; opacity: 0; }
                50% { opacity: 1; }
                100% { top: 95%; opacity: 0; }
            }
            .animate-scan { animation: scan 2s linear infinite; }
            
            #reader video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                border-radius: 1.5rem !important;
            }

            /* Estilo para el botón de "Permitir Cámara" en móvil */
            #reader button {
                background: #1e3a8a !important;
                border-radius: 0.75rem !important;
                padding: 10px 20px !important;
                font-size: 10px !important;
                font-weight: 900 !important;
                text-transform: uppercase !important;
                color: white !important;
                border: none !important;
                margin-top: 10px !important;
            }
        `}</style>
    </div>
);
}

export default ChecadorPage;