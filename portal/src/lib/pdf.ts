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
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
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
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(40, 35, 28)
  const lineH = 15
  const paras = input.bodyText.split('\n')
  for (const para of paras) {
    const lines = para.trim() === '' ? [''] : doc.splitTextToSize(para, contentW)
    for (const ln of lines) {
      ensure(lineH)
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

  for (const s of input.signers) {
    ensure(78)
    // Signature mark
    if (s.record) {
      if (s.record.method === 'drawn') {
        try {
          doc.addImage(s.record.value, 'PNG', margin, y, 150, 44, undefined, 'FAST')
        } catch {
          doc.setFont('times', 'italic')
          doc.setFontSize(20)
          doc.setTextColor(26, 26, 46)
          doc.text(s.record.name, margin, y + 26)
        }
      } else {
        doc.setFont('times', 'italic')
        doc.setFontSize(22)
        doc.setTextColor(26, 26, 46)
        doc.text(s.record.value, margin, y + 26)
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
    doc.text(s.record ? `Electronically signed ${fmtDate(s.record.signedAt)}` : 'Awaiting signature', margin, y)
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
