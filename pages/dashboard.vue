<template>
  <div class="space-y-6">
    <!-- Low Stock Alert Banner -->
    <div 
      v-if="lowStock" 
      class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-base shrink-0">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div>
          <div class="font-extrabold text-sm uppercase tracking-wide">Peringatan Stok Plat Yard Menipis!</div>
          <div class="text-xs text-amber-800 dark:text-amber-300">
            Stok plat siap pakai di yard saat ini tersisa {{ availPlatesCount }} lembar. Harap lakukan pengadaan plat baru.
          </div>
        </div>
      </div>
      <NuxtLink 
        to="/plates" 
        class="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl shrink-0"
      >
        Cek Stok <i class="fa-solid fa-arrow-right"></i>
      </NuxtLink>
    </div>

    <!-- KPI 6 Card Order -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <span>Total Order</span>
          <i class="fa-solid fa-clipboard-list text-blue-600 dark:text-blue-400"></i>
        </div>
        <div class="text-2xl font-extrabold font-mono mt-2 text-slate-900 dark:text-white">{{ orders.length }}</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Siklus Aktif</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-semibold">
          <span>Menunggu Estimasi</span>
          <i class="fa-solid fa-hourglass-half text-amber-500"></i>
        </div>
        <div class="text-2xl font-extrabold font-mono mt-2 text-amber-600 dark:text-amber-400">{{ waitingEstCount }}</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Admin Material</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-400 font-semibold">
          <span>Antrian / Diterima</span>
          <i class="fa-solid fa-inbox text-indigo-500"></i>
        </div>
        <div class="text-2xl font-extrabold font-mono mt-2 text-indigo-600 dark:text-indigo-400">{{ waitingAcceptCount }}</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Antrian Operator</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-orange-700 dark:text-orange-400 font-semibold">
          <span>Sedang Dipotong</span>
          <i class="fa-solid fa-fire-burner text-orange-500"></i>
        </div>
        <div class="text-2xl font-extrabold font-mono mt-2 text-orange-600 dark:text-orange-400">{{ cuttingCount }}</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Mesin Aktif</div>
      </div>

      <div class="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
          <span>Siap Diambil</span>
          <i class="fa-solid fa-key text-emerald-600"></i>
        </div>
        <div class="text-2xl font-extrabold font-mono mt-2 text-emerald-700 dark:text-emerald-400">{{ readyCount }}</div>
        <div class="text-[10px] text-emerald-700 dark:text-emerald-300 font-extrabold mt-0.5 uppercase tracking-wide">ADA PIN 6-DIGIT</div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
          <span>Total Selesai</span>
          <i class="fa-solid fa-circle-check text-slate-400"></i>
        </div>
        <div class="text-2xl font-extrabold font-mono mt-2 text-slate-700 dark:text-slate-200">{{ completedCount }}</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Masuk History</div>
      </div>
    </div>

    <!-- KPI 4 Card Plat Yard -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <div class="text-xs font-bold text-emerald-700 dark:text-emerald-400">Plat Tersedia (Yard)</div>
          <div class="text-2xl font-extrabold font-mono mt-1 text-slate-900 dark:text-white">{{ availPlatesCount }} Lembar</div>
          <div class="text-xs font-bold font-mono text-cyan-700 dark:text-cyan-400 mt-0.5">{{ totalWeightTon.toFixed(2) }} Ton</div>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
          <i class="fa-solid fa-layer-group"></i>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <div class="text-xs font-bold text-orange-700 dark:text-orange-400">Sisa Potongan (Remnant)</div>
          <div class="text-2xl font-extrabold font-mono mt-1 text-orange-600 dark:text-orange-400">{{ remnantCount }} Pcs</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Bisa Dipakai Kembali</div>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center text-lg">
          <i class="fa-solid fa-puzzle-piece"></i>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <div class="text-xs font-bold text-blue-700 dark:text-blue-400">Plat Belum Terpotong</div>
          <div class="text-2xl font-extrabold font-mono mt-1 text-blue-600 dark:text-blue-400">{{ uncutPlatesCount }} Lembar</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Tersedia & Diambil</div>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
          <i class="fa-solid fa-cubes"></i>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <div class="text-xs font-bold text-violet-700 dark:text-violet-400">Plat Sudah Terpotong</div>
          <div class="text-2xl font-extrabold font-mono mt-1 text-violet-600 dark:text-violet-400">{{ cutPlatesCount }} Lembar</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Selesai Produksi</div>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center text-lg">
          <i class="fa-solid fa-check-double"></i>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Tren Order Pemotongan Plat per Minggu
          </h2>
          <span class="text-[11px] text-slate-400">4 Minggu Terakhir</span>
        </div>
        <div class="h-60 relative flex items-center justify-center">
          <canvas ref="trendCanvas"></canvas>
          <div v-if="orders.length === 0" class="absolute text-xs text-slate-400 italic">
            Belum ada data order untuk grafik
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xs font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
            Distribusi Plat Menurut Grade Material
          </h2>
          <span class="text-[11px] text-slate-400">Total {{ plates.length }} Plat</span>
        </div>
        <div class="h-60 relative flex items-center justify-center">
          <canvas ref="gradeCanvas"></canvas>
          <div v-if="plates.length === 0" class="absolute text-xs text-slate-400 italic">
            Belum ada data plat untuk grafik
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Pemotongan Terakhir -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
            Riwayat Pemotongan Terakhir
          </h3>
          <NuxtLink to="/operator" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Lihat Workshop &rarr;
          </NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-left">
              <tr>
                <th class="pb-2.5">No. Order</th>
                <th class="pb-2.5">Proyek / Part</th>
                <th class="pb-2.5">Group</th>
                <th class="pb-2.5">Qty</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="cut in recentCuts" :key="cut.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                <td class="py-2.5 font-mono font-bold text-blue-700 dark:text-blue-400">{{ cut.no_order }}</td>
                <td class="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{{ cut.nama_proyek }}</td>
                <td class="py-2.5 text-cyan-700 dark:text-cyan-400 font-semibold">{{ cut.target_cnc }}</td>
                <td class="py-2.5 font-mono text-emerald-700 dark:text-emerald-400 font-bold">{{ cut.jumlah_pesanan }} {{ cut.satuan }}</td>
              </tr>
              <tr v-if="recentCuts.length === 0">
                <td colspan="4" class="py-6 text-center text-slate-400 italic">Belum ada data pemotongan</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pengambilan Terakhir -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Riwayat Pengambilan Terakhir
          </h3>
          <NuxtLink to="/history" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Lihat History &rarr;
          </NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-left">
              <tr>
                <th class="pb-2.5">No. Order</th>
                <th class="pb-2.5">Pengambil</th>
                <th class="pb-2.5">PIN</th>
                <th class="pb-2.5">Waktu</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="ret in recentRetrievals" :key="ret.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                <td class="py-2.5 font-mono font-bold text-blue-700 dark:text-blue-400">{{ ret.no_order }}</td>
                <td class="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{{ ret.pengambil_akhir }}</td>
                <td class="py-2.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">{{ ret.kode_pengambilan }}</td>
                <td class="py-2.5 font-mono text-slate-500 text-[11px]">{{ formatTime(ret.waktu_diambil) }}</td>
              </tr>
              <tr v-if="recentRetrievals.length === 0">
                <td colspan="4" class="py-6 text-center text-slate-400 italic">Belum ada data pengambilan</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useCncStore } from '~/composables/useCncStore'
import { useTheme } from '~/composables/useTheme'

Chart.register(...registerables)

const { orders, plates } = useCncStore()
const { isDark } = useTheme()

const trendCanvas = ref<HTMLCanvasElement | null>(null)
const gradeCanvas = ref<HTMLCanvasElement | null>(null)
let trendChartInstance: Chart | null = null
let gradeChartInstance: Chart | null = null

const waitingEstCount = computed(() => orders.value.filter(o => o.status === 'Menunggu Estimasi').length)
const waitingAcceptCount = computed(() => orders.value.filter(o => ['Menunggu Persetujuan Pemesan', 'Estimasi Selesai', 'Diterima Operator', 'Plat Telah Diambil Yard'].includes(o.status)).length)
const cuttingCount = computed(() => orders.value.filter(o => o.status === 'Sedang Dipotong').length)
const readyCount = computed(() => orders.value.filter(o => o.status === 'Siap Diambil').length)
const completedCount = computed(() => orders.value.filter(o => o.status === 'Sudah Diambil').length)

const availPlates = computed(() => plates.value.filter(p => p.status === 'Tersedia'))
const availPlatesCount = computed(() => availPlates.value.length)
const totalWeightTon = computed(() => availPlates.value.reduce((acc, p) => acc + p.berat_kg, 0) / 1000)
const remnantCount = computed(() => plates.value.filter(p => p.is_remnant && p.status === 'Sisa Potongan / Remnant').length)
const uncutPlatesCount = computed(() => plates.value.filter(p => ['Tersedia', 'Diambil'].includes(p.status)).length)
const cutPlatesCount = computed(() => plates.value.filter(p => p.status === 'Sudah Dipotong').length)
const lowStock = computed(() => plates.value.length > 0 && availPlatesCount.value < 5)

const recentCuts = computed(() => {
  return orders.value
    .filter(o => ['Siap Diambil', 'Sudah Diambil'].includes(o.status))
    .slice(0, 5)
})

const recentRetrievals = computed(() => {
  return orders.value
    .filter(o => o.status === 'Sudah Diambil')
    .slice(0, 5)
})

function formatTime(val?: string | null) {
  if (!val) return '-'
  try {
    return new Date(val).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return val
  }
}

function renderCharts() {
  const dark = isDark.value
  const tickColor = dark ? '#94a3b8' : '#475569'
  const gridColor = dark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(148, 163, 184, 0.25)'
  const borderSurface = dark ? '#0f172a' : '#FFFFFF'

  // Weekly Trend Chart
  if (trendCanvas.value) {
    if (trendChartInstance) {
      trendChartInstance.destroy()
      trendChartInstance = null
    }

    if (orders.value.length > 0) {
      const labels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4']
      const count = orders.value.length
      const data = [Math.max(0, count - 3), Math.max(0, count - 2), Math.max(0, count - 1), count]

      trendChartInstance = new Chart(trendCanvas.value, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Order',
            data,
            borderColor: dark ? '#60A5FA' : '#2563EB',
            backgroundColor: dark ? 'rgba(96, 165, 250, 0.16)' : 'rgba(37, 99, 235, 0.12)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: dark ? '#60A5FA' : '#2563EB'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: tickColor }, grid: { color: gridColor } },
            y: { beginAtZero: true, ticks: { precision: 0, color: tickColor }, grid: { color: gridColor } }
          }
        }
      })
    }
  }

  // Grade Doughnut Chart
  if (gradeCanvas.value) {
    if (gradeChartInstance) {
      gradeChartInstance.destroy()
      gradeChartInstance = null
    }

    if (plates.value.length > 0) {
      const gradeCounts: Record<string, number> = {}
      plates.value.forEach(p => {
        gradeCounts[p.grade] = (gradeCounts[p.grade] || 0) + 1
      })

      gradeChartInstance = new Chart(gradeCanvas.value, {
        type: 'doughnut',
        data: {
          labels: Object.keys(gradeCounts),
          datasets: [{
            data: Object.values(gradeCounts),
            backgroundColor: ['#2563EB', '#059669', '#D97706', '#0891B2', '#7C3AED', '#475569'],
            borderWidth: 2,
            borderColor: borderSurface
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: tickColor, font: { size: 11 } } }
          }
        }
      })
    }
  }
}

onMounted(() => {
  renderCharts()
  window.addEventListener('cnc:theme-changed', renderCharts)
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('cnc:theme-changed', renderCharts)
  }
  if (trendChartInstance) trendChartInstance.destroy()
  if (gradeChartInstance) gradeChartInstance.destroy()
})

watch(() => [orders.value.length, plates.value.length], () => {
  renderCharts()
})
</script>

