import React, { useState, useEffect, useMemo } from 'react';
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

  // --- NUEVA LÓGICA: AGRUPAR HORARIO DEL DOCENTE ---
  const horarioAgrupado = useMemo(() => {
    if (!docente || !docente.ofertaAcademica) return [];

    const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const agrupado = {};

    docente.ofertaAcademica.forEach(oferta => {
      if (oferta.horarios && oferta.horarios.length > 0) {
        oferta.horarios.forEach(horario => {
          // Normalizar el nombre del día
          const diaRaw = horario.dia || horario.diaSemana;
          if (!diaRaw) return;
          
          const dia = diaRaw.charAt(0).toUpperCase() + diaRaw.slice(1).toLowerCase();

          if (!agrupado[dia]) agrupado[dia] = [];
          
          agrupado[dia].push({
            materia: oferta.materia?.nombre || (typeof oferta.materia === 'string' ? oferta.materia : 'Materia sin nombre'),
            grupo: oferta.grupo?.nombre || 'General',
            periodo: oferta.periodo?.nombre || 'Sin definir',
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin
          });
        });
      }
    });

    // Convertir a arreglo y ordenar por día y hora
    return Object.keys(agrupado)
      .sort((a, b) => diasOrden.indexOf(a) - diasOrden.indexOf(b))
      .map(dia => ({
        dia,
        clases: agrupado[dia].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
      }));
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
            <p className="text-gray-500 font-medium ml-4 text-sm">Bienvenido a tu panel docente.</p>
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
                  <span className="text-gray-700 font-bold text-sm truncate max-w-[150px]" title={docente?.email}>{docente?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: HORARIO SEMANAL */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-full">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Tu Agenda Semanal
              </h3>
              
              <div className="space-y-6">
                {horarioAgrupado.length > 0 ? (
                  horarioAgrupado.map((diaInfo, idx) => (
                    <div key={idx} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-900 rounded-l-2xl"></div>
                      
                      <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 ml-3">
                        {diaInfo.dia}
                      </h4>

                      <div className="space-y-3 ml-3">
                        {diaInfo.clases.map((clase, cIdx) => (
                          <div key={cIdx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <p className="font-bold text-gray-900 leading-tight">{clase.materia}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                Grupo: <span className="text-blue-600">{clase.grupo}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 w-fit shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-black text-sm">{clase.horaInicio} - {clase.horaFin}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 font-bold">Aún no tienes horarios asignados para este ciclo.</p>
                  </div>
                )}
              </div>
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