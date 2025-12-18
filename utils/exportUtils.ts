
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export const exportToImage = async (elementId: string, format: 'png' | 'jpg', filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    backgroundColor: '#0a0a0b',
    scale: 2, // Higher resolution
    logging: false,
    useCORS: true
  });

  const dataUrl = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 1.0);
  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = dataUrl;
  link.click();
};

export const exportToPDF = async (title: string, sections: { heading: string, content: string }[], filename: string) => {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246);
  doc.text("SONIC AI - ENGINEERING REPORT", margin, y);
  y += 15;

  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(title, margin, y);
  y += 10;
  doc.line(margin, y, 190, y);
  y += 10;

  sections.forEach(section => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(section.heading.toUpperCase(), margin, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(section.content, 170);
    doc.text(splitText, margin, y);
    y += (splitText.length * 5) + 10;
  });

  doc.save(`${filename}.pdf`);
};

export const exportToDocx = async (title: string, sections: { heading: string, content: string }[], filename: string) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "SONIC AI - TECHNICAL MANUAL",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: title,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        ...sections.flatMap(s => [
          new Paragraph({
            text: s.heading,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun(s.content)],
            spacing: { after: 200 },
          }),
        ]),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.docx`;
  link.click();
};
