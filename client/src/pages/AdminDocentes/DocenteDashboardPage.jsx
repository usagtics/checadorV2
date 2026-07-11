import React, { useState, useEffect } from 'react';
import { useDocentes } from '../../context/DocenteContext';
import { QRCodeSVG } from 'qrcode.react'; 
import CryptoJS from 'crypto-js';

export default function DocenteDashboard() {
  const { docente } = useDocentes();

  // Estados para nuestro QR Dinámico
  const [qrToken, setQrToken] = useState('');
  const [countdown, setCountdown] = useState(20); 

  // --- LÓGICA DE SEGURIDAD: GENERADOR DE QR DINÁMICO ---
  useEffect(() => {
    if (!docente?.numeroEmpleado) return;

    const generarTokenSeguro = () => {
      const payload = {
        id: docente.numeroEmpleado,
        timestamp: Date.now()
      };
      
      const tokenEncriptado = CryptoJS.AES.encrypt(
        JSON.stringify(payload), 
        'SECRETO_USAG_2026' 
      ).toString();

      setQrToken(tokenEncriptado);
      setCountdown(20);
    };

    generarTokenSeguro();

    const intervalQR = setInterval(generarTokenSeguro, 20000);
    const intervalTick = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 20));
    }, 1000);

    return () => {
      clearInterval(intervalQR);
      clearInterval(intervalTick);
    };
  }, [docente]);

  if (!docente) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-900 mb-4"></div>
        <h2 className="text-xl font-black text-blue-900 tracking-tight">Cargando tu información...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* --- ENCABEZADO --- */}
        <header className="mb-10">
            <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-1.5 bg-blue-900 rounded-full"></div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                    Hola, {docente?.nombre}
                </h1>
            </div>
            <p className="text-gray-500 font-medium ml-4 text-sm">Bienvenido a tu panel docente de USAG.</p>
        </header>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* COLUMNA IZQUIERDA: QR DINÁMICO */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-900 to-blue-800 -z-10 rounded-t-[2.5rem]"></div>
              
              <h2 className="text-white font-black tracking-widest uppercase text-[10px] mb-8 mt-2">ID Institucional Seguro</h2>
              
              <div className="bg-white p-4 rounded-[2rem] shadow-lg inline-block mx-auto mb-6 ring-4 ring-white">
                {qrToken ? (
                    <div className="flex flex-col items-center">
                        <QRCodeSVG value={qrToken} size={180} level="Q" />
                        <div className="w-full mt-5 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 transition-all duration-1000" style={{ width: `${(countdown / 20) * 100}%` }}></div>
                        </div>
                    </div>
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm font-bold">Cargando...</div>
                )}
              </div>
              <p className="text-gray-500 text-xs font-medium px-4">
                Este código cambia cada 20 segundos por seguridad.
              </p>
            </div>

            {/* Detalles del Puesto */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-gray-900 font-black mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Detalles del Puesto
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Turno</span>
                  <span className="text-gray-900 font-bold bg-blue-50 px-3 py-1 rounded-lg text-xs">{docente?.turno || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Correo</span>
                  <span className="text-gray-700 font-bold text-sm truncate max-w-[150px]">{docente?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: MATERIAS Y HORAS */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-8">Tus Materias Asignadas</h3>
              {docente?.materias?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {docente.materias.map((materia, idx) => (
                    <div key={idx} className="border border-gray-100 p-5 rounded-2xl hover:border-blue-200 transition-all">
                      <h4 className="font-bold text-gray-900">{typeof materia === 'string' ? materia : materia.nombre}</h4>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-bold uppercase text-xs">Sin materias asignadas</p>
              )}
            </div>
          </div>
        </div>

        {/* --- TABLA DE CHECADAS --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 mb-6">Registro Detallado</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                  <th className="pb-4 font-bold">Fecha</th>
                  <th className="pb-4 font-bold">Hora</th>
                  <th className="pb-4 font-bold">Movimiento</th>
                  <th className="pb-4 font-bold">Materia</th>
                  <th className="pb-4 font-bold text-center">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {docente?.historialAsistencias?.map((registro, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-4 text-sm font-bold">{new Date(registro.fecha).toLocaleDateString()}</td>
                    <td className="py-4 text-sm font-bold text-gray-500">{new Date(registro.fecha).toLocaleTimeString()}</td>
                    <td className="py-4"><span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${registro.tipoRegistro === 'Entrada' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{registro.tipoRegistro}</span></td>
                    <td className="py-4 text-sm font-bold">{registro.materia?.nombre || 'N/A'}</td>
                    <td className="py-4 text-center"><span className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-600">{registro.estatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}