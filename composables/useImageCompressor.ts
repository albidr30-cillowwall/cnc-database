// Image compression utility for CNC Database
// Compresses uploaded drawings & cutting plan photos to ~100KB-200KB to prevent
// Supabase PostgREST 413 Payload Too Large and browser LocalStorage QuotaExceededError.

export function useImageCompressor() {
  function compressImage(file: File, maxWidth = 1200, quality = 0.75): Promise<string> {
    return new Promise((resolve, reject) => {
      // PDF files cannot be processed via canvas, read directly
      if (file.type === 'application/pdf') {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
        return
      }

      // If not an image, resolve empty
      if (!file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          let { width, height } = img

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(e.target?.result as string)
            return
          }

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height)

          // Export as compressed JPEG
          try {
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
            resolve(compressedDataUrl)
          } catch {
            resolve(e.target?.result as string)
          }
        }
        img.onerror = () => resolve(e.target?.result as string)
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return {
    compressImage
  }
}
