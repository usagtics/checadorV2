import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDirectivo } from '../context/DirectivoContext'
; 

export default function MenuDocentes() {
    const location = useLocation();
    const { user } = useDirectivo(); 

    const menuItems = [
        { 
            path: '/admin', 
            label: 'Inicio / Panel', 
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
        },
        { 
            path: '/admin/docentes', 
            label: 'Plantilla Docente', 
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
        },
        { 
            path: '/admin/registro-docente', 
            label: 'Alta de Docente', 
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
        },
        { 
            path: '/admin/asignacion', 
            label: 'Asignación', 
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
        },
        { 
            path: '/admin/asistencia-docentes', 
            label: 'Asistencias', 
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        { 
            path: '/admin/nomina', 
            label: 'Nómina', 
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
    ];

    if (user?.role === 'super-admin') {
        menuItems.push({
            path: '/admin/directivos', 
            label: 'Usuarios y Accesos', 
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        });
    }

    return (
        <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 h-[calc(100vh-80px)] shadow-xl shadow-gray-200/20 sticky top-0">
            {/* --- CABECERA DEL MENÚ LATERAL --- */}
            <div className="p-8 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <span className="text-white font-black text-xl">U</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 tracking-tighter leading-none">San Andrés</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Gestión Docente</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-2 mb-4">Menú Principal</p>
                
                {menuItems.map(item => {
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(`${item.path}/`));
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                                isActive 
                                ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20 transform scale-[1.02]' 
                                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-900'
                            }`}
                        >
                            <span className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-900'} transition-colors duration-300`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-gray-500">Sistema en línea</span>
                </div>
            </div>
        </aside>
    );
}