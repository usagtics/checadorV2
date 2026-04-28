import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useDocentes } from '../../context/DocenteContext'; 

export function ChecadorPage() {
    const { checarQR } = useDocentes();
    const [scanResult, setScanResult] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [noCamera, setNoCamera] = useState(false);
    
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
            case 'A tiempo': return 'bg-green-600/20 border-green-500 text-green-100';
            case 'Retardo': return 'bg-yellow-600/20 border-yellow-500 text-yellow-100';
            case 'Falta': return 'bg-red-600/20 border-red-500 text-red-100';
            default: return 'bg-indigo-600/20 border-indigo-500 text-indigo-100';
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
                // Resetear después de 5 segundos para permitir otro escaneo
                setTimeout(() => {
                    setScanResult(null);
                    setErrorMsg(null);
                    isProcessingRef.current = false;
                    if (scannerRef.current) scannerRef.current.resume();
                }, 5000);
            }
        };

        // 2. Luego definimos cómo iniciar la cámara
        const iniciarEscanner = () => {
            if (scannerRef.current) return;
            const scanner = new Html5QrcodeScanner('reader', {
                qrbox: { width: 250, height: 250 }, 
                fps: 10, // 10 fps es más estable para la mayoría de webcams
                rememberLastUsedCamera: true,
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
            }, false);

            scanner.render(onScanSuccess, () => {}); // Ignoramos los warnings de lectura
            scannerRef.current = scanner;
        };

        // 3. Ejecutamos la función
        iniciarEscanner();

        // 4. Limpieza perfecta para React 18
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Limpiando scanner:", e));
                scannerRef.current = null;
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
                 <div>
                    <h2 className="text-indigo-500 text-xs font-black uppercase tracking-[0.2em]">USAG Digital</h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase">Terminal de acceso v2.0</p>
                 </div>
                 <div className={`h-2 w-2 rounded-full ${loading ? 'bg-yellow-500 animate-ping' : 'bg-green-500'}`}></div>
            </div>

            <div className="w-full max-w-lg bg-zinc-900 rounded-[2rem] shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)] overflow-hidden border border-zinc-800 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tighter">Panel de Registro</h1>
                    <p className="text-zinc-500 text-sm">Posicione su código QR frente a la cámara</p>
                </header>

                <div className="relative group">
                    {/* CAMBIO AQUÍ: bg-white para asegurar visibilidad de los botones nativos de la librería */}
                    <div id="reader" className={`mx-auto w-full max-w-sm rounded-3xl overflow-hidden border-4 transition-all duration-500 bg-white min-h-[300px] flex items-center justify-center relative ${
                        loading ? 'border-yellow-500 scale-[0.98]' : scanResult ? 'border-green-500' : errorMsg ? 'border-red-500' : 'border-zinc-800'
                    }`}>
                        {noCamera && <p className="text-red-500 font-bold p-6 text-center z-20">⚠️ CÁMARA NO DETECTADA</p>}
                    </div>
                    
                    {loading && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 rounded-3xl animate-in fade-in">
                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <span className="text-indigo-400 font-bold text-xs tracking-widest uppercase">Verificando...</span>
                        </div>
                    )}

                    {!loading && !scanResult && !errorMsg && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-scan z-10 pointer-events-none"></div>
                    )}
                </div>

                <div className="mt-10 h-44 flex items-center justify-center">
                    {scanResult ? (
                        <div className={`w-full p-6 rounded-2xl border-2 shadow-2xl animate-in zoom-in duration-300 ${getEstatusStyle(scanResult.estatus)}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{scanResult.tipo}</span>
                                <span className="bg-current/10 px-2 py-1 rounded text-[10px] font-bold uppercase">{scanResult.estatus}</span>
                            </div>
                            <h2 className="text-2xl font-black leading-tight mb-1">{scanResult.docente}</h2>
                            <p className="text-sm font-medium opacity-80 italic">{scanResult.clase || 'Materia no especificada'}</p>
                            <div className="mt-4 pt-3 border-t border-current/10 text-[10px] font-bold uppercase tracking-widest opacity-60">
                                {scanResult.message}
                            </div>
                        </div>
                    ) : errorMsg ? (
                        <div className="w-full p-6 rounded-2xl bg-red-950/30 border-2 border-red-500/50 text-red-200 animate-in slide-in-from-bottom-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1 bg-red-500 rounded-full text-zinc-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                                <h2 className="text-lg font-black uppercase tracking-tighter">Acceso Denegado</h2>
                            </div>
                            <p className="text-sm font-semibold opacity-90 leading-relaxed">
                                {errorMsg}
                            </p>
                        </div>
                    ) : (
                        <div className="text-center group cursor-default">
                             <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                                {loading ? 'Consultando...' : 'Esperando Credencial...'}
                             </p>
                        </div>
                    )}
                </div>
            </div>
            
          <style>{`
                @keyframes scan {
                    0% { top: 10%; }
                    100% { top: 90%; }
                }
                .animate-scan {
                    position: absolute;
                    animation: scan 2s linear infinite;
                }
                
                /* Estilizando un poco los botones base de la librería sin romperla */
                #reader { border: none !important; }
                #reader button {
                    background-color: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    padding: 0.5rem 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 10px;
                }
          `}</style>
        </div>
    );
}

export default ChecadorPage;