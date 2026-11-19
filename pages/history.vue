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
        <option value="">Semua Group CNC</option>
        <option value="Group CNC 1">Group CNC 1</option>
        <option value="Group CNC 2">Group CNC 2</option>
        <option value="Group CNC 3">Group CNC 3</option>
        <option value="Group CNC 4">Group CNC 4</option>
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

    <!-- History Table Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <i class="fa-solid fa-list-check text-blue-500"></i>
          <span>Daftar Log Riwayat Pemotongan & Pengambilan</span>
        </h2>
        <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">Total: {{ filteredOrders.length }} data</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-extrabold text-left">
            <tr>
              <th class="p-3.5">No. Order</th>
              <th class="p-3.5">Pemesan</th>
              <th class="p-3.5">Proyek & Kapal</th>
              <th class="p-3.5">Material & Tebal</th>
              <th class="p-3.5">Grade & Heat</th>
              <th class="p-3.5">Group CNC</th>
              <th class="p-3.5">Pengambil</th>
              <th class="p-3.5">PIN</th>
              <th class="p-3.5">Status & Waktu</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr 
              v-for="o in filteredOrders" 
              :key="o.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                {{ o.no_order }}
              </td>
              <td class="p-3.5">
                <div class="font-bold text-slate-900 dark:text-slate-100">{{ o.nama_pemesan }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ o.departemen_pemesan }}</div>
              </td>
              <td class="p-3.5">
                <div class="font-bold text-slate-900 dark:text-slate-100">{{ o.nama_proyek }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ o.nama_proyek_kapal || '-' }}</div>
              </td>
              <td class="p-3.5">
                <div>{{ o.material }} ({{ o.ketebalan }})</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{{ o.jumlah_pesanan }} {{ o.satuan }}</div>
              </td>
              <td class="p-3.5">
                <div class="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{{ o.estimation?.spec_material || o.estimation?.grade || '-' }}</div>
                <div class="text-[10px] font-mono text-slate-400 dark:text-slate-500">{{ o.plat_dipakai || '-' }}</div>
              </td>
              <td class="p-3.5">
                <span class="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{{ o.target_cnc }}</span>
              </td>
              <td class="p-3.5">
                <div class="font-bold text-emerald-600 dark:text-emerald-400">{{ o.pengambil_akhir || o.nama_pemesan }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ o.departemen_pengambil || o.departemen_pemesan }}</div>
              </td>
              <td class="p-3.5 font-mono font-black text-orange-600 dark:text-orange-400">
                {{ o.kode_pengambilan || '-' }}
              </td>
              <td class="p-3.5">
                <span 
                  class="inline-block px-2 py-0.5 rounded text-[10px] font-bold border mb-1"
                  :class="o.status === 'Sudah Diambil' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'"
                >
                  {{ o.status }}
                </span>
                <div class="font-mono text-slate-400 dark:text-slate-500 text-[10px]">
                  {{ o.waktu_diambil ? new Date(o.waktu_diambil).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-' }}
                </div>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="9" class="p-10 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                <i class="fa-solid fa-clock-rotate-left text-3xl mb-2 block text-slate-300 dark:text-slate-700"></i>
                Tidak ada riwayat pemotongan yang cocok dengan filter pencarian.
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

const searchQuery = ref('')
const filterGroup = ref('')
const filterStatus = ref('all')
const toast = ref<string | null>(null)

const filteredOrders = computed(() => {
  return store.orders.value.filter(o => {
    // Status filter
    if (filterStatus.value !== 'all' && o.status !== filterStatus.value) return false
    // Group filter
    if (filterGroup.value && o.target_cnc !== filterGroup.value) return false
    // Search query filter
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchNo = o.no_order.toLowerCase().includes(q)
      const matchProyek = o.nama_proyek.toLowerCase().includes(q)
      const matchKapal = (o.nama_proyek_kapal || '').toLowerCase().includes(q)
      const matchPemesan = o.nama_pemesan.toLowerCase().includes(q)
      const matchPin = (o.kode_pengambilan || '').toLowerCase().includes(q)
      const matchPlat = (o.plat_dipakai || '').toLowerCase().includes(q)
      if (!matchNo && !matchProyek && !matchKapal && !matchPemesan && !matchPin && !matchPlat) {
        return false
      }
    }
    return true
  })
})

function handleExportCsv() {
  const ok = store.exportHistoryCsv()
  if (ok) {
    toast.value = 'File History_Pemotongan_Plat_CNC.csv berhasil diunduh!'
  } else {
    toast.value = 'Tidak ada order yang berstatus "Sudah Diambil" untuk diekspor.'
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

