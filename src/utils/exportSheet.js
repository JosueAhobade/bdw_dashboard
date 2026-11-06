import * as XLSX from "xlsx";

/**
 * Exporte des lignes (objets) en Excel ou en CSV.
 * CSV : séparateur ";" + BOM UTF-8 pour Excel en français.
 */
export const exportRows = (rows, filename, format, sheetName = "Export") => {
  const sheet = XLSX.utils.json_to_sheet(rows);

  if (format === "xlsx") {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName.slice(0, 31));
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    return;
  }

  const csv = XLSX.utils.sheet_to_csv(sheet, { FS: ";" });
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const today = () => new Date().toISOString().slice(0, 10);
