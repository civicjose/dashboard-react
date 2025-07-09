import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// === EXPORTAR A PDF ===
export const exportToPdf = (data, filters) => {
  const doc = new jsPDF();
  const title = `Informe de KPI (${filters.desde} a ${filters.hasta})`;
  let finalY = 0;

  // ---- Título principal ----
  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229); // Morado
  doc.text(title, 14, 22);

  // ---- Resumen General ----
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  doc.text("Resumen General", 14, 32);
  autoTable(doc, {
    startY: 36,
    head: [['Métrica', 'Valor']],
    body: [
      ['Total Tickets Abiertos', data.totales.total_abiertos],
      ['Total Tickets Cerrados', data.totales.total_cerrados],
      ['T.M. Cierre Incidencias (Laboral)', data.tiempos.cierre_incidencias],
      ['T.M. Cierre Peticiones (Laboral)', data.tiempos.cierre_peticiones],
    ],
    headStyles: {
      fillColor: [79, 70, 229], // Morado
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { fontSize: 11 },
    didDrawPage: (data) => { finalY = data.cursor.y; }
  });

  // ---- Análisis por Tipo de Ticket ----
  doc.setFontSize(13);
  doc.text("Análisis por Tipo de Ticket", 14, finalY + 10);
  autoTable(doc, {
    startY: finalY + 14,
    head: [['Tipo', 'Abiertas', 'Cerradas', 'Media Cierres/Día', 'Pendientes Fin Mes']],
    body: [
      ['Incidencias', data.incidencias.abiertas, data.incidencias.cerradas, data.incidencias.media_cierres_dia, data.incidencias.pendientes_fin_mes],
      ['Solicitudes', data.solicitudes.abiertas, data.solicitudes.cerradas, data.solicitudes.media_cierres_dia, data.solicitudes.pendientes_fin_mes],
    ],
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { fontSize: 11 },
    didDrawPage: (data) => { finalY = data.cursor.y; }
  });

  // ---- Origen de los Tickets ----
  doc.setFontSize(13);
  doc.text("Origen de los Tickets", 14, finalY + 10);
  autoTable(doc, {
    startY: finalY + 14,
    head: [['Origen', 'Total']],
    body: data.origen.map(item => [item.nombre, item.total]),
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { fontSize: 11 }
  });

  // ---- Guardar PDF ----
  doc.save(`informe_kpi_${filters.desde}_${filters.hasta}.pdf`);
};


// === EXPORTAR A EXCEL ===
export const exportToExcel = async (data, filters) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Informe KPI');

  // ---- Colores y estilos ----
  const purple = 'FF4F46E5'; // Morado
  const white = 'FFFFFFFF';
  const grayHeader = 'FFE4E4E7';
  const boldFont = { bold: true };

  // ---- TÍTULO PRINCIPAL (combinado, centrado, color de fondo) ----
  sheet.mergeCells('A1:E1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `Informe de KPI (${filters.desde} a ${filters.hasta})`;
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.font = { bold: true, size: 16, color: { argb: white } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: purple } };

  let rowNum = 3; // Empieza tras título

  // ---- RESUMEN GENERAL ----
  sheet.getCell(`A${rowNum}`).value = "Resumen General";
  sheet.getCell(`A${rowNum}`).font = { bold: true, size: 13 };
  rowNum++;
  sheet.getRow(rowNum).values = ['Métrica', 'Valor'];
  sheet.getRow(rowNum).eachCell(cell => {
    cell.font = boldFont;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: purple } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { bold: true, color: { argb: white } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };
  });
  rowNum++;
  const resumenRows = [
    ['Total Tickets Abiertos', data.totales.total_abiertos],
    ['Total Tickets Cerrados', data.totales.total_cerrados],
    ['T.M. Cierre Incidencias (Laboral)', data.tiempos.cierre_incidencias],
    ['T.M. Cierre Peticiones (Laboral)', data.tiempos.cierre_peticiones]
  ];
  resumenRows.forEach(row => {
    sheet.getRow(rowNum).values = row;
    sheet.getRow(rowNum).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: grayHeader } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: cell.col === 1 ? 'left' : 'center' };
    });
    rowNum++;
  });
  rowNum++; // Línea en blanco

  // ---- ANÁLISIS POR TIPO DE TICKET ----
  sheet.getCell(`A${rowNum}`).value = "Análisis por Tipo de Ticket";
  sheet.getCell(`A${rowNum}`).font = { bold: true, size: 13 };
  rowNum++;
  sheet.getRow(rowNum).values = ['Tipo', 'Abiertas', 'Cerradas', 'Media Cierres/Día', 'Pendientes Fin Mes'];
  sheet.getRow(rowNum).eachCell(cell => {
    cell.font = boldFont;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: purple } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { bold: true, color: { argb: white } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };
  });
  rowNum++;
  // Incidencias
  sheet.getRow(rowNum).values = [
    'Incidencias',
    data.incidencias.abiertas,
    data.incidencias.cerradas,
    data.incidencias.media_cierres_dia,
    data.incidencias.pendientes_fin_mes
  ];
  sheet.getRow(rowNum).eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: grayHeader } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };
    cell.alignment = { vertical: 'middle', horizontal: cell.col === 1 ? 'left' : 'center' };
  });
  rowNum++;
  // Solicitudes
  sheet.getRow(rowNum).values = [
    'Solicitudes',
    data.solicitudes.abiertas,
    data.solicitudes.cerradas,
    data.solicitudes.media_cierres_dia,
    data.solicitudes.pendientes_fin_mes
  ];
  sheet.getRow(rowNum).eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: grayHeader } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };
    cell.alignment = { vertical: 'middle', horizontal: cell.col === 1 ? 'left' : 'center' };
  });
  rowNum += 2;

  // ---- ORIGEN DE LOS TICKETS ----
  sheet.getCell(`A${rowNum}`).value = "Origen de los Tickets";
  sheet.getCell(`A${rowNum}`).font = { bold: true, size: 13 };
  rowNum++;
  sheet.getRow(rowNum).values = ['Origen', 'Total'];
  sheet.getRow(rowNum).eachCell(cell => {
    cell.font = boldFont;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: purple } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = { bold: true, color: { argb: white } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };
  });
  rowNum++;
  // Origen data
  data.origen.forEach(item => {
    sheet.getRow(rowNum).values = [item.nombre, item.total];
    sheet.getRow(rowNum).eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: grayHeader } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: cell.col === 1 ? 'left' : 'center' };
    });
    rowNum++;
  });

  // ---- Ajustar anchos de columnas para presentación ----
  sheet.columns = [
    { width: 36 },
    { width: 20 },
    { width: 18 },
    { width: 24 },
    { width: 24 }
  ];

  // ---- Descargar archivo Excel ----
  const buffer = await workbook.xlsx.writeBuffer();
  const safeDesde = filters.desde.replace(/[^a-zA-Z0-9]/g, '-');
  const safeHasta = filters.hasta.replace(/[^a-zA-Z0-9]/g, '-');
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `informe_kpi_${safeDesde}_${safeHasta}.xlsx`);
};
