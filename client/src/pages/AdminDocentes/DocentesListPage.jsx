import React, { useEffect, useState } from 'react';
import { useDocentes } from '../../context/DocenteContext';
import { useDirectivo } from '../../context/DirectivoContext';
import { Link } from 'react-router-dom';
import MenuDocentes from '../../menu/MenuDocentes'; 

export default function DocentesListPage() {
  // Usamos el context de docentes que ya tiene la lógica de carga
  const { getDocentes, docentes, loading } = useDocentes();
  const { user } = useDirectivo();
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState(null);

  useEffect(() => {
    getDocentes();
  }, []);

  const handleViewQR = (docente) => {
    setSelectedDocente(docente);
    setShowQRModal(true);
  };

  const descargarQR = () => {
    if (!selectedDocente?.qrCode) return;
    const link = document.createElement("a");
    link.href = selectedDocente.qrCode;
    link.download = `QR_${selectedDocente.nombre}_${selectedDocente.numeroEmpleado}.png`;
    link.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-blue-900 font-black animate-pulse text-xl tracking-tighter">
        Cargando plantilla docente...
      </div>
    </div>
  );

  return (
    // ✅ CAMBIO CLAVE 1: El contenedor principal ahora divide la pantalla en 2 (flex, h-screen, overflow-hidden)
    <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-900/10 overflow-hidden">
      
      {/* --- MENÚ LATERAL (Izquierda) --- */}
      <MenuDocentes />

      {/* --- CONTENIDO PRINCIPAL (Derecha con scroll propio) --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10">
        <div className="max-w-7xl mx-auto">
          
          {/* --- ENCABEZADO --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-1.5 bg-blue-900 rounded-full"></div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Plantilla de Docentes</h1>
              </div>
              <p className="text-gray-500 font-medium ml-4">
                Carrera de <span className="font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{user?.carrera || 'Administración'}</span>
              </p>
            </div>
            
            <Link 
              to="/admin/registro-docente" 
              className="group bg-blue-900 hover:bg-blue-950 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 transform active:scale-95"
            >
              NUEVO DOCENTE
            </Link>
          </div>

          {/* --- TABLA --- */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/60 overflow-hidden border border-gray-100 mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Nombre del Docente</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Contacto</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Materia(s) Asignada(s)</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {docentes.map((docente) => (
                    <tr key={docente._id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-black border border-blue-200">
                            {docente.nombre ? docente.nombre.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block leading-tight">{docente.nombre} {docente.apellidos}</span>
                            <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Matrícula: {docente.numeroEmpleado}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <span className="text-sm text-gray-700 font-bold block">{docente.email}</span>
                        <span className="text-xs text-gray-400 font-medium italic">{docente.telefono || 'Sin teléfono'}</span>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-2">
                          {docente.materias && docente.materias.length > 0 ? (
                            docente.materias.map((m, i) => (
                              <span key={i} className="inline-block bg-blue-50 text-blue-900 text-[9px] px-2 py-1 rounded-lg font-black uppercase">
                                {typeof m === 'string' ? m : m.nombre}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-300 text-[10px] font-black uppercase">Sin carga</span>
                          )}
                        </div>
                      </td>

                      <td className="px-8 py-6 text-center">
                        <div className="flex justify-center gap-2">
                          {/* Botón Ver QR */}
                          <button 
                            onClick={() => handleViewQR(docente)}
                            className="p-2 bg-blue-50 text-blue-900 hover:bg-blue-900 hover:text-white rounded-xl transition-all border border-blue-100 shadow-sm"
                            title="Ver Código QR"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 11v1m5-16v1m0 11v1M4 8h1m11 0h1M4 12h1m11 0h1M4 16h1m11 0h1m-4-8H4m4 8h8m-4-4h.01M9 4h6m-6 16h6" />
                             </svg>
                          </button>
                          
                          {/* Botón Asignar Materia */}
                          <Link 
                            to={`/admin/asignacion?docente=${docente._id}`} 
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-100 shadow-sm" 
                            title="Asignar Materia"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </Link>

                          {/* Botón Editar Docente */}
                          <Link 
                            to={`/admin/registro-docente/${docente._id}`}
                            className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-800 hover:text-white rounded-xl transition-all border border-gray-200 shadow-sm" 
                            title="Editar Docente"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* --- MODAL PARA MOSTRAR EL QR --- */}
      {showQRModal && selectedDocente && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-1">{selectedDocente.nombre}</h2>
            <p className="text-blue-900 font-bold text-[10px] uppercase tracking-widest mb-8">Código QR de Asistencia</p>

            <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-dashed border-gray-200 mb-8 inline-block">
              <img src={selectedDocente.qrCode} alt="QR Docente" className="w-48 h-48 mx-auto shadow-sm rounded-lg" />
            </div>

            <div className="space-y-3">
              <button onClick={descargarQR} className="w-full bg-blue-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-950 transition-all shadow-lg shadow-blue-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                DESCARGAR IMAGEN
              </button>
              <button onClick={() => setShowQRModal(false)} className="w-full text-gray-400 font-bold text-xs uppercase tracking-[0.2em] py-2 hover:text-gray-600 transition-colors">
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}