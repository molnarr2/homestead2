// Deterministically generates the printable PDF log templates into
// public/printables/ (committed, CDN-served). Self-contained minimal PDF writer
// — no external dependency, so it runs in CI without a browser.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../public/printables')

const PAGE_W = 612 // Letter @ 72dpi
const PAGE_H = 792
const MARGIN = 48

const TEMPLATES = [
  { file: 'herd-inventory-log.pdf', title: 'Flock / Herd Inventory Log', cols: ['ID / Name', 'Species', 'Breed', 'Sex', 'Birth Date', 'Notes'] },
  { file: 'breeding-log.pdf', title: 'Breeding & Birth Log', cols: ['Dam', 'Sire', 'Cover Date', 'Due Date', 'Born', '# Offspring'] },
  { file: 'health-medication-record.pdf', title: 'Health & Medication Record', cols: ['Animal', 'Date', 'Treatment', 'Dose', 'Milk Safe', 'Meat/Egg Safe'] },
  { file: 'production-log.pdf', title: 'Production Log (Eggs / Milk / Honey)', cols: ['Date', 'Eggs', 'Milk (qt)', 'Honey (lb)', 'Notes'] },
  { file: 'deworming-vaccination-schedule.pdf', title: 'Deworming & Vaccination Schedule', cols: ['Date', 'Animal / Group', 'Task', 'Product', 'Done'] },
  { file: 'feed-cost-log.pdf', title: 'Feed & Cost Log', cols: ['Date', 'Feed Type', 'Weight (lb)', 'Cost', 'Notes'] },
]

const ROWS = 24

function esc(s) {
  return String(s).replace(/([()\\])/g, '\\$1')
}

function buildContent(title, cols) {
  const ops = []
  const tableTop = PAGE_H - MARGIN - 64
  const tableBottom = MARGIN + 24
  const rowH = (tableTop - tableBottom) / ROWS
  const colW = (PAGE_W - 2 * MARGIN) / cols.length

  // Title + subtitle
  ops.push('BT /F1 20 Tf', `1 0 0 1 ${MARGIN} ${PAGE_H - MARGIN - 8} Tm`, `(${esc(title)}) Tj`, 'ET')
  ops.push('BT /F2 10 Tf', `1 0 0 1 ${MARGIN} ${PAGE_H - MARGIN - 26} Tm`, '(Homestead Animals  -  homesteadkeeper.app  -  for planning only, not veterinary advice) Tj', 'ET')

  // Column headers
  ops.push('BT /F1 10 Tf')
  cols.forEach((c, i) => {
    ops.push(`1 0 0 1 ${MARGIN + i * colW + 4} ${tableTop + 6} Tm`, `(${esc(c)}) Tj`)
  })
  ops.push('ET')

  // Grid
  ops.push('0.6 0.6 0.6 RG 0.5 w')
  for (let r = 0; r <= ROWS; r++) {
    const y = tableBottom + r * rowH
    ops.push(`${MARGIN} ${y} m ${PAGE_W - MARGIN} ${y} l S`)
  }
  for (let c = 0; c <= cols.length; c++) {
    const x = MARGIN + c * colW
    ops.push(`${x} ${tableBottom} m ${x} ${tableTop} l S`)
  }
  return ops.join('\n')
}

function buildPdf(title, cols) {
  const content = buildContent(title, cols)
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = []
  objects.forEach((obj, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`
  })
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.forEach((off) => {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return Buffer.from(pdf, 'latin1')
}

mkdirSync(OUT_DIR, { recursive: true })
for (const t of TEMPLATES) {
  writeFileSync(resolve(OUT_DIR, t.file), buildPdf(t.title, t.cols))
  console.log(`generated printables/${t.file}`)
}
console.log(`✓ ${TEMPLATES.length} printables written to ${OUT_DIR}`)
