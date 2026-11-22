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
        <div class="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-400 font-semibold">
          <span>Antrian Operator</span>
          <i class="fa-solid fa-inbox text-indigo-500"></i>
        </div>
        <div class="text-2xl font-extrabold font-mono mt-2 text-indigo-600 dark:text-indigo-400">{{ waitingAcceptCount }}</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Order Diterima</div>
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

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
          <span>Plat Tersedia (Yard)</span>
          <i class="fa-solid fa-layer-group text-emerald-500"></i>
        </div>
        <div class="text-2xl font-extrabold font-mono mt-2 text-slate-900 dark:text-white">{{ availPlatesCount }} Lembar</div>
        <div class="text-[11px] font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">{{ totalWeightTon.toFixed(2) }} Ton</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <i class="fa-solid fa-chart-line text-blue-500"></i>
              <span>Grafik Order per Minggu</span>
            </h2>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Bulan {{ currentPeriodLabel }}
            </span>
          </div>
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
          <span class="text-[11px] font-mono font-semibold text-slate-400">Total {{ plates.length }} Plat</span>
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
                <th class="pb-2.5">Mesin CNC</th>
                <th class="pb-2.5">Qty</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="cut in recentCuts" :key="cut.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                <td class="py-2.5 font-mono font-bold text-blue-700 dark:text-blue-400">{{ cut.no_order }}</td>
                <td class="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{{ cut.nama_proyek }}</td>
                <td class="py-2.5 text-cyan-700 dark:text-cyan-400 font-semibold">{{ cut.target_cnc?.replace(/^Gr(oup|up)\s*/i, '') || cut.target_cnc }}</td>
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

const waitingAcceptCount = computed(() => orders.value.filter(o => ['Diterima', 'Menunggu Persetujuan Pemesan', 'Diterima Operator', 'Plat Telah Diambil Yard'].includes(o.status)).length)
const cuttingCount = computed(() => orders.value.filter(o => o.status === 'Sedang Dipotong').length)
const readyCount = computed(() => orders.value.filter(o => o.status === 'Siap Diambil').length)
const completedCount = computed(() => orders.value.filter(o => o.status === 'Sudah Diambil').length)

const availPlates = computed(() => plates.value.filter(p => p.status === 'Tersedia' && (p.stok === undefined || p.stok > 0)))
const availPlatesCount = computed(() => availPlates.value.reduce((acc, p) => acc + (p.stok !== undefined ? p.stok : 1), 0))
const totalWeightTon = computed(() => availPlates.value.reduce((acc, p) => acc + (p.berat_kg * (p.stok !== undefined ? p.stok : 1)), 0) / 1000)
const lowStock = computed(() => plates.value.length > 0 && availPlatesCount.value < 5)

const chartColors = [
  '#2563EB', '#059669', '#D97706', '#0891B2', '#7C3AED', 
  '#DC2626', '#4F46E5', '#0D9488', '#EA580C', '#64748B'
]

const gradeBreakdown = computed(() => {
  if (!plates.value || plates.value.length === 0) return []

  // Setiap item / order plat berdiri sendiri sebagai satu bagian (tidak digabung meskipun grade & tebal sama)
  const items = plates.value.map((p, idx) => {
    const grade = p.grade?.trim() || 'Tanpa Grade'
    const tebal = p.tebal_mm !== undefined && p.tebal_mm !== null && !isNaN(Number(p.tebal_mm))
      ? `${Number(p.tebal_mm)}mm`
      : '-'
    const stok = (p.stok !== undefined && p.stok !== null) ? Number(p.stok) : 1
    const noPlat = p.no_plat || `Plat #${idx + 1}`

    return {
      id: p.id || idx,
      no_plat: noPlat,
      grade,
      tebal,
      stok,
      color: chartColors[idx % chartColors.length]
    }
  })

  // Cek apakah ada kombinasi grade & tebal yang kembar untuk memberi pembeda No. Plat
  const keyCounts: Record<string, number> = {}
  items.forEach(it => {
    const k = `${it.grade}-${it.tebal}`
    keyCounts[k] = (keyCounts[k] || 0) + 1
  })

  return items.map(it => {
    const isDup = keyCounts[`${it.grade}-${it.tebal}`] > 1
    const label = isDup 
      ? `${it.grade} (${it.tebal}) - ${it.stok} Plat (${it.no_plat})`
      : `${it.grade} (${it.tebal}) - ${it.stok} Plat`
    return {
      ...it,
      label
    }
  })
})

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

const monthNamesIndo = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Menghitung statistik order mingguan secara riil dari database (created_at)
const weeklyOrderStats = computed(() => {
  const allOrders = orders.value || []
  const now = new Date()
  let targetYear = now.getFullYear()
  let targetMonth = now.getMonth()

  // Cek apakah ada order di bulan berjalan
  const currentMonthOrders = allOrders.filter(o => {
    const raw = o.created_at || (o as any).waktu_masuk || (o as any).waktu_mulai
    if (!raw) return false
    const d = new Date(raw)
    return !isNaN(d.getTime()) && d.getFullYear() === targetYear && d.getMonth() === targetMonth
  })

  // Jika di bulan sekarang belum ada order tapi di riwayat ada order, tampilkan bulan dari order terakhir
  if (currentMonthOrders.length === 0 && allOrders.length > 0) {
    const sorted = [...allOrders]
      .filter(o => {
        const raw = o.created_at || (o as any).waktu_masuk || (o as any).waktu_mulai
        return raw && !isNaN(new Date(raw).getTime())
      })
      .sort((a, b) => {
        const tA = new Date(a.created_at || (a as any).waktu_masuk || (a as any).waktu_mulai).getTime()
        const tB = new Date(b.created_at || (b as any).waktu_masuk || (b as any).waktu_mulai).getTime()
        return tB - tA
      })
    if (sorted.length > 0) {
      const raw = sorted[0].created_at || (sorted[0] as any).waktu_masuk || (sorted[0] as any).waktu_mulai
      const latestDate = new Date(raw)
      targetYear = latestDate.getFullYear()
      targetMonth = latestDate.getMonth()
    }
  }

  // Filter order sesuai tahun dan bulan target
  const targetOrders = allOrders.filter(o => {
    const raw = o.created_at || (o as any).waktu_masuk || (o as any).waktu_mulai
    if (!raw) return true
    const d = new Date(raw)
    if (isNaN(d.getTime())) return true
    return d.getFullYear() === targetYear && d.getMonth() === targetMonth
  })

  // Pengelompokan 4 Minggu dalam sebulan:
  // Minggu 1: Tgl 1 - 7
  // Minggu 2: Tgl 8 - 14
  // Minggu 3: Tgl 15 - 21
  // Minggu 4: Tgl 22 - akhir bulan (tgl 28/29/30/31)
  const w1Orders = targetOrders.filter(o => {
    const raw = o.created_at || (o as any).waktu_masuk || (o as any).waktu_mulai
    const d = raw ? new Date(raw).getDate() : 1
    return d >= 1 && d <= 7
  })
  const w2Orders = targetOrders.filter(o => {
    const raw = o.created_at || (o as any).waktu_masuk || (o as any).waktu_mulai
    const d = raw ? new Date(raw).getDate() : 1
    return d >= 8 && d <= 14
  })
  const w3Orders = targetOrders.filter(o => {
    const raw = o.created_at || (o as any).waktu_masuk || (o as any).waktu_mulai
    const d = raw ? new Date(raw).getDate() : 1
    return d >= 15 && d <= 21
  })
  const w4Orders = targetOrders.filter(o => {
    const raw = o.created_at || (o as any).waktu_masuk || (o as any).waktu_mulai
    const d = raw ? new Date(raw).getDate() : 1
    return d >= 22
  })

  const weekly = [w1Orders.length, w2Orders.length, w3Orders.length, w4Orders.length]
  const monthName = monthNamesIndo[targetMonth] || 'Bulan Ini'

  return {
    year: targetYear,
    month: targetMonth,
    monthName,
    totalOrders: targetOrders.length,
    weekly,
    labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4']
  }
})

const currentPeriodLabel = computed(() => {
  const stats = weeklyOrderStats.value
  return `${stats.monthName} ${stats.year} • Total ${stats.totalOrders} Order`
})

function renderWeeklyChart() {
  if (!trendCanvas.value) return
  if (trendChartInstance) {
    trendChartInstance.destroy()
    trendChartInstance = null
  }

  if (orders.value.length === 0) return

  const dark = isDark.value
  const tickColor = dark ? '#94a3b8' : '#475569'
  const gridColor = dark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(148, 163, 184, 0.25)'
  const stats = weeklyOrderStats.value
  const chartData = stats.weekly

  const maxVal = Math.max(...chartData, 5)

  trendChartInstance = new Chart(trendCanvas.value, {
    type: 'line',
    data: {
      labels: stats.labels,
      datasets: [{
        label: 'Order per Minggu',
        data: chartData,
        borderColor: dark ? '#60A5FA' : '#2563EB',
        backgroundColor: dark ? 'rgba(96, 165, 250, 0.18)' : 'rgba(37, 99, 235, 0.14)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: dark ? '#60A5FA' : '#2563EB',
        pointBorderColor: dark ? '#0f172a' : '#ffffff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: dark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          titleColor: dark ? '#f8fafc' : '#0f172a',
          bodyColor: dark ? '#cbd5e1' : '#334155',
          borderColor: dark ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          callbacks: {
            title: function(context: any) {
              const idx = context[0].dataIndex
              const ranges = ['Tgl 1 - 7', 'Tgl 8 - 14', 'Tgl 15 - 21', 'Tgl 22 - akhir bulan']
              return `Minggu ${idx + 1} (${ranges[idx]} ${stats.monthName})`
            },
            label: function(context: any) {
              const idx = context.dataIndex
              const wVal = stats.weekly[idx]
              return ` Jumlah Order: ${wVal} order`
            }
          }
        }
      },
      scales: {
        x: { 
          ticks: { color: tickColor, font: { weight: 'bold', size: 11 } }, 
          grid: { color: gridColor } 
        },
        y: { 
          beginAtZero: true, 
          suggestedMax: maxVal,
          ticks: { 
            precision: 0, 
            stepSize: 1,
            color: tickColor,
            font: { size: 11 } 
          }, 
          grid: { color: gridColor } 
        }
      }
    }
  })
}

function renderGradeChart() {
  const dark = isDark.value
  const tickColor = dark ? '#94a3b8' : '#475569'
  const borderSurface = dark ? '#0f172a' : '#FFFFFF'

  if (gradeCanvas.value) {
    if (gradeChartInstance) {
      gradeChartInstance.destroy()
      gradeChartInstance = null
    }

    if (gradeBreakdown.value.length > 0) {
      const items = gradeBreakdown.value

      gradeChartInstance = new Chart(gradeCanvas.value, {
        type: 'doughnut',
        data: {
          labels: items.map(it => it.label),
          datasets: [{
            data: items.map(it => it.stok),
            backgroundColor: items.map(it => it.color),
            borderWidth: 2,
            borderColor: borderSurface
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'right', 
              labels: { 
                color: tickColor, 
                font: { size: 11, weight: 'bold' },
                padding: 12
              } 
            },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  const it = items[context.dataIndex]
                  if (!it) return ''
                  const totalStok = items.reduce((acc, curr) => acc + curr.stok, 0) || 1
                  const pct = ((it.stok / totalStok) * 100).toFixed(0)
                  return [
                    ` No. Plat: ${it.no_plat}`,
                    ` Grade: ${it.grade}`,
                    ` Ketebalan: ${it.tebal}`,
                    ` Jumlah: ${it.stok} Plat (${pct}%)`
                  ]
                }
              }
            }
          }
        }
      })
    }
  }
}

function renderCharts() {
  renderWeeklyChart()
  renderGradeChart()
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

