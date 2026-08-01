import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { getNominaRequest } from '../../api/asistencias';
import { useDirectivo } from '../../context/DirectivoContext'; 
import logoEmpresa from '../../assets/logo1.png';
import MenuDocentes from '../../menu/MenuDocentes';

const NominaPage = () => {
  const [cargandoGeneral, setCargandoGeneral] = useState(false);
  const [cargandoZip, setCargandoZip] = useState(false);
  const { user } = useDirectivo(); 

  const [datosNomina, setDatosNomina] = useState([]);
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [resumen, setResumen] = useState({
      granTotal: 0,
      maestros: 0,
      incidencias: 0,
      topEarner: { nombre: '-', total: 0 }
  });

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
    
    if (hrs === 0 && mins === 0) return "0 hr";
    if (hrs === 0) return `${mins} min`;
    if (mins === 0) return `${hrs} hr`;
    return `${hrs} hr ${mins} min`;
  };

  // 👇 NUEVO EFECTO: Consulta los datos automáticamente al cambiar las fechas 👇
  useEffect(() => {
      const cargarPrevisualizacion = async () => {
          if (!fechaInicio || !fechaFin) return;
          
          setCargandoPreview(true);
          try {
              const res = await getNominaRequest(fechaInicio, fechaFin);
              const datos = res.data;
              setDatosNomina(datos);
              
              // Calcular métricas para el Dashboard
              let calcTotal = 0;
              let calcIncidencias = 0;
              let top = { nombre: '-', total: 0 };
              
              datos.forEach(d => {
                  calcTotal += d.total;
                  
                  if (d.incidencias && d.incidencias.trim() !== '') {
                      // Contamos las incidencias separadas por coma
                      calcIncidencias += d.incidencias.split(',').filter(i => i.trim() !== '').length;
                  }
                  
                  if (d.total > top.total) {
                      top = { nombre: d.nombre, total: d.total };
                  }
              });
              
              setResumen({
                  granTotal: calcTotal,
                  maestros: datos.length,
                  incidencias: calcIncidencias,
                  topEarner: top
              });

          } catch (error) {
              console.error("Error al cargar previsualización:", error);
          } finally {
              setCargandoPreview(false);
          }
      };

      cargarPrevisualizacion();
  }, [fechaInicio, fechaFin]);

  // Actualizamos la función para que use los datos que ya están en memoria
  const generarNomina = async (tipoRecibo) => {
      if (datosNomina.length === 0) {
          alert("No hay registros en este periodo para exportar.");
          return;
      }
      
      try {
          if (tipoRecibo === 'general') {
              setCargandoGeneral(true);
              descargarPDFGeneral(datosNomina, fechaInicio, fechaFin);
          } else {
              setCargandoZip(true);
              await descargarPDFIndividuales(datosNomina, fechaInicio, fechaFin);
          }
      } catch (error) {
          console.error(error);
          alert("Hubo un error al generar los documentos.");
      } finally {
          setCargandoGeneral(false);
          setCargandoZip(false);
      }
  };

  const descargarPDFGeneral = (datos, strInicio, strFin) => {
    const doc = new jsPDF('landscape');
    const formatoFechaPDF = (fechaStr) => fechaStr.split('-').reverse().join('/');
    
    doc.addImage(logoEmpresa, 'PNG', 14, 10, 40, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("UNIVERSIDAD SAN ANDRÉS DE GUANAJUATO", 148, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.text("REPORTE GENERAL DE NÓMINA (LISTA MAESTRA)", 148, 24, { align: 'center' });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Período de pago: ${formatoFechaPDF(strInicio)} al ${formatoFechaPDF(strFin)}`, 148, 30, { align: 'center' });

    let totalGeneral = 0;
    let totalSab = 0, totalDom = 0, totalMat = 0, totalLin = 0;
    
    const tableRows = datos.map((d, index) => {
      const listaIncidencias = d.incidencias ? d.incidencias : ""; 
      
      totalGeneral += d.total;
      totalSab += d.horasSabatinas || 0;
      totalDom += d.horasDominicales || 0;
      totalMat += d.horasMatutinas || 0;
      totalLin += d.horasLinea || 0;
      
      return [
        index + 1,
        d.nombre.toUpperCase(),
        formatoTiempo(d.horasSabatinas),
        formatoTiempo(d.horasDominicales), 
        formatoTiempo(d.horasMatutinas),
        formatoTiempo(d.horasLinea),
        `$${d.total.toFixed(2)}`, 
        d.metodoPago,
        listaIncidencias 
      ];
    });

    tableRows.push([
        { content: "TOTALES", colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
        formatoTiempo(totalSab), 
        formatoTiempo(totalDom), 
        formatoTiempo(totalMat), 
        formatoTiempo(totalLin), 
        { content: `$${totalGeneral.toFixed(2)}`, styles: { fontStyle: 'bold' } }, 
        "", ""
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["NO.", "DOCENTE", "SABATINOS", "DOMINICALES", "MATUTINOS", "LÍNEA", "TOTAL", "PAGO", "INCIDENCIAS"]],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { cellWidth: 55 }, 
        2: { halign: 'center' },
        3: { halign: 'center' }, 
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'right', fontStyle: 'bold' }, 
        7: { halign: 'center' }
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

        const horasTrabajadas = (docente.horasMatutinas || 0) + (docente.horasSabatinas || 0) + (docente.horasDominicales || 0) + (docente.horasLinea || 0);

        const dibujarRecibo = (startY, tipoCopia) => {
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

            doc.setFont("helvetica", "bold");
            doc.setTextColor(150, 150, 150);
            doc.text(tipoCopia, 160, startY + 8);
            doc.setTextColor(0, 0, 0);

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

            doc.setFillColor(245, 245, 245);
            doc.rect(20, startY + 45, 170, 6, 'F');
            doc.setFont("helvetica", "bold");
            doc.text("DETALLE DE HORAS E INCIDENCIAS", 22, startY + 49.5);

            doc.setFontSize(8);
            doc.text("Desglose de tiempo pagado:", 25, startY + 58);
            doc.setFont("helvetica", "normal");
            doc.text(`Matutinas: ${formatoTiempo(docente.horasMatutinas)}`, 30, startY + 63);
            doc.text(`Sabatinas: ${formatoTiempo(docente.horasSabatinas)}`, 30, startY + 68);
            doc.text(`Dominicales: ${formatoTiempo(docente.horasDominicales)}`, 30, startY + 73);
            doc.text(`En Línea: ${formatoTiempo(docente.horasLinea)}`, 30, startY + 78);

            doc.setFont("helvetica", "bold");
            doc.text("Reporte del Checador:", 110, startY + 58);
            doc.setFont("helvetica", "normal");
            doc.text(`Total Trabajado: ${formatoTiempo(horasTrabajadas)}`, 115, startY + 63);
            
            doc.text("Incidencias: ", 115, startY + 68);
            doc.setTextColor(239, 68, 68); 
            doc.text(docente.incidencias || "Ninguna reportada", 135, startY + 68, { maxWidth: 50 });
            doc.setTextColor(0, 0, 0);

            doc.line(20, startY + 85, 190, startY + 85);

            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text(`Horas Remuneradas: ${formatoTiempo(horasTrabajadas)}`, 25, startY + 92);

            doc.setFontSize(12);
            doc.text("TOTAL A PAGAR:", 100, startY + 92);
            doc.setFontSize(14);
            doc.setTextColor(16, 185, 129); 
            doc.text(`$${docente.total.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN`, 140, startY + 92);
            doc.setTextColor(0, 0, 0); 

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text("Recibí de conformidad la cantidad descrita arriba por concepto de mis servicios docentes.", 20, startY + 105);

            doc.line(60, startY + 125, 150, startY + 125);
            doc.setFont("helvetica", "bold");
            doc.text("FIRMA DEL MAESTRO(A)", 85, startY + 129);
        };

        dibujarRecibo(10, "COPIA DOCENTE");

        doc.setLineDashPattern([2, 2], 0);
        doc.line(10, 148, 200, 148);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.text("✂ Corte aquí para archivo de Administración", 105, 146, { align: 'center' });
        doc.setLineDashPattern([], 0); 

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
        
        <div className="w-full max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-1.5 bg-emerald-600 rounded-full"></div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Panel de Nómina</h1>
                </div>
                <p className="text-gray-500 font-medium ml-4">Previsualiza y genera los reportes de pago y recibos individuales.</p>
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-6">
          
          {/* PRIMERA FILA: FECHAS Y DASHBOARD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* SELECTOR DE FECHAS */}
              <div className="lg:col-span-4 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                      </div>
                      <div>
                          <h2 className="text-lg font-black text-gray-900">Periodo a Pagar</h2>
                          <p className="text-gray-400 text-xs font-bold">Modifica las fechas para recalcular</p>
                      </div>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 ml-1">Inicia el:</label>
                          <input 
                              type="date" 
                              value={fechaInicio}
                              onChange={(e) => setFechaInicio(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all cursor-pointer shadow-sm"
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-1.5 ml-1">Termina el:</label>
                          <input 
                              type="date" 
                              value={fechaFin}
                              onChange={(e) => setFechaFin(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all cursor-pointer shadow-sm"
                          />
                      </div>
                  </div>
              </div>

              {/* DASHBOARD DE MÉTRICAS */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                  
                  {/* Overlay de Carga */}
                  {cargandoPreview && (
                      <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center border border-gray-100">
                          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                          <span className="text-sm font-black text-emerald-800 tracking-widest uppercase">Calculando Nómina...</span>
                      </div>
                  )}

                  {/* Tarjeta 1: Gran Total */}
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[2rem] shadow-lg shadow-emerald-600/20 text-white flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-100">Gran Total Quincena</h3>
                          <div className="bg-white/20 p-2 rounded-xl">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                      </div>
                      <div>
                          <p className="text-4xl font-black tracking-tight">${resumen.granTotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                          <p className="text-emerald-200 text-sm mt-1 font-medium">Suma neta a dispersar</p>
                      </div>
                  </div>

                  {/* Tarjeta 2: Maestros Pagados */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Docentes a Pagar</h3>
                          <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          </div>
                      </div>
                      <div>
                          <p className="text-3xl font-black text-gray-900">{resumen.maestros}</p>
                          <p className="text-gray-500 text-sm mt-1 font-bold">Registros con asistencia</p>
                      </div>
                  </div>

                  {/* Tarjeta 3: Incidencias */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Alertas / Retardos</h3>
                          <div className="bg-orange-50 text-orange-500 p-2 rounded-xl">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          </div>
                      </div>
                      <div>
                          <p className={`text-3xl font-black ${resumen.incidencias > 0 ? 'text-orange-500' : 'text-gray-900'}`}>{resumen.incidencias}</p>
                          <p className="text-gray-500 text-sm mt-1 font-bold">Incidencias reportadas</p>
                      </div>
                  </div>

                  {/* Tarjeta 4: Mayor Pago */}
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Mayor Percepción</h3>
                          <div className="bg-purple-50 text-purple-600 p-2 rounded-xl">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                          </div>
                      </div>
                      <div>
                          <p className="text-xl font-black text-purple-700 truncate" title={resumen.topEarner.nombre}>{resumen.topEarner.nombre}</p>
                          <p className="text-gray-500 text-sm mt-1 font-bold">${resumen.topEarner.total.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN</p>
                      </div>
                  </div>

              </div>
          </div>

          {/* SEGUNDA FILA: DESCARGAS */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Generación de Reportes Oficiales</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Opción 1: Reporte General */}
                  <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors border border-gray-200 shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                          </div>
                          <div>
                              <h4 className="text-lg font-black text-gray-900">Lista Maestra de Pagos</h4>
                              <p className="text-gray-500 text-xs max-w-[200px] leading-relaxed">PDF consolidado con los totales para enviar a Finanzas.</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => generarNomina('general')}
                        disabled={cargandoGeneral || cargandoZip || datosNomina.length === 0}
                        className="w-full sm:w-auto shrink-0 px-6 py-3.5 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cargandoGeneral ? 'Generando...' : 'Descargar PDF'}
                      </button>
                  </div>

                  {/* Opción 2: Recibos ZIP */}
                  <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-gray-200 shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                          </div>
                          <div>
                              <h4 className="text-lg font-black text-gray-900">Recibos Individuales</h4>
                              <p className="text-gray-500 text-xs max-w-[200px] leading-relaxed">Archivo .zip con los recibos de firma separados por docente.</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => generarNomina('individual')}
                        disabled={cargandoGeneral || cargandoZip || datosNomina.length === 0}
                        className="w-full sm:w-auto shrink-0 px-6 py-3.5 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cargandoZip ? 'Comprimiendo...' : 'Descargar ZIP'}
                      </button>
                  </div>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NominaPage;