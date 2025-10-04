import type { ExportPayload } from '@/lib/types';

const encoder = new TextEncoder();

function escapePdfText(input: string) {
  return input.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function createPdfDocument(payload: ExportPayload) {
  const lines = [payload.title, ''.padEnd(72, '='), payload.columns.join(' | '), ''.padEnd(72, '-')];
  payload.rows.forEach((row) => {
    lines.push(row.map((value) => String(value)).join(' | '));
  });
  const escapedLines = lines.map((line) => `(${escapePdfText(line)}) Tj`);
  const contentText = ['BT', '/F1 12 Tf', '1 0 0 1 50 780 Tm', '14 TL', escapedLines.join(' T* '), 'ET'].join('\n');
  const contentBytes = encoder.encode(contentText);

  const header = '%PDF-1.4\n';
  const objects: string[] = [];

  const catalog = '<< /Type /Catalog /Pages 2 0 R >>';
  const pages = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  const page = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>';
  const content = `<< /Length ${contentBytes.length} >>\nstream\n${contentText}\nendstream`;
  const font = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  objects.push(catalog);
  objects.push(pages);
  objects.push(page);
  objects.push(content);
  objects.push(font);

  let position = header.length;
  const xrefEntries: string[] = ['0000000000 65535 f '];
  let body = '';

  objects.forEach((entry, index) => {
    const objectString = `${index + 1} 0 obj\n${entry}\nendobj\n`;
    body += objectString;
    xrefEntries.push(`${position.toString().padStart(10, '0')} 00000 n `);
    position += encoder.encode(objectString).length;
  });

  const xref = `xref\n0 ${objects.length + 1}\n${xrefEntries.join('\n')}\n`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${position}\n%%EOF`;
  const pdfContent = `${header}${body}${xref}${trailer}`;

  return {
    filename: `${payload.title.replace(/\s+/g, '-').toLowerCase()}.pdf`,
    content: pdfContent
  };
}
