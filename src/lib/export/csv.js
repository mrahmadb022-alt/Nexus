// CSV for Excel: UTF-8 BOM first (otherwise Excel decodes Hebrew/Arabic as mojibake), CRLF line
// endings, RFC 4180 quoting, and formula-injection guarding for cells a client could have typed.

export const BOM = '﻿'

function escapeCell(value) {
  if (value === null || value === undefined) return ''
  let s = String(value)
  // =, +, -, @ at the start make Excel evaluate the cell as a formula.
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** @param {string[]} headers @param {(string|number|null)[][]} rows */
export function toCsv(headers, rows) {
  return BOM + [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n') + '\r\n'
}
