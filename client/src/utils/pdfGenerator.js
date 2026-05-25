import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generatePDF(elementId, filename = 'invoice.pdf') {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Invoice element not found');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;

  pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
  pdf.save(filename);
}

export async function printInvoice(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  });

  const dataUrl = canvas.toDataURL('image/png');
  const win = window.open('');
  win.document.write(`
    <html><head><title>Print Invoice</title>
    <style>
      body { margin: 0; padding: 0; }
      img { width: 100%; max-width: 800px; display: block; margin: auto; }
      @media print { body { margin: 0; } img { width: 100%; } }
    </style></head>
    <body><img src="${dataUrl}" /></body></html>
  `);
  win.document.close();
  setTimeout(() => { win.print(); }, 500);
}

export function shareOnWhatsApp(invoiceData) {
  const text = encodeURIComponent(
    `*${invoiceData.companyName}*\n` +
    `Invoice #${invoiceData.billNumber} for ${invoiceData.customerName}\n` +
    `Amount: ₹${invoiceData.grandTotal?.toLocaleString('en-IN') || invoiceData.totalAmount?.toLocaleString('en-IN')}\n` +
    `Date: ${new Date(invoiceData.date).toLocaleDateString('en-IN')}`
  );
  window.open(`https://wa.me/?text=${text}`, '_blank');
}
