<template>
  <div class="space-y-5">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-clock-rotate-left text-blue-500"></i>
          <span>History & Traceability (Audit Trail Galangan)</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        </p>
      </div>

      <div class="flex items-center gap-2 no-print shrink-0">
        <button 
          @click="handleExportCsv" 
          class="text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs transition flex items-center gap-1.5"
        >
          <i class="fa-solid fa-file-csv text-emerald-500"></i>
          <span>Export CSV</span>
        </button>
        <button 
          @click="handlePrint" 
          class="text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs transition flex items-center gap-1.5"
        >
          <i class="fa-solid fa-print text-blue-500"></i>
          <span>Cetak Rekap</span>
        </button>
      </div>
    </div>

    <!-- Alert / Toast -->
    <div 
      v-if="toast" 
      class="p-4 rounded-2xl flex items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold no-print"
    >
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-circle-check text-emerald-500"></i>
        <span>{{ toast }}</span>
      </div>
      <button @click="toast = null" class="opacity-70 hover:opacity-100">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-wrap gap-2.5 text-xs no-print">
      <div class="relative flex-1 min-w-[240px]">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Lacak No. Order, Nama Proyek, Heat Number, atau PIN..." 
          class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <select 
        v-model="filterGroup" 
        class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Semua Mesin CNC</option>
        <option value="CNC 1">CNC 1</option>
        <option value="CNC 2">CNC 2</option>
        <option value="CNC 3">CNC 3</option>
        <option value="CNC 4">CNC 4</option>
      </select>

      <select 
        v-model="filterStatus" 
        class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="all">Semua Riwayat ({{ store.orders.value.length }})</option>
        <option value="Sudah Diambil">Khusus Sudah Selesai & Diambil</option>
        <option value="Siap Diambil">Siap Diambil (Menunggu PIN)</option>
        <option value="Sedang Dipotong">Sedang Dipotong</option>
      </select>
    </div>

    <!-- Print-only Official Report Header (Kop Dokumen Resmi Galangan) -->
    <div class="print-only mb-3 pb-2.5 border-b-2 border-slate-900">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm tracking-wider">
            CNC
          </div>
          <div>
            <h1 class="text-sm font-black uppercase tracking-tight text-slate-900 leading-tight">
              PT DOK DAN PERKAPALAN SURABAYA (PERSERO)
            </h1>
            <p class="text-[11px] font-bold text-slate-800">
              Bengkel Pemotongan Plat CNC — Laporan Riwayat & Traceability Material
            </p>
          </div>
        </div>
        <div class="text-right text-[9.5px] text-slate-600 font-mono">
          <div>No. Dok: REKAP-HIST-CNC</div>
          <div>Tanggal Cetak: {{ printDateTime }}</div>
        </div>
      </div>

      <!-- Filter & Metadata Box in Print -->
      <div class="mt-2 pt-2 border-t border-slate-200 grid grid-cols-4 gap-2 text-[9.5px] text-slate-800 bg-slate-50 p-2 rounded">
        <div><span class="text-slate-500">Filter Mesin:</span> <b>{{ filterGroup || 'Semua Mesin CNC' }}</b></div>
        <div><span class="text-slate-500">Filter Status:</span> <b>{{ filterStatus === 'all' ? 'Semua Riwayat' : filterStatus }}</b></div>
        <div><span class="text-slate-500">Total Data:</span> <b>{{ filteredOrders.length }} Order</b></div>
        <div><span class="text-slate-500">Dicetak Oleh:</span> <b>{{ store.currentUser.value?.name || 'Administrator CNC' }}</b></div>
      </div>
    </div>

    <!-- History Table Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden print:border-0 print:shadow-none">
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print">
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <i class="fa-solid fa-list-check text-blue-500"></i>
          <span>Daftar Log Riwayat Pemotongan & Pengambilan</span>
        </h2>
        <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">Total: {{ filteredOrders.length }} data</span>
      </div>

      <div class="overflow-x-auto print:overflow-visible">
        <table class="w-full text-xs print-table">
          <thead class="bg-slate-50 dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black">
            <tr>
              <th class="p-2.5 text-center w-8">NO</th>
              <th class="p-2.5 text-center">NO. ORDER</th>
              <th class="p-2.5 text-left">PEMESAN</th>
              <th class="p-2.5 text-center">DEPARTEMEN</th>
              <th class="p-2.5 text-left">PROJECT NAME</th>
              <th class="p-2.5 text-center">NO. KAPAL</th>
              <th class="p-2.5 text-left">SPEC. OF MATERIAL</th>
              <th class="p-2.5 text-center">HEAT NUMBER</th>
              <th class="p-2.5 text-center">PRODUCT NUMBER</th>
              <th class="p-2.5 text-center">MESIN CNC</th>
              <th class="p-2.5 text-left">DIMENSI</th>
              <th class="p-2.5 text-center">WAKTU SELESAI</th>
              <th class="p-2.5 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-[11px]">
            <tr 
              v-for="(o, idx) in filteredOrders" 
              :key="o.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="p-2.5 text-center font-mono font-bold text-slate-500 dark:text-slate-400">
                {{ idx + 1 }}
              </td>
              <td class="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap text-center">
                {{ o.no_order }}
              </td>
              <td class="p-2.5 font-bold text-slate-900 dark:text-slate-100">
                {{ o.nama_pemesan }}
              </td>
              <td class="p-2.5 text-center font-semibold text-slate-600 dark:text-slate-300">
                {{ o.departemen_pemesan }}
              </td>
              <td class="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                {{ o.nama_proyek || o.estimation?.project_name || '-' }}
              </td>
              <td class="p-2.5 text-center font-mono text-slate-600 dark:text-slate-300">
                {{ o.nama_proyek_kapal || o.estimation?.block_item || '-' }}
              </td>
              <td class="p-2.5 font-bold text-cyan-700 dark:text-cyan-400">
                {{ o.estimation?.spec_material || o.estimation?.grade || o.material || '-' }}
              </td>
              <td class="p-2.5 text-center font-mono text-slate-700 dark:text-slate-300">
                {{ o.estimation?.heat_number || '-' }}
              </td>
              <td class="p-2.5 text-center font-mono text-slate-700 dark:text-slate-300">
                {{ o.estimation?.product_number || o.ukuran_part || '-' }}
              </td>
              <td class="p-2.5 text-center font-bold text-slate-800 dark:text-slate-200">
                {{ o.target_cnc?.replace(/^Gr(oup|up)\s*/i, '') || o.target_cnc || '-' }}
              </td>
              <td class="p-2.5 font-mono text-slate-700 dark:text-slate-300 text-[10.5px]">
                {{ o.estimation?.dimension_material || o.ukuran_part || (o.ketebalan ? o.ketebalan + ' mm' : '-') }}
              </td>
              <td class="p-2.5 text-center font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {{ formatWaktuSelesai(o) }}
              </td>
              <td class="p-2.5 text-center whitespace-nowrap">
                <span 
                  class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border print:border-0 print:p-0 print:text-black"
                  :class="getStatusBadgeClass(o.status)"
                >
                  {{ o.status }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="13" class="p-10 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                <i class="fa-solid fa-clock-rotate-left text-3xl mb-2 block text-slate-300 dark:text-slate-700"></i>
                Tidak ada riwayat pemotongan yang cocok dengan filter pencarian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Print-only Signature Footer (Lembar Pengesahan Resmi) -->
    <div class="print-only mt-6 pt-3 border-t border-slate-300">
      <div class="text-[10px] text-slate-600 mb-5 text-right font-mono">
        Surabaya, {{ printDateOnly }}
      </div>
      <div class="grid grid-cols-3 gap-6 text-center text-[10px]">
        <div>
          <p class="text-slate-700 font-bold mb-12">Disiapkan Oleh (Operator CNC)</p>
          <div class="border-t border-slate-900 mx-auto w-40 pt-1 font-bold text-slate-900">
            ( ..................................... )
          </div>
        </div>
        <div>
          <p class="text-slate-700 font-bold mb-12">Diperiksa Oleh (Quality Control / Yard)</p>
          <div class="border-t border-slate-900 mx-auto w-40 pt-1 font-bold text-slate-900">
            ( ..................................... )
          </div>
        </div>
        <div>
          <p class="text-slate-700 font-bold mb-12">Disetujui Oleh (Supervisor CNC)</p>
          <div class="border-t border-slate-900 mx-auto w-40 pt-1 font-bold text-slate-900">
            ( ..................................... )
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCncStore } from '~/composables/useCncStore'

const store = useCncStore()

const searchQuery = ref('')
const filterGroup = ref('')
const filterStatus = ref('all')
const toast = ref<string | null>(null)

const filteredOrders = computed(() => {
  return store.orders.value.filter(o => {
    // Status filter
    if (filterStatus.value !== 'all' && o.status !== filterStatus.value) return false
    // Mesin filter
    if (filterGroup.value) {
      const cleanFilter = filterGroup.value.replace(/^Gr(oup|up)\s*/i, '').trim().toLowerCase()
      const cleanTarget = (o.target_cnc || '').replace(/^Gr(oup|up)\s*/i, '').trim().toLowerCase()
      if (cleanFilter !== cleanTarget && o.target_cnc !== filterGroup.value) return false
    }
    // Search query filter
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchNo = o.no_order.toLowerCase().includes(q)
      const matchProyek = o.nama_proyek.toLowerCase().includes(q)
      const matchKapal = (o.nama_proyek_kapal || '').toLowerCase().includes(q)
      const matchPemesan = o.nama_pemesan.toLowerCase().includes(q)
      const matchDept = (o.departemen_pemesan || '').toLowerCase().includes(q)
      const matchPin = (o.kode_pengambilan || '').toLowerCase().includes(q)
      const matchPlat = (o.plat_dipakai || '').toLowerCase().includes(q)
      const matchEstProject = (o.estimation?.project_name || '').toLowerCase().includes(q)
      const matchHeat = (o.estimation?.heat_number || '').toLowerCase().includes(q)
      const matchProd = (o.estimation?.product_number || '').toLowerCase().includes(q)
      const matchSpec = (o.estimation?.spec_material || '').toLowerCase().includes(q)
      const matchStatus = (o.status || '').toLowerCase().includes(q)
      if (
        !matchNo && !matchProyek && !matchKapal && !matchPemesan && 
        !matchDept && !matchPin && !matchPlat && !matchEstProject && 
        !matchHeat && !matchProd && !matchSpec && !matchStatus
      ) {
        return false
      }
    }
    return true
  })
})

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'Sudah Diambil':
      return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    case 'Siap Diambil':
      return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    case 'Sedang Dipotong':
      return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    case 'Diterima':
      return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

function formatWaktuSelesai(o: any): string {
  const t = o.waktu_selesai || o.waktu_diambil
  if (!t) return '-'
  try {
    const d = new Date(t)
    if (isNaN(d.getTime())) return '-'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${mins}`
  } catch {
    return '-'
  }
}

const printDateTime = computed(() => new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }))
const printDateOnly = computed(() => new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }))

function handleExportCsv() {
  const ok = store.exportHistoryCsv(filteredOrders.value)
  if (ok) {
    const today = new Date().toISOString().split('T')[0]
    toast.value = `File Rekap_History_Pemotongan_CNC_${today}.csv (${filteredOrders.value.length} baris data) berhasil diunduh!`
  } else {
    toast.value = 'Tidak ada data order yang cocok untuk diekspor.'
  }
}

function handlePrint() {
  if (typeof window !== 'undefined') {
    window.print()
  }
}

onMounted(() => {
  store.initStore()
})
</script>

