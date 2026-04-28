import React, { useEffect, useState } from 'react';
import { useGrupos } from '../../context/GrupoContext';
import { Link } from 'react-router-dom';

export default function GruposListPage() {
  const { grupos, getGrupos, deleteGrupo } = useGrupos();
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrograma, setFiltroPrograma] = useState('Todos');

  useEffect(() => {
    getGrupos();
  }, []);

  const gruposFiltrados = grupos.filter((g) => {
    const coincideTexto = g.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincidePrograma = filtroPrograma === 'Todos' || g.programa === filtroPrograma;
    return coincideTexto && coincidePrograma;
  });

  // Adaptado a Azul Marino (blue-900) para Licenciatura y detalles institucionales
  const getThemeByPrograma = (programa) => {
    switch (programa) {
      case 'TSU':
        return {
          bg: 'bg-cyan-50',
          text: 'text-cyan-800',
          border: 'border-cyan-200',
          hoverBorder: 'group-hover:border-cyan-500',
          shadow: 'group-hover:shadow-cyan-900/10'
        };
      case 'Nivelación':
        return {
          bg: 'bg-violet-50',
          text: 'text-violet-800',
          border: 'border-violet-200',
          hoverBorder: 'group-hover:border-violet-500',
          shadow: 'group-hover:shadow-violet-900/10'
        };
      default: // Licenciatura (Azul Marino)
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-900',
          border: 'border-blue-200',
          hoverBorder: 'group-hover:border-blue-900',
          shadow: 'group-hover:shadow-blue-900/15'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans selection:bg-blue-900/10 selection:text-blue-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- ENCABEZADO INSTITUCIONAL AZUL MARINO --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                Gestión de <span className="text-blue-900">Grupos</span>
              </h1>
            </div>
            <p className="text-gray-500 font-medium text-lg ml-16">
              Administra las modalidades, turnos y nomenclaturas activas.
            </p>
          </div>

          <Link 
            to="/admin/grupos/nuevo" 
            className="group relative px-8 py-4 bg-blue-900 rounded-2xl font-black text-white overflow-hidden shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-950 hover:shadow-blue-900/40 transform active:scale-95 shrink-0"
          >
            <div className="relative flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              CREAR GRUPO
            </div>
          </Link>
        </header>

        {/* --- BARRA DE FILTROS --- */}
        <div className="bg-white border border-gray-200 p-4 rounded-2xl mb-10 flex flex-col sm:flex-row gap-4 shadow-sm relative z-20">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre de grupo (Ej: 101-A)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-3 outline-none focus:bg-white focus:border-blue-900 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Select de Programa */}
          <select
            value={filtroPrograma}
            onChange={(e) => setFiltroPrograma(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-6 py-3 outline-none focus:bg-white focus:border-blue-900 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer min-w-[200px]"
          >
            <option value="Todos">Todos los Programas</option>
            <option value="Licenciatura">Licenciatura</option>
            <option value="TSU">TSU</option>
            <option value="Nivelación">Nivelación</option>
          </select>
        </div>

        {/* --- GRID DE GRUPOS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          
          {/* TARJETA FANTASMA (AGREGAR RÁPIDO) */}
          <Link 
            to="/admin/grupos/nuevo"
            className="group relative flex flex-col items-center justify-center min-h-[220px] bg-white/50 rounded-[2rem] border-2 border-dashed border-gray-300 hover:border-blue-900 hover:bg-blue-50/50 transition-all duration-500 overflow-hidden"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-transform duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 group-hover:text-blue-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-gray-400 font-black uppercase text-xs tracking-[0.3em] group-hover:text-blue-900 transition-colors">
              Nuevo Registro
            </span>
          </Link>

          {/* LISTADO DINÁMICO */}
          {gruposFiltrados.map((g) => {
            const theme = getThemeByPrograma(g.programa);
            return (
              <div 
                key={g._id} 
                className={`group relative bg-white rounded-[2rem] p-7 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[220px] ${theme.hoverBorder} ${theme.shadow}`}
              >
                {/* Decoración abstracta de fondo */}
                <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 group-hover:rotate-12 group-hover:scale-110 transform">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-blue-900">
                    <path d="M12 2L2 22h20L12 2zm0 3.5l7.5 14.5h-15L12 5.5z"/>
                  </svg>
                </div>

                {/* Header de la tarjeta */}
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${theme.bg} ${theme.text} ${theme.border}`}>
                    {g.programa}
                  </span>
                  
                  <button 
                    onClick={() => deleteGrupo(g._id)} 
                    className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300"
                    title="Eliminar grupo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                {/* Cuerpo de la tarjeta */}
                <div className="relative z-10 mt-auto">
                  <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 group-hover:translate-x-1 transition-transform duration-300">
                    {g.nombre}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-current ${theme.text} animate-pulse`}></div>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">
                      {g.turno}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- ESTADO VACÍO (Filtro) --- */}
        {gruposFiltrados.length === 0 && grupos.length > 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-xl font-black text-gray-800 mb-2">No se encontraron grupos</h3>
            <p className="text-gray-500 font-medium">
              Intenta cambiar tu búsqueda o el filtro de programa.
            </p>
          </div>
        )}

        {/* --- ESTADO VACÍO TOTAL --- */}
        {grupos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Sin grupos activos</h3>
            <p className="text-gray-500 font-medium max-w-sm">
              Comienza registrando tu primer grupo para habilitar la asignación de carga académica.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}