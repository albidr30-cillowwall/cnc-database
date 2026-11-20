import { useState } from '#imports'

export interface LightboxState {
  isOpen: boolean
  src: string
  title: string
  zoom: number
  rotation: number
}

export function useLightbox() {
  const lightboxState = useState<LightboxState>('global_lightbox_state', () => ({
    isOpen: false,
    src: '',
    title: '',
    zoom: 1,
    rotation: 0
  }))

  function openLightbox(src: string, title: string = 'Lampiran Gambar') {
    if (!src) return
    lightboxState.value = {
      isOpen: true,
      src,
      title: title || 'Lampiran Gambar',
      zoom: 1,
      rotation: 0
    }
  }

  function closeLightbox() {
    lightboxState.value.isOpen = false
  }

  function zoomIn() {
    lightboxState.value.zoom = Math.min(3, +(lightboxState.value.zoom + 0.25).toFixed(2))
  }

  function zoomOut() {
    lightboxState.value.zoom = Math.max(0.5, +(lightboxState.value.zoom - 0.25).toFixed(2))
  }

  function resetZoom() {
    lightboxState.value.zoom = 1
    lightboxState.value.rotation = 0
  }

  function rotate() {
    lightboxState.value.rotation = (lightboxState.value.rotation + 90) % 360
  }

  return {
    lightboxState,
    openLightbox,
    closeLightbox,
    zoomIn,
    zoomOut,
    resetZoom,
    rotate
  }
}
