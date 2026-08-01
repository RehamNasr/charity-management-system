import type jsPDF from 'jspdf';

export interface ExportColumn<T> {
  header: string;
  /** Plain-value getter — export formats can't render arbitrary React nodes, unlike `DataTable`. */
  value: (row: T) => string | number;
}

/**
 * Exports rows to a real `.xlsx` workbook via ExcelJS (not the `xlsx`/SheetJS package — that one
 * ships an unpatched prototype-pollution/ReDoS advisory with no fix released; ExcelJS has no such
 * open advisory and this app only ever *writes* spreadsheets, never parses untrusted ones).
 *
 * `exceljs`/`file-saver` are loaded via dynamic `import()` so they (and jsPDF's own transitive
 * `html2canvas` dependency, pulled in by the PDF export below) only ever end up in the on-demand
 * chunk for pages that actually export something, not the app's main bundle.
 */
export async function exportRowsToExcel<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  sheetName = 'Sheet1',
): Promise<void> {
  const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
    import('exceljs'),
    import('file-saver'),
  ]);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName, { views: [{ rightToLeft: true }] });

  sheet.columns = columns.map((col) => ({ header: col.header, key: col.header, width: 22 }));
  sheet.getRow(1).font = { bold: true };

  for (const row of rows) {
    sheet.addRow(Object.fromEntries(columns.map((col) => [col.header, col.value(row)])));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
}

const ARABIC_FONT_NAME = 'Amiri';

/**
 * Registers the embedded Amiri font (SIL OFL — safe to bundle) with a jsPDF instance. jsPDF's
 * built-in fonts (Helvetica/Times/Courier) have zero Arabic glyphs, so Arabic report text would
 * otherwise render as blank boxes.
 *
 * Known limitation: this draws Arabic glyphs in isolated form (no cursive letter-joining/
 * shaping) — full shaping would need an Arabic text-shaping library, and the only maintained
 * npm option (`arabic-reshaper`) is GPL-3.0, which isn't safe to pull into this app without an
 * explicit licensing decision. Text is still fully readable; it just isn't visually cursive.
 */
async function registerArabicFont(doc: jsPDF): Promise<void> {
  const { AMIRI_REGULAR_BASE64 } = await import('@assets/fonts/amiri-font');
  doc.addFileToVFS('Amiri-Regular.ttf', AMIRI_REGULAR_BASE64);
  doc.addFont('Amiri-Regular.ttf', ARABIC_FONT_NAME, 'normal');
}

/** Exports rows to a paginated, RTL-aligned PDF table (jsPDF + autoTable) with Arabic-capable text. */
export async function exportRowsToPdf<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  title?: string,
): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF();
  await registerArabicFont(doc);
  doc.setFont(ARABIC_FONT_NAME);

  if (title) {
    doc.setFontSize(14);
    doc.text(title, doc.internal.pageSize.getWidth() - 14, 15, { align: 'right' });
  }

  autoTable(doc, {
    startY: title ? 22 : 14,
    head: [columns.map((col) => col.header)],
    body: rows.map((row) => columns.map((col) => String(col.value(row)))),
    styles: { font: ARABIC_FONT_NAME, fontSize: 9, halign: 'right' },
    headStyles: { fillColor: [25, 118, 210], halign: 'right' },
  });

  doc.save(`${fileName}.pdf`);
}
