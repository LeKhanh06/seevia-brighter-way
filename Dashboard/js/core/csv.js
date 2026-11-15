/* Tạo và tải CSV: UTF-8 có BOM để Excel đọc đúng tiếng Việt; chống CSV injection bằng dấu nháy đơn. */
const guard = v => (typeof v === "string" && /^[=+\-@\t\r]/.test(v) && !/^-?\d+([.,]\d+)?$/.test(v) ? `'${v}` : v);
const quote = v => `"${String(guard(v ?? "")).replaceAll('"', '""')}"`;

export function buildCsv(headers, rows) {
  return [headers, ...rows].map(row => row.map(quote).join(",")).join("\r\n");
}

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(filename, headers, rows) {
  downloadBlob(filename, new Blob(["﻿", buildCsv(headers, rows)], { type: "text/csv;charset=utf-8" }));
}
