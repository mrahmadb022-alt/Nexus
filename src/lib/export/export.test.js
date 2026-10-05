import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import { BOM, toCsv } from './csv'
import { toXlsx } from './xlsx'
import { buildDataset, formatMoneyCellsForCsv } from './datasets'

describe('toCsv', () => {
  it('starts with a UTF-8 BOM and uses CRLF', () => {
    const csv = toCsv(['תאריך', 'לקוחה'], [['2026-10-01', 'דנה']])
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv.startsWith(BOM)).toBe(true)
    expect(csv).toBe('﻿תאריך,לקוחה\r\n2026-10-01,דנה\r\n')
    // Encoded bytes start with EF BB BF.
    expect([...new TextEncoder().encode(csv).slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
  })

  it('quotes commas, quotes and newlines; guards formulas', () => {
    const csv = toCsv(['a'], [['x,y'], ['say "hi"'], ['=SUM(A1)'], ['-5'], [12.5], [null]])
    expect(csv.slice(1).split('\r\n').slice(1, 7)).toEqual(['"x,y"', '"say ""hi"""', "'=SUM(A1)", "'-5", '12.5', ''])
    expect(toCsv(['a'], [['two\nlines']])).toContain('"two\nlines"')
  })
})

describe('toXlsx', () => {
  it('writes a valid zip with an RTL sheet, inline strings and numeric money cells', () => {
    const bytes = toXlsx({ sheetName: 'הכנסות', headers: ['שם', 'סכום'], rows: [['דנה & <בת>', 150]], moneyColumns: [1], rtl: true })
    const files = unzipSync(bytes)
    expect(Object.keys(files)).toEqual(
      expect.arrayContaining(['[Content_Types].xml', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml', 'xl/styles.xml']),
    )
    const sheet = strFromU8(files['xl/worksheets/sheet1.xml'])
    expect(sheet).toContain('rightToLeft="1"')
    expect(sheet).toContain('דנה &amp; &lt;בת&gt;')
    expect(sheet).toContain('<c r="B2" s="1"><v>150</v></c>')
    expect(strFromU8(files['xl/workbook.xml'])).toContain('name="הכנסות"')
  })
})

describe('buildDataset', () => {
  const t = (k) => `[${k}]`
  const bookings = [
    {
      date: '2026-10-02',
      time: '10:00',
      clientName: 'Dana',
      clientPhone: '0541234567',
      serviceName: 'Gel',
      staffName: 'Sarah',
      status: 'completed',
      priceAgorot: 15000,
      paymentStatus: 'paid',
      paymentMethod: 'bit',
      amountPaidAgorot: 15000,
    },
    { date: '2026-10-01', time: '09:00', clientName: 'Noa', clientPhone: '', serviceName: 'Mani', status: 'confirmed', priceAgorot: 8000 },
  ]
  const expenses = [{ date: '2026-10-03', category: 'rent', note: 'October', amountAgorot: 350050 }]
  const range = { bookings, expenses, from: '2026-10-01', to: '2026-10-31', t }

  it('localizes headers and sorts rows by date/time', () => {
    const ds = buildDataset('bookings', range)
    expect(ds.headers[0]).toBe('[export.col.date]')
    expect(ds.rows[0][2]).toBe('Noa')
    expect(ds.rows[0][8]).toBe('[payment.status.unpaid]')
    expect(ds.rows[1][3]).toBe('054-123-4567')
    expect(ds.rows[1][10]).toBe('[payment.method.bit]')
  })

  it('keeps only paid bookings in income and formats money for CSV', () => {
    expect(buildDataset('income', range).rows).toEqual([['2026-10-02', 'Dana', 'Gel', '[payment.method.bit]', 150]])
    expect(formatMoneyCellsForCsv(buildDataset('expenses', range))).toEqual([
      ['2026-10-03', '[expense.category.rent]', 'October', '3500.50'],
    ])
  })
})
