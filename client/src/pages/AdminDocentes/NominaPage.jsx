import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { getNominaRequest } from '../../api/asistencias';
import { useDirectivo } from '../../context/DirectivoContext'; 
import logoEmpresa from '../../assets/logo.png';
import MenuDocentes from '../../menu/MenuDocentes';

const NominaPage = () => {
  const [cargandoGeneral, setCargandoGeneral] = useState(false);
  const [cargandoZip, setCargandoZip] = useState(false);
  const { user } = useDirectivo(); 

  const formatearFechaLocal = (fecha) => {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const obtenerPeriodoActual = () => {
    const hoy = new Date();
    const diasParaJueves = (hoy.getDay() + 3) % 7; 
    
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - diasParaJueves);
    
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    
    return { 
        inicioStr: formatearFechaLocal(inicio), 
        finStr: formatearFechaLocal(fin) 
    };
  };

  const periodoPorDefecto = obtenerPeriodoActual();
  const [fechaInicio, setFechaInicio] = useState(periodoPorDefecto.inicioStr);
  const [fechaFin, setFechaFin] = useState(periodoPorDefecto.finStr);

  const formatoTiempo = (horasDecimales) => {
    if (!horasDecimales || horasDecimales <= 0) return "0 hr";
    const hrs = Math.floor(horasDecimales);
    const mins = Math.round((horasDecimales - hrs) * 60);
    
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs} hr ${mins} min`;
  };

  const generarNomina = async (tipoRecibo) => {
    try {
      if (tipoRecibo === 'general') setCargandoGeneral(true);
      if (tipoRecibo === 'individual') setCargandoZip(true);

      const res = await getNominaRequest(fechaInicio, fechaFin);
      
      if(res.data.length === 0) {
        alert("No se encontraron registros completos en este periodo.");
        return;
      }
      
      if (tipoRecibo === 'general') {
          descargarPDFGeneral(res.data, fechaInicio, fechaFin);
      } else {
          await descargarPDFIndividuales(res.data, fechaInicio, fechaFin);
      }
      
    } catch (error) {
      console.error(error);
      alert("Hubo un error al generar la nómina.");
    } finally {
      setCargandoGeneral(false);
      setCargandoZip(false);
    }
  };

  const descargarPDFGeneral = (datos, strInicio, strFin) => {
    const doc = new jsPDF('landscape');
    const formatoFechaPDF = (fechaStr) => fechaStr.split('-').reverse().join('/');
    
    doc.addImage(logoEmpresa, 'PNG', 14, 10, 45, 28);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("UNIVERSIDAD SAN ANDRÉS DE GUANAJUATO", 65, 14);
    
    doc.setFontSize(10);
    doc.text("REPORTE GENERAL DE NÓMINA (LISTA MAESTRA)", 65, 19);
    
    doc.setFont("helvetica", "normal");
    doc.text(`PERÍODO:      ${formatoFechaPDF(strInicio)}      AL      ${formatoFechaPDF(strFin)}`, 65, 28);

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
        `$${d.total.toLocaleString('es-MX', {minimumFractionDigits: 2})}`,
        d.metodoPago,
        "" 
      ];
    });

    tableRows.push([
        "", "TOTAL", 
        formatoTiempo(totalSab), 
        formatoTiempo(totalMat), 
        formatoTiempo(totalLin), 
        `$${totalGeneral.toLocaleString('es-MX', {minimumFractionDigits: 2})}`, "", ""
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["NO.", "DOCENTE", "SABATINOS", "MATUTINOS", "LÍNEA", "TOTAL", "PAGO", "INCIDENCIAS"]],
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
    const nombreRevisor = user 
        ? `${user.nombre || ''} ${user.apellidos || ''}`.trim().toUpperCase() || user.username?.toUpperCase() 
        : "ADMINISTRACIÓN";
    
    doc.setFontSize(8);
    doc.text("AUTORIZÓ:", 14, finalY);
    doc.line(35, finalY + 1, 100, finalY + 1);
    doc.text(nombreRevisor, 45, finalY - 3); 
    doc.text("FIRMA:", 14, finalY + 15);
    doc.line(35, finalY + 16, 100, finalY + 16);
    
    doc.save(`Reporte_General_Nomina_${formatoFechaPDF(strInicio).replace(/\//g, '-')}.pdf`);
  };

const descargarPDFIndividuales = async (datos, strInicio, strFin) => {
    const zip = new JSZip(); 
    const formatoFechaPDF = (fechaStr) => fechaStr.split('-').reverse().join('/');
    const fechaImpresion = new Date().toLocaleDateString('es-MX');

    datos.forEach((docente) => {
        const doc = new jsPDF('portrait'); 

        // Cálculos de horas
        const horasTrabajadas = (docente.horasMatutinas || 0) + (docente.horasSabatinas || 0) + (docente.horasLinea || 0);
        const horasAsignadas = docente.horasAsignadas || horasTrabajadas; 
        const faltas = docente.faltas || (horasAsignadas > horasTrabajadas ? horasAsignadas - horasTrabajadas : 0);

        // FUNCIÓN AUXILIAR: Dibuja un recibo indicándole a qué altura empezar (startY)
        const dibujarRecibo = (startY, tipoCopia) => {
            // Logo y Encabezado
            doc.addImage(logoEmpresa, 'PNG', 20, startY, 35, 20); 

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("RECIBO DE PAGO DOCENTE", 65, startY + 8);
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text("Universidad San Andrés de Guanajuato", 65, startY + 13);
            
            doc.setFontSize(8);
            doc.text(`Periodo: ${formatoFechaPDF(strInicio)} al ${formatoFechaPDF(strFin)}`, 65, startY + 18);
            doc.text(`Emisión: ${fechaImpresion}`, 150, startY + 18);

            // Etiqueta (ORIGINAL / COPIA ESCUELA)
            doc.setFont("helvetica", "bold");
            doc.setTextColor(150, 150, 150);
            doc.text(tipoCopia, 160, startY + 8);
            doc.setTextColor(0, 0, 0);

            // DATOS DEL MAESTRO
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(245, 245, 245);
            doc.rect(20, startY + 25, 170, 6, 'F');
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text("DATOS DEL MAESTRO", 22, startY + 29.5);

            doc.setFont("helvetica", "normal");
            doc.text(`Nombre:`, 22, startY + 37);
            doc.setFont("helvetica", "bold");
            doc.text(`${docente.nombre.toUpperCase()}`, 40, startY + 37);
            
            doc.setFont("helvetica", "normal");
            doc.text(`Pago vía:`, 130, startY + 37);
            doc.setFont("helvetica", "bold");
            doc.text(`${docente.metodoPago}`, 148, startY + 37);

            // DETALLE DE HORAS
            doc.setFillColor(245, 245, 245);
            doc.rect(20, startY + 45, 170, 6, 'F');
            doc.setFont("helvetica", "bold");
            doc.text("DETALLE DE HORAS TRABAJADAS", 22, startY + 49.5);

            doc.setFontSize(8);
            doc.text("Desglose por turno:", 25, startY + 58);
            doc.setFont("helvetica", "normal");
            doc.text(`Matutinas: ${formatoTiempo(docente.horasMatutinas)}`, 30, startY + 63);
            doc.text(`Sabatinas: ${formatoTiempo(docente.horasSabatinas)}`, 30, startY + 68);
            doc.text(`En Línea: ${formatoTiempo(docente.horasLinea)}`, 30, startY + 73);

            doc.setFont("helvetica", "bold");
            doc.text("Resumen de cobertura:", 110, startY + 58);
            doc.setFont("helvetica", "normal");
            doc.text(`Horas Asignadas: ${formatoTiempo(horasAsignadas)}`, 115, startY + 63);
            doc.text(`Horas Trabajadas: ${formatoTiempo(horasTrabajadas)}`, 115, startY + 68);
            doc.text("Faltas: ", 115, startY + 73);
            doc.setTextColor(239, 68, 68); // Rojo
            doc.text(formatoTiempo(faltas), 127, startY + 73);
            doc.setTextColor(0, 0, 0);

            doc.line(20, startY + 80, 190, startY + 80);

            // TOTALES
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text(`Total Horas Pagadas: ${formatoTiempo(horasTrabajadas)}`, 25, startY + 87);

            doc.setFontSize(12);
            doc.text("TOTAL A PAGAR:", 100, startY + 87);
            doc.setFontSize(14);
            doc.setTextColor(16, 185, 129); // Verde
            doc.text(`$${docente.total.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN`, 140, startY + 87);
            doc.setTextColor(0, 0, 0); 

            // FIRMA
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text("Recibí de conformidad la cantidad descrita arriba por concepto de mis servicios docentes.", 20, startY + 100);

            doc.line(60, startY + 120, 150, startY + 120);
            doc.setFont("helvetica", "bold");
            doc.text("FIRMA DEL MAESTRO(A)", 85, startY + 124);
        };

        // 1. Imprimimos el primer recibo en la parte superior (Y = 10)
        dibujarRecibo(10, "COPIA DOCENTE");

        // 2. Dibujamos la línea punteada a la mitad de la hoja (Y = 148 es la mitad de A4)
        doc.setLineDashPattern([2, 2], 0);
        doc.line(10, 148, 200, 148);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.text("✂ Corte aquí para archivo de Administración", 105, 146, { align: 'center' });
        doc.setLineDashPattern([], 0); // Regresamos a línea normal

        // 3. Imprimimos el segundo recibo en la parte inferior (Y = 155)
        dibujarRecibo(155, "COPIA ESCUELA");

        const pdfBlob = doc.output('blob');
        const nombreArchivo = `Recibo_${docente.nombre.replace(/\s+/g, '_')}.pdf`;
        zip.file(nombreArchivo, pdfBlob);
    });

    const contenidoZip = await zip.generateAsync({ type: 'blob' });
    saveAs(contenidoZip, `Recibos_Maestros_${formatoFechaPDF(strInicio).replace(/\//g, '-')}.zip`);
  };
  return (
    <div className="flex h-screen bg-gray-50 font-sans selection:bg-emerald-900/10 overflow-hidden">
        
      <MenuDocentes />

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        
        <div className="w-full max-w-6xl mx-auto mb-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-1.5 bg-emerald-600 rounded-full"></div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Panel de Nómina</h1>
            </div>
            <p className="text-gray-500 font-medium ml-4">Genera los reportes de pago para administración y los recibos individuales para los maestros.</p>
        </div>

        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA: CALENDARIO */}
          <div className="lg:col-span-5">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden h-full">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                  </div>
                  
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Elegir Fechas</h2>
                  <p className="text-gray-500 text-sm mb-8">Selecciona el lunes de inicio y el domingo de cierre de la semana que quieres pagar.</p>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 ml-1">Inicia el:</label>
                          <input 
                              type="date" 
                              value={fechaInicio}
                              onChange={(e) => setFechaInicio(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all cursor-pointer shadow-sm"
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 ml-1">Termina el:</label>
                          <input 
                              type="date" 
                              value={fechaFin}
                              onChange={(e) => setFechaFin(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all cursor-pointer shadow-sm"
                          />
                      </div>
                  </div>
              </div>
          </div>

          {/* COLUMNA DERECHA: DESCARGAS */}
          <div className="lg:col-span-7 space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">¿Qué deseas descargar?</h3>
              
              {/* Opción 1: Reporte General */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors border border-emerald-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                      </div>
                      <div>
                          <h4 className="text-lg font-black text-gray-900">Lista Maestra de Pagos</h4>
                          <p className="text-gray-500 text-xs max-w-xs leading-relaxed">Un solo archivo con los nombres de todos los profes y cuánto se le debe pagar a cada uno.</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => generarNomina('general')}
                    disabled={cargandoGeneral || cargandoZip}
                    className="shrink-0 px-6 py-3.5 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {cargandoGeneral ? 'Cargando...' : 'Bajar Lista'}
                  </button>
              </div>

              {/* Opción 2: Recibos ZIP */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                      </div>
                      <div>
                          <h4 className="text-lg font-black text-gray-900">Recibos Individuales</h4>
                          <p className="text-gray-500 text-xs max-w-xs leading-relaxed">Una carpeta comprimida (.zip) con los comprobantes de cada maestro por separado.</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => generarNomina('individual')}
                    disabled={cargandoGeneral || cargandoZip}
                    className="shrink-0 px-6 py-3.5 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {cargandoZip ? 'Comprimiendo...' : 'Bajar Carpeta'}
                  </button>
              </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default NominaPage;