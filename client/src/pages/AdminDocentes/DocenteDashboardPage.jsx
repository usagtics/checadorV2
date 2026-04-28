import React from 'react';
import { useDocentes } from '../../context/DocenteContext';
import { useNavigate } from 'react-router-dom';

export default function DocenteDashboard() {
  const { docente, logoutDocente } = useDocentes();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutDocente(); 
    navigate('/directivo/login'); 
  };

  if (!docente) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-900 mb-4"></div>
        <h2 className="text-xl font-bold text-blue-900">Cargando tu información...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans pb-20">
      <div className="max-w-6xl mx-auto">
        


        {/* --- CONTENIDO PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* COLUMNA IZQUIERDA: EL CÓDIGO QR Y DATOS */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-900 to-blue-800 -z-10 rounded-t-[2.5rem]"></div>
              
              <h2 className="text-white font-black tracking-widest uppercase text-sm mb-8 mt-2">Tu Identificación</h2>
              
              <div className="bg-white p-4 rounded-[2rem] shadow-lg inline-block mx-auto mb-6">
                {docente?.qrCode ? (
                  <img src={docente.qrCode} alt="Tu Código QR" className="w-48 h-48 mx-auto rounded-xl" />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm font-bold">
                    QR no disponible
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-sm font-medium px-4">
                Presenta este código en el <strong className="text-blue-900">Checador de la entrada</strong> para registrar tu asistencia.
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
                  <span className="text-gray-900 font-bold bg-blue-50 px-3 py-1 rounded-lg">{docente?.turno || 'N/A'}</span>
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
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-gray-900">Tus Materias Asignadas</h3>
                <span className="bg-blue-100 text-blue-900 text-xs font-black px-3 py-1 rounded-lg">Ciclo Actual</span>
              </div>

              {docente?.materias && docente.materias.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {docente.materias.map((materia, idx) => (
                    <div key={idx} className="border border-gray-100 p-5 rounded-2xl hover:border-blue-200 transition-all group">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-900 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-900">{typeof materia === 'string' ? materia : materia.nombre}</h4>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aún no tienes materias asignadas</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden">
              <h3 className="text-xl font-black mb-2 relative z-10">Resumen de Trabajo</h3>
              <p className="text-gray-400 text-sm mb-6 relative z-10">Horas contabilizadas durante este mes.</p>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex justify-between items-center relative z-10">
                <div>
                  <span className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Horas Acumuladas</span>
                  <span className="text-3xl font-black">{docente?.horasAcumuladas || 0}<span className="text-lg text-gray-400"> hrs</span></span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- NUEVA SECCIÓN: TABLA DETALLADA DE CHECADAS --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Registro Detallado de Asistencia
            </h3>
            <span className="bg-gray-100 text-gray-500 text-xs font-black px-3 py-1 rounded-lg">Este Mes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                  <th className="pb-4 font-bold">Fecha</th>
                  <th className="pb-4 font-bold">Hora</th>
                  <th className="pb-4 font-bold">Movimiento</th>
                  <th className="pb-4 font-bold">Materia Impartida</th>
                  <th className="pb-4 font-bold">Puntualidad</th>
                </tr>
              </thead>
              <tbody>
                {docente?.historialAsistencias && docente.historialAsistencias.length > 0 ? (
                  docente.historialAsistencias.map((registro, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm font-bold text-gray-900">
                        {new Date(registro.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 text-sm font-bold text-gray-500">
                        {new Date(registro.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                          registro.tipoRegistro === 'Entrada' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                        }`}>
                          {registro.tipoRegistro}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600 font-medium truncate max-w-[200px]" title={registro.materia?.nombre || 'No especificada'}>
                        {registro.materia?.nombre || 'No especificada'}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          registro.estatus === 'A tiempo' ? 'bg-emerald-50 text-emerald-600' : 
                          registro.estatus === 'Retardo' ? 'bg-yellow-50 text-yellow-600' : 
                          'bg-red-50 text-red-600'
                        }`}>
                          {registro.estatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <div className="inline-block p-4 rounded-full bg-gray-50 mb-3 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm font-bold">Aún no hay checadas registradas este mes.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}