import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getNominaRequest } from '../../api/asistencias';
import { useDirectivo } from '../../context/DirectivoContext'; 
import logoEmpresa from '../../assets/logo.png';

import MenuDocentes from '../../menu/MenuDocentes';

const NominaPage = () => {
  const [cargando, setCargando] = useState(false);
  
  const { user } = useDirectivo(); 

  const obtenerPeriodoActual = () => {
    const hoy = new Date();
    const diasParaJueves = (hoy.getDay() + 3) % 7; 
    
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - diasParaJueves);
    
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    
    return { inicio, fin };
  };

  const { inicio, fin } = obtenerPeriodoActual();

  const formatearFechaLocal = (fecha) => {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const generarNomina = async () => {
    const strInicio = formatearFechaLocal(inicio);
    const strFin = formatearFechaLocal(fin);
    
    try {
      setCargando(true);
      const res = await getNominaRequest(strInicio, strFin);
      
      if(res.data.length === 0) {
        alert("No se encontraron registros completos (Entrada y Salida) en este periodo.");
        return;
      }
      
      descargarPDF(res.data, strInicio, strFin);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al generar la nómina.");
    } finally {
      setCargando(false);
    }
  };

  const formatoTiempo = (horasDecimales) => {
    if (!horasDecimales || horasDecimales <= 0) return "";
    const hrs = Math.floor(horasDecimales);
    const mins = Math.round((horasDecimales - hrs) * 60);
    
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs} hr ${mins} min`;
  };

  const descargarPDF = (datos, strInicio, strFin) => {
    const doc = new jsPDF('landscape');
    const formatoFechaPDF = (fechaStr) => fechaStr.split('-').reverse().join('/');
    
    doc.addImage(logoEmpresa, 'PNG', 14, 10, 45, 28);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    
    doc.text("UNIVERSIDAD SAN ANDRÉS DE GUANAJUATO", 65, 14);
    
    doc.setFontSize(10);
    doc.text("NÓMINA SEMANAL", 65, 19);
    doc.text("RADIOLOGÍA E IMAGEN", 65, 24);
    
    doc.setFont("helvetica", "normal");
    doc.text(`FECHA:      ${formatoFechaPDF(strInicio)}      AL      ${formatoFechaPDF(strFin)}`, 65, 32);

    let totalGeneral = 0;
    let totalSab = 0, totalMat = 0, totalLin = 0;
    
    const tableRows = datos.map((d, index) => {
      totalGeneral += d.total;
      totalSab += d.horasSabatinas;
      totalMat += d.horasMatutinas;
      totalLin += d.horasLinea;
      
      return [
        index + 1,
        d.nombre.toUpperCase(),
        formatoTiempo(d.horasSabatinas),
        formatoTiempo(d.horasMatutinas),
        formatoTiempo(d.horasLinea),
        `$${d.total.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        d.metodoPago,
        "" 
      ];
    });

    tableRows.push([
        "", "TOTAL", 
        formatoTiempo(totalSab), 
        formatoTiempo(totalMat), 
        formatoTiempo(totalLin), 
        `$${totalGeneral.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, "", ""
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["NO.", "DOCENTE", "SABATINOS", "MATUTINOS", "LÍNEA", "NÓMINA", "MÉTODO DE PAGO", "INCIDENCIAS"]],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { cellWidth: 65 },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'right', fontStyle: 'bold' },
        6: { halign: 'center' }
      },
      didParseCell: function(data) {
          if (data.row.index === tableRows.length - 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [240, 240, 240];
          }
      }
    });

    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 100) + 30;
    doc.setFontSize(8);
    
    const nombreRevisor = user 
        ? `${user.nombre || ''} ${user.apellidos || ''}`.trim().toUpperCase() || user.username?.toUpperCase() 
        : "ADMINISTRACIÓN";
    
    doc.text("REVISÓ:", 14, finalY);
    doc.line(35, finalY + 1, 100, finalY + 1);
    doc.text(nombreRevisor, 45, finalY - 3); 
    
    doc.text("FIRMA:", 14, finalY + 15);
    doc.line(35, finalY + 16, 100, finalY + 16);
    
    doc.line(160, finalY + 1, 260, finalY + 1);
    doc.text("NOMBRE QUIEN RECIBE", 190, finalY + 5);
    
    doc.line(160, finalY + 16, 260, finalY + 16);
    doc.text("FIRMA", 205, finalY + 20);

    doc.save(`Nomina_Semanal_${formatoFechaPDF(strInicio).replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans selection:bg-emerald-900/10 overflow-hidden">
        
      <MenuDocentes />

      <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-7xl mx-auto mb-6">
            <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 bg-emerald-600 rounded-full"></div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Módulo de Nómina</h1>
            </div>
        </div>

        <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-gray-100 max-w-xl w-full text-center">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Cierre de Nómina</h2>
          <p className="text-gray-500 font-medium mb-8">El sistema generará el corte de la semana actual con las horas registradas por los docentes.</p>
          
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Período a procesar</p>
              <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <p className="text-gray-700 font-bold text-sm">
                          Inicio: <span className="text-gray-900 capitalize">{inicio.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      </p>
                  </div>
                  <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <p className="text-gray-700 font-bold text-sm">
                          Cierre: <span className="text-gray-900 capitalize">{fin.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      </p>
                  </div>
              </div>
          </div>
          
          <button 
            onClick={generarNomina}
            disabled={cargando}
            className={`w-full bg-emerald-600 text-white p-5 rounded-2xl font-black tracking-wider shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all transform active:scale-95 ${cargando ? 'opacity-70 animate-pulse' : ''}`}
          >
            {cargando ? "PROCESANDO ASISTENCIAS..." : "GENERAR CORTE Y DESCARGAR"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default NominaPage;