/**
 * Turn an uploaded image file into a compact data-URL logo.
 * Downscales to a sane letterhead size (≤320px wide / ≤128px tall at 2x)
 * so the logo stays a few tens of KB inside the org's synced state.
 */
export function fileToLogoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Choose an image file (PNG, JPG, or SVG).'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const maxW = 640
      const maxH = 256
      const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight)
      const w = Math.max(1, Math.round(img.naturalWidth * scale))
      const h = Math.max(1, Math.round(img.naturalHeight * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not process the image.'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/png')
      if (dataUrl.length > 250_000) {
        reject(new Error('That image is too complex — try a simpler or smaller logo.'))
        return
      }
      resolve(dataUrl)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image.'))
    }
    img.src = url
  })
}
