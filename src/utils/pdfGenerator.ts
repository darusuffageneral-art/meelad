import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Participant, Category, Gender, Team } from '../types';

export interface PdfReportOptions {
  team: Team | 'All';
  category: Category | 'All';
  gender: Gender | 'All';
  competitionName: string;
  participants: Participant[];
  appName?: string;
}

export const generatePdfReport = (options: PdfReportOptions) => {
  const { team, category, gender, competitionName, participants, appName = 'SPRING MEELAD ART FEST' } = options;

  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Color palette
  const primaryColor = [0, 87, 255]; // #0057FF
  const darkBg = [15, 23, 42]; // #0f172a
  const textColor = [30, 41, 59];
  const mutedText = [100, 116, 139];

  // 1. Header Banner Background (Deep Navy Blue)
  doc.setFillColor(10, 20, 45);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Top Accent line (Bright Blue Glow)
  doc.setFillColor(0, 168, 255);
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  // 2. Art Fest Emblem Logo (Vector drawn in PDF)
  doc.setFillColor(0, 87, 255);
  doc.circle(22, 21, 10, 'F');
  doc.setFillColor(0, 168, 255);
  doc.circle(22, 21, 6, 'F');
  doc.setFillColor(255, 255, 255);
  doc.circle(22, 21, 2.5, 'F');

  // 3. Header Text & Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(appName, 38, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(180, 210, 255);
  doc.text('THEYYOTTUCHIRA — OFFICIAL COMPETITION PARTICIPANTS REPORT', 38, 26);

  // Date on top right
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.setFontSize(8.5);
  doc.setTextColor(200, 220, 255);
  doc.text(`Generated: ${formattedDate}`, pageWidth - 14, 20, { align: 'right' });
  doc.text('Status: Verified Record', pageWidth - 14, 26, { align: 'right' });

  // 4. Filter Metadata Summary Cards
  let startY = 48;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, startY, pageWidth - 28, 22, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  // Grid labels
  doc.text('TEAM:', 18, startY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(team, 32, startY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('CATEGORY:', 75, startY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(category, 98, startY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('GENDER:', 140, startY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(gender, 158, startY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('COMPETITION:', 18, startY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(competitionName || 'All Competitions', 46, startY + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PARTICIPANTS:', 140, startY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 87, 255);
  doc.text(`${participants.length}`, 182, startY + 16);

  // 5. Student List Table
  const tableData = participants.map((p, index) => {
    const assigned = Array.isArray(p.assignedCompetitions) && p.assignedCompetitions.length > 0
      ? p.assignedCompetitions
      : p.competitionName ? [p.competitionName] : [];
    const compText = assigned.length > 0
      ? assigned.map((c, i) => `${i + 1}. ${c}`).join('\n')
      : '-';

    return [
      (index + 1).toString(),
      p.studentName,
      p.class,
      p.team,
      p.category,
      p.gender,
      compText
    ];
  });

  autoTable(doc, {
    startY: startY + 28,
    head: [['SL', 'Student Name', 'Class', 'Team', 'Category', 'Gender', 'Competition Name']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 87, 255],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 38 },
      2: { cellWidth: 20 },
      3: { cellWidth: 22 },
      4: { cellWidth: 25 },
      5: { cellWidth: 18 },
      6: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Page footer
      const currentPage = data.pageNumber;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);

      // Footer line
      doc.setDrawColor(226, 232, 240);
      doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

      doc.text('Spring Meelad Art Fest, Theyyottuchira — Official Verification Report', 14, pageHeight - 10);
      doc.text(`Page ${currentPage}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }
  });

  // 6. Signatures section at bottom of final page
  // @ts-ignore
  const finalY = (doc as any).lastAutoTable?.finalY || startY + 40;
  
  if (finalY < pageHeight - 40) {
    const sigY = pageHeight - 32;
    doc.setDrawColor(203, 213, 225);
    
    // Convener Signature
    doc.line(20, sigY, 70, sigY);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Art Fest Convener', 32, sigY + 5);

    // Chief Judge Signature
    doc.line(90, sigY, 140, sigY);
    doc.text('Chief Judge', 108, sigY + 5);

    // Principal Signature
    doc.line(150, sigY, 195, sigY);
    doc.text('Principal / Admin', 162, sigY + 5);
  }

  // Save the PDF
  const filename = `Art_Fest_Report_${team.replace(' ', '_')}_${category}_${new Date().getTime()}.pdf`;
  doc.save(filename);
};

export const generateCompetitionPrintSheet = (competitionName: string, participantList: any[], appName = 'SPRING MEELAD ART FEST') => {
  // Initialize A4 Portrait PDF
  const doc = new jsPDF('p', 'mm', 'a4');

  // Header Information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('KAMMUSUFI SUNI CENTRE MADRASA', 105, 15, { align: 'center' });

  doc.setFontSize(14);
  doc.text(`${appName} - THEYYOTTUCHIRA`, 105, 23, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`COMPETITION SHEET: ${competitionName.toUpperCase()}`, 105, 31, { align: 'center' });

  doc.line(14, 35, 196, 35); // Horizontal divider line

  // Map participant data into table rows
  const tableRows = participantList.map((student, index) => [
    index + 1,
    student.studentName || student.name || 'Participant',
    student.team || '-',
    student.codeLetter || '-', // Code letter column
    '' // Blank space for manual signatures during the event
  ]);

  // Generate A4 Table
  autoTable(doc, {
    startY: 40,
    head: [['Sl No', 'Student Name', 'Team', 'Code Letter', 'Signature']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 31, 63], // Deep Blue Header Theme
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' }, // Serial Number
      1: { cellWidth: 65 },                  // Student Name
      2: { cellWidth: 30, halign: 'center' }, // Team Cairo / Cordoba
      3: { cellWidth: 35, halign: 'center' }, // Code Letter
      4: { cellWidth: 45 }                   // Signature Column Width
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    }
  });

  // Save the PDF file
  const sanitizedName = competitionName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${sanitizedName}_Attendance_Sheet.pdf`);
};

