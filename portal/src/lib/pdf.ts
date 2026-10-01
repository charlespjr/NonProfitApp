/**
 * Client-side "download signed copy" — renders a document plus its electronic
 * signature block to a branded, multi-page PDF entirely in the browser (jsPDF,
 * dynamically imported so it never weighs down the main bundle). No server
 * round-trip and no third-party signing service.
 *
 * The layout follows the FORCATA house style (design_handoff): a running
 * header (logo + organization name / document title), a running footer with
 * the company address and website, a centered title block, steel-labelled
 * ARTICLE headings, hanging-indent numbered sections with a bold navy lead-in,
 * a certificate box, and a signatures page with the signers' cursive marks.
 * Palette: navy #1f3347, steel #3f6a8a, ink #1d222b, gray #5a606b.
 */
import type { SignatureRecord } from '../types'

export interface PdfSigner {
  name: string
  role: string
  record?: SignatureRecord
}

export interface SignedPdfInput {
  orgName: string
  /** Optional logo data-URL (PNG/JPEG) for the header + title block. */
  orgLogo?: string
  docName: string
  bodyText: string
  signers: PdfSigner[]
  /** Name written on the document's "Secretary: ____" certificate line. */
  secretaryName?: string
  /** Footer left — the company's address (e.g. "123 Main St · City, ST 00000"). */
  footerAddress?: string
  /** Footer right — the company's website (e.g. "www.example.com"). */
  footerWebsite?: string
  /** Italic subtitle under the title (e.g. foreign-registration note). */
  subtitle?: string
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const SCRIPT_STACK = "'Snell Roundhand','Segoe Script','Brush Script MT','Bradley Hand',cursive"

/** Render a name in a handwriting font to a hi-dpi PNG data-URL. */
function cursiveImage(text: string, fontPx = 72): { url: string; w: number; h: number } | null {
  try {
    if (!text) return null
    const font = `italic 400 ${fontPx}px ${SCRIPT_STACK}`
    const pad = 10
    const meas = document.createElement('canvas').getContext('2d')
    if (!meas) return null
    meas.font = font
    const textW = Math.max(1, meas.measureText(text).width)
    const w = Math.ceil(textW) + pad * 2
    const h = Math.ceil(fontPx * 1.5)
    const scale = 3
    const canvas = document.createElement('canvas')
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.scale(scale, scale)
    ctx.font = font
    ctx.fillStyle = '#1f3347'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, pad, h / 2)
    return { url: canvas.toDataURL('image/png'), w, h }
  } catch {
    return null
  }
}

const SMALL_WORDS = new Set(['of', 'the', 'and', 'a', 'an', 'to', 'for', 'in', 'on', 'or', 'by', 'at', 'as', 'with'])
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

type RGB = [number, number, number]

export async function exportSignedPdf(input: SignedPdfInput): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const marginL = 54
  const marginR = 54
  const contentW = pageW - marginL - marginR
  const contentTop = 92
  const contentBottom = pageH - 66

  // House palette
  const NAVY: RGB = [31, 51, 71]
  const STEEL: RGB = [63, 106, 138]
  const INK: RGB = [29, 34, 43]
  const GRAY: RGB = [90, 96, 107]
  const RULE: RGB = [201, 204, 208]
  const set = (c: RGB) => doc.setTextColor(c[0], c[1], c[2])
  const draw = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2])

  const orgUpper = input.orgName.toUpperCase()
  const docUpper = input.docName.toUpperCase()

  // ---- logo: measure aspect once so it isn't stretched
  let logoAspect = 1
  if (input.orgLogo) {
    try {
      const props = doc.getImageProperties(input.orgLogo)
      if (props.width && props.height) logoAspect = props.width / props.height
    } catch {
      /* ignore; fall back to square */
    }
  }
  const logoFmt = input.orgLogo?.includes('image/png') ? 'PNG' : 'JPEG'

  // Running header + footer, painted on every page.
  const paintChrome = () => {
    let hx = marginL
    if (input.orgLogo) {
      const h = 14
      const w = h * logoAspect
      try {
        doc.addImage(input.orgLogo, logoFmt, hx, 33, w, h, undefined, 'FAST')
        hx += w + 8
      } catch {
        /* skip */
      }
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    set(NAVY)
    doc.text(orgUpper, hx, 43, { charSpace: 1.2 })
    const orgRight = hx + doc.getTextWidth(orgUpper) + 1.2 * Math.max(0, orgUpper.length - 1)
    // Right-aligned document title. jsPDF's align:'right' ignores charSpace and
    // overflows past the margin, so position it by its true (letter-spaced)
    // width; shrink spacing/size if it would collide with the org name.
    doc.setFont('helvetica', 'normal')
    set(GRAY)
    let hCs = 1.2
    let hSize = 8
    const avail = pageW - marginR - orgRight - 16
    doc.setFontSize(hSize)
    const twOf = () => doc.getTextWidth(docUpper) + hCs * Math.max(0, docUpper.length - 1)
    let tw = twOf()
    if (tw > avail) {
      hCs = 0.4
      tw = twOf()
    }
    while (tw > avail && hSize > 5.5) {
      hSize -= 0.5
      doc.setFontSize(hSize)
      tw = twOf()
    }
    doc.text(docUpper, pageW - marginR - tw, 43, { charSpace: hCs })
    draw(RULE)
    doc.setLineWidth(0.75)
    doc.line(marginL, 51, pageW - marginR, 51)

    doc.line(marginL, pageH - 52, pageW - marginR, pageH - 52)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    if (input.footerAddress) {
      set(GRAY)
      doc.text(input.footerAddress, marginL, pageH - 38, { charSpace: 0.2 })
    }
    if (input.footerWebsite) {
      set(STEEL)
      const wcs = 0.3
      const ww = doc.getTextWidth(input.footerWebsite) + wcs * Math.max(0, input.footerWebsite.length - 1)
      doc.text(input.footerWebsite, pageW - marginR - ww, pageH - 38, { charSpace: wcs })
    }
  }

  let y = contentTop
  paintChrome()
  const newPage = () => {
    doc.addPage()
    paintChrome()
    y = contentTop
  }
  const ensure = (need: number) => {
    if (y + need > contentBottom) newPage()
  }

  // ---------- Title block (first page, centered)
  // Collapse runs of spaces/tabs so a columnar, space-padded source line
  // (e.g. a "RESOLUTION          MINUTES" header) can't blow out the layout.
  const rawLines = input.bodyText.split('\n').map((l) => l.replace(/[ \t]{2,}/g, ' ').replace(/\s+$/, ''))
  let idx = 0
  while (idx < rawLines.length && rawLines[idx].trim() === '') idx++

  // Some resolution templates lead with a two-column "RESOLUTION … MINUTES /
  // Corporation ID: X" header. The house layout supplies the letterhead itself,
  // so lift the Corporation ID out for a small label and skip these meta lines
  // rather than mistaking "RESOLUTION" for the document title.
  let corporationId = ''
  let metaHeader = false
  const isMeta = (t: string) => /^RESOLUTION(\s+MINUTES)?$/i.test(t) || /^MINUTES$/i.test(t) || /^Corporation ID\b/i.test(t)
  while (idx < rawLines.length && rawLines[idx].trim() !== '' && isMeta(rawLines[idx].trim())) {
    const m = rawLines[idx].trim().match(/Corporation ID[:#\s]+(.+)$/i)
    if (m) corporationId = m[1].trim()
    metaHeader = true
    idx++
  }
  while (idx < rawLines.length && rawLines[idx].trim() === '') idx++

  let titleLine: string
  if (metaHeader) {
    // The body's "title" was the meta header; use the document's own name.
    titleLine = input.docName
  } else {
    titleLine = (rawLines[idx] || input.docName).trim()
    idx++
  }
  // An entity descriptor is a short "A <State> Corporation" line — not any
  // sentence that merely contains the word "corporation".
  const entityLine =
    rawLines[idx] &&
    rawLines[idx].trim().length < 90 &&
    /(^A\s.+\b(Corporation|Company|Limited Liability Company|Nonprofit|LLC)\b|—\s*A\s.+\b(Corporation|Company)\b)/i.test(rawLines[idx].trim())
      ? rawLines[idx].trim()
      : ''
  if (entityLine) idx++
  // Optional italic subtitle: passed in explicitly (foreign-registration note),
  // or a "Registered…" line already present in the body.
  const maybeSub = rawLines[idx]?.trim() || ''
  const bodySub =
    maybeSub && /^[A-Z]/.test(maybeSub) && /[a-z]/.test(maybeSub) && !/^ARTICLE\b/i.test(maybeSub) && maybeSub.length < 120 && /^Registered|^A .*registered/i.test(maybeSub)
      ? maybeSub
      : ''
  if (bodySub) idx++
  const subtitle = input.subtitle || bodySub

  const cx = pageW / 2
  y += 6
  if (input.orgLogo) {
    try {
      const h = 46
      const w = h * logoAspect
      doc.addImage(input.orgLogo, logoFmt, cx - w / 2, y, w, h, undefined, 'FAST')
      y += h + 14
    } catch {
      /* skip */
    }
  }
  if (entityLine) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    set(STEEL)
    doc.text(entityLine.toUpperCase(), cx, y, { align: 'center', charSpace: 2 })
    y += 20
  }
  doc.setFont('times', 'bold')
  doc.setFontSize(24)
  set(NAVY)
  for (const tl of doc.splitTextToSize(titleLine.toUpperCase(), contentW)) {
    doc.text(tl, cx, y, { align: 'center', charSpace: 1.4 })
    y += 28
  }
  if (corporationId) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    set(GRAY)
    doc.text(`CORPORATION ID: ${corporationId.toUpperCase()}`, cx, y, { align: 'center', charSpace: 1 })
    y += 16
  }
  if (subtitle) {
    doc.setFont('times', 'italic')
    doc.setFontSize(12)
    set(GRAY)
    for (const sl of doc.splitTextToSize(subtitle, contentW - 60)) {
      doc.text(sl, cx, y, { align: 'center' })
      y += 16
    }
  }
  y += 8
  draw(STEEL)
  doc.setLineWidth(1.5)
  doc.line(marginL, y, pageW - marginR, y)
  y += 26

  // ---------- Body helpers
  const bodyLineH = 15
  const secImg = input.secretaryName ? cursiveImage(input.secretaryName, 60) : null

  /** Word-wrap a numbered section: bold navy lead-in phrase, then ink body.
   *  `y` is the running baseline throughout, so page breaks flow correctly. */
  const drawSection = (numLabel: string, text: string) => {
    const indent = 34
    const wrapW = contentW - indent
    // Split off the lead-in phrase (up to the first period + space), like
    // "Principal Office." — rendered bold navy.
    const lead = text.match(/^([^.]{2,48}\.)(\s+)(.*)$/)
    const runs: { t: string; bold: boolean }[] = lead
      ? [{ t: lead[1], bold: true }, { t: ' ' + lead[3], bold: false }]
      : [{ t: text, bold: false }]
    const words: { t: string; bold: boolean }[] = []
    for (const r of runs) for (const w of r.t.split(/(\s+)/)) if (w !== '') words.push({ t: w, bold: r.bold })

    doc.setFontSize(11)
    ensure(bodyLineH)
    doc.setFont('times', 'normal')
    set(STEEL)
    doc.text(numLabel, marginL, y)

    const measure = (w: { t: string; bold: boolean }) => {
      doc.setFont('times', w.bold ? 'bold' : 'normal')
      return doc.getTextWidth(w.t)
    }
    let cur: { t: string; bold: boolean }[] = []
    let curW = 0
    const flush = () => {
      let x = marginL + indent
      for (const w of cur) {
        doc.setFont('times', w.bold ? 'bold' : 'normal')
        set(w.bold ? NAVY : INK)
        doc.text(w.t, x, y)
        x += doc.getTextWidth(w.t)
      }
      cur = []
      curW = 0
    }
    for (const w of words) {
      const wide = measure(w)
      if (curW + wide > wrapW && cur.length) {
        flush()
        y += bodyLineH
        if (y > contentBottom) newPage()
      }
      if (!(cur.length === 0 && w.t.trim() === '')) {
        cur.push(w)
        curW += wide
      }
    }
    if (cur.length) flush()
    y += bodyLineH
  }

  const drawParagraph = (text: string, italic = false, color: RGB = INK, size = 11) => {
    doc.setFont('times', italic ? 'italic' : 'normal')
    doc.setFontSize(size)
    set(color)
    for (const ln of doc.splitTextToSize(text, contentW)) {
      ensure(bodyLineH)
      doc.text(ln, marginL, y)
      y += bodyLineH
    }
  }

  const drawSectionHeading = (text: string) => {
    ensure(bodyLineH + 12)
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    set(NAVY)
    doc.text(text, marginL, y, { charSpace: 1.2 })
    y += bodyLineH
  }

  const drawArticle = (label: string, title: string) => {
    ensure(bodyLineH + 16)
    y += 10
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    set(STEEL)
    const lab = label.toUpperCase()
    doc.text(lab, marginL, y, { charSpace: 1.6 })
    const labW = doc.getTextWidth(lab) + lab.length * 1.6 + 14
    if (title.trim()) {
      doc.setFont('times', 'bold')
      doc.setFontSize(14)
      set(NAVY)
      doc.text(titleCase(title.trim()), marginL + labW, y)
    }
    y += bodyLineH + 4
  }

  /** The secretary certificate line → a labelled signature/date block. */
  const drawSecretaryBlock = (dateVal: string) => {
    ensure(52)
    const colX = marginL
    const dateX = marginL + 300
    if (secImg) {
      const h = 22
      const w = Math.min(secImg.w * (h / secImg.h), 230)
      try {
        doc.addImage(secImg.url, 'PNG', colX, y - h + 2, w, h)
      } catch {
        doc.setFont('times', 'italic'); doc.setFontSize(15); set(INK); doc.text(input.secretaryName || '', colX, y)
      }
    }
    if (dateVal) {
      doc.setFont('times', 'normal'); doc.setFontSize(11); set(INK)
      doc.text(dateVal, dateX, y - 2)
    }
    y += 6
    draw(INK); doc.setLineWidth(0.75)
    doc.line(colX, y, colX + 210, y)
    if (dateVal) doc.line(dateX, y, dateX + 150, y)
    y += 11
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); set(GRAY)
    doc.text('SECRETARY', colX, y, { charSpace: 1.2 })
    if (dateVal) doc.text('DATE', dateX, y, { charSpace: 1.2 })
    y += bodyLineH + 4
  }

  // ---------- Body loop
  for (; idx < rawLines.length; idx++) {
    const trimmed = rawLines[idx].trim()
    if (trimmed === '') {
      y += bodyLineH * 0.5
      continue
    }

    const secMatch = trimmed.match(/^Secretary:\s*_{3,}\s*(?:Date:\s*(.*))?$/i)
    if (secMatch) {
      drawSecretaryBlock((secMatch[1] || '').trim())
      continue
    }

    const art = trimmed.match(/^(ARTICLE\s+[IVXLCDM]+)\b\s*[—–-]?\s*(.*)$/i)
    if (art) {
      drawArticle(art[1], art[2])
      continue
    }

    const num = trimmed.match(/^(\d+(?:\.\d+)*)\.?\s+(.*)$/)
    if (num) {
      drawSection(num[1], num[2])
      continue
    }

    const isHeading =
      trimmed.length <= 64 && /[A-Z]/.test(trimmed) && trimmed === trimmed.toUpperCase() && /^[A-Z0-9 &'’.,()\/—–-]+$/.test(trimmed)
    if (isHeading) {
      drawSectionHeading(trimmed)
      continue
    }

    if (/^\[.*\]$/.test(trimmed)) {
      drawParagraph(trimmed, true, GRAY, 9.5)
      continue
    }

    drawParagraph(trimmed)
  }

  // ---------- Signatures (fresh page)
  newPage()
  doc.setFont('times', 'bold')
  doc.setFontSize(16)
  set(NAVY)
  doc.text('Signatures', marginL, y)
  y += 12
  draw(STEEL)
  doc.setLineWidth(1.5)
  doc.line(marginL, y, pageW - marginR, y)
  y += 26

  const drawTypedFallback = (text: string) => {
    doc.setFont('times', 'italic')
    doc.setFontSize(22)
    set(NAVY)
    doc.text(text, marginL, y + 26)
  }

  for (const s of input.signers) {
    ensure(84)
    if (s.record) {
      if (s.record.method === 'drawn') {
        try {
          doc.addImage(s.record.value, 'PNG', marginL, y, 150, 44, undefined, 'FAST')
        } catch {
          drawTypedFallback(s.record.name)
        }
      } else {
        const img = cursiveImage(s.record.value || s.record.name)
        if (img) {
          const sigH = 34
          const sigW = Math.min(img.w * (sigH / img.h), contentW)
          try {
            doc.addImage(img.url, 'PNG', marginL, y, sigW, sigH)
          } catch {
            drawTypedFallback(s.record.value || s.record.name)
          }
        } else {
          drawTypedFallback(s.record.value || s.record.name)
        }
      }
    } else {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(11)
      set(GRAY)
      doc.text('Not yet signed', marginL, y + 22)
    }
    y += 46
    draw(INK)
    doc.setLineWidth(0.75)
    doc.line(marginL, y, marginL + 260, y)
    y += 14
    doc.setFont('times', 'bold')
    doc.setFontSize(11)
    set(NAVY)
    doc.text(s.name, marginL, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    set(GRAY)
    doc.text(`  ·  ${s.role}`, marginL + doc.getTextWidth(s.name), y)
    y += 13
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    set(GRAY)
    const caption = !s.record
      ? 'Awaiting signature'
      : s.record.signedAt
        ? `Electronically signed ${fmtDate(s.record.signedAt)}`
        : 'Electronically signed'
    doc.text(caption, marginL, y)
    y += 28
  }

  ensure(30)
  y += 6
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  set(GRAY)
  const orgClean = input.orgName.replace(/[.\s]+$/, '')
  doc.text(
    doc.splitTextToSize(
      `Electronically signed through Quorum for ${orgClean}. This record captures each signer's identity and the date and time they signed.`,
      contentW,
    ),
    marginL,
    y,
  )

  const safe = input.docName.replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '') || 'document'
  doc.save(`${safe}-signed.pdf`)
}
