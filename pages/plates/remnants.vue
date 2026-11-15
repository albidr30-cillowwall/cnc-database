<template>
  <div class="space-y-5">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-puzzle-piece text-orange-500"></i>
          <span>Daftar Plat Remnant (Sisa Potongan Layak Pakai)</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Pemanfaatan kembali sisa potongan plat bersih galangan kapal agar efisiensi material maksimal
        </p>
      </div>

      <NuxtLink 
        to="/plates" 
        class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs shrink-0"
      >
        <i class="fa-solid fa-layer-group text-amber-500"></i>
        <span>Semua Master Plat Yard</span>
      </NuxtLink>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div class="flex flex-wrap items-center gap-2.5">
        <span class="text-orange-600 dark:text-orange-400 font-extrabold flex items-center gap-1.5">
          <i class="fa-solid fa-ruler-combined"></i>
          <span>Cari Ukuran Minimal Remnant:</span>
        </span>
        <div class="flex items-center gap-1.5">
          <input 
            v-model.number="minP" 
            type="number" 
            placeholder="Min P (mm)" 
            class="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <span class="text-slate-400 dark:text-slate-500">x</span>
          <input 
            v-model.number="minL" 
            type="number" 
            placeholder="Min L (mm)" 
            class="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <button 
          v-if="minP || minL" 
          @click="resetFilter" 
          class="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
        >
          Reset
        </button>
      </div>

      <div class="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
        <i class="fa-solid fa-circle-info text-blue-500"></i>
        <span>Remnant otomatis tercatat saat operator mengambil plat sebagian di Yard</span>
      </div>
    </div>

    <!-- Table of Remnants -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-extrabold text-left">
            <tr>
              <th class="p-3.5">No. Plat Remnant</th>
              <th class="p-3.5">Heat Number Asal</th>
              <th class="p-3.5">Grade & Material</th>
              <th class="p-3.5">Dimensi Sisa (P x L x T)</th>
              <th class="p-3.5">Berat Sisa</th>
              <th class="p-3.5">Lokasi Rak CNC</th>
              <th class="p-3.5">Status</th>
              <th class="p-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr 
              v-for="r in filteredRemnants" 
              :key="r.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="p-3.5 font-mono font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                {{ r.no_plat }}
              </td>
              <td class="p-3.5 font-mono text-slate-800 dark:text-slate-200">
                {{ r.heat_number }}
              </td>
              <td class="p-3.5">
                <span class="font-bold text-slate-900 dark:text-slate-100">{{ r.grade }}</span>
                <span class="text-slate-500 dark:text-slate-400 ml-1">({{ r.material_type }})</span>
              </td>
              <td class="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                {{ r.panjang_mm }} x {{ r.lebar_mm }} x {{ r.tebal_mm }}mm
              </td>
              <td class="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                {{ Number(r.berat_kg).toLocaleString('id-ID', { minimumFractionDigits: 1 }) }} kg
              </td>
              <td class="p-3.5 text-cyan-600 dark:text-cyan-400 font-semibold">
                <i class="fa-solid fa-location-pin mr-1 text-slate-400"></i>
                {{ r.lokasi_yard }}
              </td>
              <td class="p-3.5">
                <span class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  Siap Pakai
                </span>
              </td>
              <td class="p-3.5 text-center">
                <NuxtLink 
                  to="/orders/create" 
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-xs"
                >
                  <i class="fa-solid fa-plus text-[10px]"></i>
                  <span>Pakai</span>
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="filteredRemnants.length === 0">
              <td colspan="8" class="p-10 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                <i class="fa-solid fa-puzzle-piece text-3xl mb-2 block text-slate-300 dark:text-slate-700"></i>
                Belum ada plat remnant yang tersedia atau cocok dengan filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCncStore } from '~/composables/useCncStore'

const store = useCncStore()

const minP = ref<number | null>(null)
const minL = ref<number | null>(null)

const remnantsList = computed(() => {
  return store.plates.value.filter(p => p.is_remnant || p.status === 'Sisa Potongan / Remnant')
})

const filteredRemnants = computed(() => {
  return remnantsList.value.filter(r => {
    if (minP.value && r.panjang_mm < minP.value) return false
    if (minL.value && r.lebar_mm < minL.value) return false
    return true
  })
})

function resetFilter() {
  minP.value = null
  minL.value = null
}

onMounted(() => {
  store.initStore()
})
</script>

