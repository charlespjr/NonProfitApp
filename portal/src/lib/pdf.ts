/**
 * Client-side "download signed copy" — renders a document plus its electronic
 * signature block to a real PDF, entirely in the browser (jsPDF, dynamically
 * imported so it never weighs down the main bundle). No server round-trip and
 * no third-party signing service.
 */
import type { SignatureRecord } from '../types'

export interface PdfSigner {
  name: string
  role: string
  record?: SignatureRecord
}

export interface SignedPdfInput {
  orgName: string
  /** Optional logo data-URL (PNG/JPEG) for the header. */
  orgLogo?: string
  docName: string
  bodyText: string
  signers: PdfSigner[]
  /** Name to write on the document's "Secretary: ____" certificate line. */
  secretaryName?: string
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// The same cursive stack the in-app signature uses, so the PDF matches what the
// signer saw on screen. jsPDF has no cursive face of its own, so we paint the
// name onto a canvas with these system fonts and embed it as an image.
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
    const scale = 3 // supersample for crisp glyph edges in print
    const canvas = document.createElement('canvas')
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.scale(scale, scale)
    ctx.font = font
    ctx.fillStyle = '#1a1a2e'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, pad, h / 2)
    return { url: canvas.toDataURL('image/png'), w, h }
  } catch {
    return null
  }
}

export async function exportSignedPdf(input: SignedPdfInput): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 54
  const contentW = pageW - margin * 2
  let y = margin

  const ensure = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage()
      y = margin
    }
  }

  // ---- Header: logo (optional) + org name
  if (input.orgLogo) {
    try {
      const fmt = input.orgLogo.includes('image/png') ? 'PNG' : 'JPEG'
      doc.addImage(input.orgLogo, fmt, margin, y, 90, 30, undefined, 'FAST')
      y += 38
    } catch {
      /* bad/unsupported image — skip it */
    }
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(30, 26, 21)
  doc.text(input.orgName, margin, y)
  y += 22

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(doc.splitTextToSize(input.docName, contentW), margin, y)
  y += 26
  doc.setDrawColor(210, 204, 190)
  doc.line(margin, y, pageW - margin, y)
  y += 20

  // ---- Body text
  const lineH = 15
  const secImg = input.secretaryName ? cursiveImage(input.secretaryName, 60) : null
  const paras = input.bodyText.split('\n')
  for (const para of paras) {
    const lines = para.trim() === '' ? [''] : doc.splitTextToSize(para, contentW)
    for (const ln of lines) {
      ensure(lineH)
      // Fill the certificate's "Secretary: ______" blank with the secretary's
      // handwritten name, drawn over the underscores in the cursive font.
      const secMatch = secImg && ln.match(/^(.*?Secretary:\s+)(_{3,})(.*)$/)
      if (secMatch) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10.5)
        doc.setTextColor(40, 35, 28)
        const prefix = secMatch[1]
        const suffix = secMatch[3]
        doc.text(prefix, margin, y)
        const px = margin + doc.getTextWidth(prefix)
        const sigH = 15
        const sigW = Math.min(secImg.w * (sigH / secImg.h), 190)
        try {
          doc.addImage(secImg.url, 'PNG', px, y - sigH + 3, sigW, sigH)
        } catch {
          doc.text(input.secretaryName || '', px, y)
        }
        if (suffix.trim()) doc.text(suffix.replace(/^\s+/, '  '), px + sigW + 4, y)
        y += lineH
        continue
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10.5)
      doc.setTextColor(40, 35, 28)
      doc.text(ln, margin, y)
      y += lineH
    }
  }

  // ---- Signatures section (always starts on a fresh page for clarity)
  doc.addPage()
  y = margin
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(30, 26, 21)
  doc.text('Signatures', margin, y)
  y += 10
  doc.setDrawColor(210, 204, 190)
  doc.line(margin, y, pageW - margin, y)
  y += 22

  const drawTypedFallback = (text: string) => {
    doc.setFont('times', 'italic')
    doc.setFontSize(22)
    doc.setTextColor(26, 26, 46)
    doc.text(text, margin, y + 26)
  }

  for (const s of input.signers) {
    ensure(78)
    // Signature mark
    if (s.record) {
      if (s.record.method === 'drawn') {
        try {
          doc.addImage(s.record.value, 'PNG', margin, y, 150, 44, undefined, 'FAST')
        } catch {
          drawTypedFallback(s.record.name)
        }
      } else {
        // Typed signature — render it in the same cursive hand as the app.
        const img = cursiveImage(s.record.value || s.record.name)
        if (img) {
          const sigH = 34
          const sigW = Math.min(img.w * (sigH / img.h), contentW)
          try {
            doc.addImage(img.url, 'PNG', margin, y, sigW, sigH)
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
      doc.setTextColor(150, 140, 128)
      doc.text('Not yet signed', margin, y + 22)
    }
    y += 48
    // Signature line + identity
    doc.setDrawColor(150, 140, 128)
    doc.line(margin, y, margin + 240, y)
    y += 14
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(30, 26, 21)
    doc.text(`${s.name}`, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(90, 82, 72)
    doc.text(`  ·  ${s.role}`, margin + doc.getTextWidth(s.name), y)
    y += 14
    doc.setFontSize(9.5)
    doc.setTextColor(120, 112, 100)
    // A record with no timestamp is a legacy signature (signed before the app
    // captured signing times) — show it as signed without inventing a date.
    const caption = !s.record
      ? 'Awaiting signature'
      : s.record.signedAt
        ? `Electronically signed ${fmtDate(s.record.signedAt)}`
        : 'Electronically signed'
    doc.text(caption, margin, y)
    y += 26
  }

  // ---- Footer note on the last page
  ensure(40)
  y = Math.max(y, pageH - margin - 24)
  doc.setDrawColor(210, 204, 190)
  doc.line(margin, y, pageW - margin, y)
  y += 14
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  doc.setTextColor(130, 122, 110)
  doc.text(
    doc.splitTextToSize(
      `Electronically signed through Quorum for ${input.orgName}. This record captures each signer's identity and the date and time they signed. Generated ${fmtDate(new Date().toISOString())}.`,
      contentW,
    ),
    margin,
    y,
  )

  const safe = input.docName.replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '') || 'document'
  doc.save(`${safe}-signed.pdf`)
}
