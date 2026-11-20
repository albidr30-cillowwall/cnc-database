<template>
  <Teleport to="body">
    <div 
      v-if="lightboxState.isOpen"
      class="fixed inset-0 z-[9999] flex flex-col bg-slate-950/92 backdrop-blur-md text-white select-none transition-opacity duration-200"
      @keydown.esc="closeLightbox"
      tabindex="0"
    >
      <!-- Top Action Bar -->
      <div class="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 shadow-lg">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="p-2 rounded-xl bg-blue-600/30 text-blue-400">
            <i class="fa-solid fa-image text-sm"></i>
          </span>
          <div class="min-w-0">
            <h3 class="text-xs font-bold truncate max-w-xs sm:max-w-md text-white">{{ lightboxState.title || 'Lampiran Gambar' }}</h3>
            <span class="text-[10px] text-slate-400">Pratinjau Lightbox CNC</span>
          </div>
        </div>

        <!-- Toolbar Controls -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- Zoom Controls -->
          <div class="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl px-1 py-0.5 text-xs">
            <button 
              type="button"
              @click="zoomOut" 
              class="w-7 h-7 rounded-lg hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
              title="Perkecil (Zoom Out)"
            >
              <i class="fa-solid fa-magnifying-glass-minus text-[11px]"></i>
            </button>
            <span class="px-2 font-mono text-[11px] font-bold text-slate-300 min-w-[46px] text-center">
              {{ Math.round(lightboxState.zoom * 100) }}%
            </span>
            <button 
              type="button"
              @click="zoomIn" 
              class="w-7 h-7 rounded-lg hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
              title="Perbesar (Zoom In)"
            >
              <i class="fa-solid fa-magnifying-glass-plus text-[11px]"></i>
            </button>
          </div>

          <!-- Reset Zoom -->
          <button 
            type="button"
            @click="resetZoom" 
            class="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1"
            title="Reset Ukuran (100%)"
          >
            <i class="fa-solid fa-arrows-rotate text-[10px]"></i>
            <span class="hidden sm:inline">Reset</span>
          </button>

          <!-- Rotate -->
          <button 
            type="button"
            @click="rotate" 
            class="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
            title="Putar 90° (Rotate)"
          >
            <i class="fa-solid fa-rotate-right text-xs"></i>
          </button>

          <!-- Download -->
          <a 
            :href="lightboxState.src" 
            :download="lightboxState.title || 'gambar-cnc'"
            class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
            title="Unduh file gambar ini"
          >
            <i class="fa-solid fa-download text-xs"></i>
            <span class="hidden sm:inline">Unduh</span>
          </a>

          <!-- Close -->
          <button 
            type="button"
            @click="closeLightbox" 
            class="w-8 h-8 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 flex items-center justify-center transition cursor-pointer ml-1"
            title="Tutup (Esc)"
          >
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Main Viewer Area -->
      <div 
        class="flex-1 overflow-auto flex items-center justify-center p-4 relative"
        @click.self="closeLightbox"
      >
        <!-- If PDF -->
        <div v-if="isPdf" class="w-full max-w-4xl h-[82vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <div class="p-3 bg-slate-100 text-slate-800 flex items-center justify-between border-b text-xs font-bold">
            <span>Dokumen PDF: {{ lightboxState.title }}</span>
            <a :href="lightboxState.src" target="_blank" class="text-blue-600 underline">Buka di Tab Baru</a>
          </div>
          <iframe :src="lightboxState.src" class="w-full flex-1 border-0"></iframe>
        </div>

        <!-- If Image -->
        <div 
          v-else 
          class="transition-transform duration-150 ease-out flex items-center justify-center max-w-full max-h-full"
          :style="{
            transform: `scale(${lightboxState.zoom}) rotate(${lightboxState.rotation}deg)`
          }"
        >
          <img 
            :src="lightboxState.src" 
            :alt="lightboxState.title" 
            class="max-w-[92vw] max-h-[82vh] object-contain rounded-xl shadow-2xl pointer-events-auto cursor-grab active:cursor-grabbing border border-slate-800"
            @click.stop
          />
        </div>

        <!-- Bottom hint -->
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-[10px] text-slate-400 pointer-events-none flex items-center gap-2">
          <span>Gunakan tombol zoom atau tekan</span>
          <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[9px] border border-slate-700">Esc</kbd>
          <span>untuk menutup</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useLightbox } from '~/composables/useLightbox'

const { lightboxState, closeLightbox, zoomIn, zoomOut, resetZoom, rotate } = useLightbox()

const isPdf = computed(() => {
  const src = lightboxState.value.src || ''
  const title = (lightboxState.value.title || '').toLowerCase()
  return src.startsWith('data:application/pdf') || title.endsWith('.pdf')
})

function handleKeydown(e: KeyboardEvent) {
  if (!lightboxState.value.isOpen) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === '+' || e.key === '=') zoomIn()
  if (e.key === '-' || e.key === '_') zoomOut()
  if (e.key === 'r' || e.key === 'R') rotate()
  if (e.key === '0') resetZoom()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
