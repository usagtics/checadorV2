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

  // --- AGRUPAR HORARIO DEL DOCENTE ---
  const horarioAgrupado = useMemo(() => {
    if (!docente || !docente.ofertaAcademica) return [];

    const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const agrupado = {};

    docente.ofertaAcademica.forEach(oferta => {
      if (oferta.horarios && oferta.horarios.length > 0) {
        oferta.horarios.forEach(horario => {
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

    return Object.keys(agrupado)
      .sort((a, b) => diasOrden.indexOf(a) - diasOrden.indexOf(b))
      .map(dia => ({
        dia,
        clases: agrupado[dia].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
      }));
  }, [docente]);

  // --- LÓGICA DE PROGRESO DEL DÍA ACTUAL ---
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaHoy = diasSemana[new Date().getDay()];

  const asistenciasHoy = useMemo(() => {
    if (!docente?.historialAsistencias) return [];
    const hoyString = new Date().toDateString();
    return docente.historialAsistencias.filter(a => new Date(a.fecha).toDateString() === hoyString);
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
        
        <header className="mb-10">
            <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-1.5 bg-blue-900 rounded-full"></div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                    Hola, {docente?.nombre}
                </h1>
            </div>
            <p className="text-gray-500 font-medium ml-4 text-sm">Bienvenido a tu panel docente.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
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
                  horarioAgrupado.map((diaInfo, idx) => {
                    const esHoy = diaInfo.dia === diaHoy;

                    return (
                      <div key={idx} className={`bg-gray-50/50 rounded-2xl border ${esHoy ? 'border-blue-200 ring-4 ring-blue-50/50' : 'border-gray-100'} p-5 relative overflow-hidden transition-all`}>
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${esHoy ? 'bg-blue-500' : 'bg-blue-900'} rounded-l-2xl`}></div>
                        
                        <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 ml-3 flex items-center gap-2">
                          {diaInfo.dia} 
                          {esHoy && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-[9px] shadow-sm">HOY</span>}
                        </h4>

                        <div className="space-y-3 ml-3">
                          {diaInfo.clases.map((clase, cIdx) => {
                            let statusClase = null;
                            
                            // Si es el día de hoy, verificamos si ya asistió
                            if (esHoy) {
                              const registrosMateria = asistenciasHoy.filter(a => a.materia?.nombre === clase.materia || a.materia === clase.materia);
                              const tieneEntrada = registrosMateria.some(a => a.tipoRegistro === 'Entrada');
                              const tieneSalida = registrosMateria.some(a => a.tipoRegistro === 'Salida');

                              if (tieneEntrada && tieneSalida) {
                                statusClase = 'completada';
                              } else if (tieneEntrada) {
                                // 🚨 NUEVA VALIDACIÓN DE OMISIÓN DE SALIDA
                                const [hFin, mFin] = clase.horaFin.split(':').map(Number);
                                const horaFinClase = new Date();
                                horaFinClase.setHours(hFin, mFin + 30, 0, 0); // La tolerancia de 30 minutos

                                if (new Date() > horaFinClase) {
                                  statusClase = 'omision_salida'; // Se pasó el tiempo, se le olvidó
                                } else {
                                  statusClase = 'curso'; // Todavía está a tiempo de salir
                                }
                              } else {
                                statusClase = 'pendiente';
                              }
                            }

                            return (
                              <div key={cIdx} className={`bg-white p-4 rounded-xl shadow-sm border ${
                                statusClase === 'completada' ? 'border-emerald-200 bg-emerald-50/30' : 
                                statusClase === 'omision_salida' ? 'border-red-200 bg-red-50/30' : 
                                'border-gray-100'
                              } flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors`}>
                                <div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <p className="font-bold text-gray-900 leading-tight">{clase.materia}</p>
                                    
                                    {/* BADGES DE ESTATUS */}
                                    {statusClase === 'completada' && (
                                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit border border-emerald-200">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Cubierta
                                      </span>
                                    )}
                                    {statusClase === 'curso' && (
                                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit border border-amber-200">
                                        <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> En Curso
                                      </span>
                                    )}
                                    {statusClase === 'omision_salida' && (
                                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit border border-red-200">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Falta Salida
                                      </span>
                                    )}
                                    {statusClase === 'pendiente' && (
                                      <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit border border-gray-200">
                                        Pendiente
                                      </span>
                                    )}
                                  </div>
                                  
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 sm:mt-1">
                                    Grupo: <span className="text-blue-600">{clase.grupo}</span>
                                  </p>
                                </div>
                                
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit shrink-0 ${
                                  statusClase === 'completada' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                  statusClase === 'omision_salida' ? 'bg-red-50 text-red-700 border-red-100' :
                                  'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-black text-sm">{clase.horaInicio} - {clase.horaFin}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
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
                    <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                            registro.estatus === 'A tiempo' ? 'bg-emerald-50 text-emerald-600' : 
                            registro.estatus === 'Retardo' ? 'bg-amber-50 text-amber-600' : 
                            'bg-red-50 text-red-600'
                        }`}>
                            {registro.estatus}
                        </span>
                    </td>
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