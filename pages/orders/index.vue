<template>
  <div class="space-y-4">
    <!-- Success Banner -->
    <div 
      v-if="$route.query.created" 
      class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs"
    >
      <span class="flex items-center gap-2">
        <i class="fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400 text-base"></i>
        Order baru berhasil dibuat dan tercatat di database!
      </span>
      <button @click="$router.replace('/orders')" class="text-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-300 font-bold text-sm cursor-pointer">&times;</button>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-wrap gap-2.5 text-xs items-center">
      <div class="relative flex-1 min-w-[220px]">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari No. Order, Proyek, Pemesan..." 
          class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:bg-white focus:border-blue-600 outline-none"
        >
      </div>

      <select 
        v-model="selectedType" 
        class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white outline-none"
      >
        <option value="">Semua Jenis Pekerjaan</option>
        <option>Pemotongan Plat Baru</option>
        <option>Pembuatan Part Baru</option>
        <option>Cutting Nesting / Gambar Kerja</option>
        <option value="Lainnya">Lainnya</option>
      </select>

      <select 
        v-model="selectedStatus" 
        class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white outline-none"
      >
        <option value="">Semua Status</option>
        <option value="Menunggu Estimasi">Menunggu Estimasi</option>
        <option value="Menunggu Persetujuan Pemesan">Persetujuan Pemesan</option>
        <option value="Estimasi Selesai">Estimasi Selesai</option>
        <option value="Diterima">Diterima</option>
        <option value="Sedang Dipotong">Sedang Dipotong</option>
        <option value="Siap Diambil">Siap Diambil</option>
        <option value="Sudah Diambil">Sudah Diambil</option>
      </select>

      <button 
        v-if="searchQuery || selectedType || selectedStatus" 
        @click="resetFilters" 
        class="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold px-2 py-2 cursor-pointer"
      >
        Reset Filter
      </button>
    </div>

    <!-- Orders Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-extrabold text-left">
            <tr>
              <th class="p-3.5">No. Order</th>
              <th class="p-3.5">Pekerjaan / Jenis</th>
              <th class="p-3.5">Proyek</th>
              <th class="p-3.5">Pemesan</th>
              <th class="p-3.5">Material</th>
              <th class="p-3.5">Tebal</th>
              <th class="p-3.5">Jumlah</th>
              <th class="p-3.5">Status</th>
              <th class="p-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="o in filteredOrders" :key="o.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 align-top transition">
              <td class="p-3.5 font-mono font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                {{ o.no_order }}
                <div class="text-[10px] font-sans font-normal text-slate-400 mt-0.5">{{ o.target_cnc }}</div>
              </td>
              <td class="p-3.5 min-w-[210px]">
                <div class="font-bold text-slate-900 dark:text-white">{{ o.deskripsi_pekerjaan }}</div>
                <span class="inline-block mt-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold" :class="getTypeBadge(o.jenis_pekerjaan_kategori)">
                  {{ o.jenis_pekerjaan }}
                </span>
                <div v-if="o.drawing_file_name" class="mt-1 text-[10px] text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1">
                  <i class="fa-solid fa-paperclip"></i>
                  <span>{{ o.drawing_file_name }}</span>
                </div>
              </td>
              <td class="p-3.5 min-w-[140px]">
                <div class="font-bold text-slate-800 dark:text-slate-200">{{ o.nama_proyek }}</div>
                <div class="text-[10px] text-slate-500">{{ o.nama_proyek_kapal }}</div>
              </td>
              <td class="p-3.5">
                <div class="font-semibold text-slate-800 dark:text-slate-200">{{ o.nama_pemesan }}</div>
                <div class="text-[10px] text-slate-400">{{ o.departemen_pemesan }}</div>
              </td>
              <td class="p-3.5 text-slate-700 dark:text-slate-300">{{ o.material }}</td>
              <td class="p-3.5 whitespace-nowrap font-mono text-slate-800 dark:text-slate-200">{{ o.ketebalan }}</td>
              <td class="p-3.5 font-mono font-bold whitespace-nowrap text-slate-900 dark:text-white">
                {{ o.jumlah_pesanan }} {{ o.satuan }}
              </td>
              <td class="p-3.5 whitespace-nowrap">
                <span class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border" :class="getStatusBadge(o.status)">
                  {{ normalizeStatus(o.status) }}
                </span>
                <div v-if="o.plat_dipakai" class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  {{ o.plat_dipakai }}
                </div>
              </td>
              <td class="p-3.5 text-center whitespace-nowrap space-y-1">
                <!-- Estimasi Button -->
                <NuxtLink 
                  v-if="isFullAccess && o.status === 'Menunggu Estimasi'" 
                  :to="`/estimation?order_id=${o.id}`" 
                  class="inline-block bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-xs"
                >
                  Estimasi
                </NuxtLink>

                <!-- Setujui Button -->
                <button 
                  v-if="isFullAccess && o.status === 'Menunggu Persetujuan Pemesan'" 
                  @click="handleApprove(o.id)" 
                  class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer"
                >
                  Setujui
                </button>

                <!-- PIN Button -->
                <NuxtLink 
                  v-if="o.status === 'Siap Diambil' && o.kode_pengambilan" 
                  :to="`/pickup-verify?order_id=${o.id}`" 
                  class="inline-block font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg font-extrabold text-[11px]"
                >
                  PIN: {{ o.kode_pengambilan }}
                </NuxtLink>

                <!-- Drawing download/preview -->
                <div v-if="o.drawing_data_url">
                  <a 
                    :href="o.drawing_data_url" 
                    :download="o.drawing_file_name || 'drawing-cnc'" 
                    class="text-blue-700 dark:text-blue-400 hover:underline text-[10px] font-semibold"
                  >
                    <i class="fa-solid fa-download mr-0.5"></i> Lihat File
                  </a>
                </div>

                <div v-if="!isFullAccess && o.status !== 'Siap Diambil' && !o.drawing_data_url" class="text-slate-400 text-[10px] italic">
                  Informasi
                </div>
              </td>
            </tr>

            <tr v-if="filteredOrders.length === 0">
              <td colspan="9" class="p-10 text-center text-slate-400 text-xs italic">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-slate-300 dark:text-slate-700"></i>
                Belum ada order pemotongan plat. Silakan buat Order Baru.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCncStore } from '~/composables/useCncStore'

const { orders, approveEstimation, currentUser } = useCncStore()

const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')

const isFullAccess = computed(() => {
  return currentUser.value?.role === 'admin' || currentUser.value?.role === 'mandor'
})

const filteredOrders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return orders.value.filter(o => {
    const matchSearch = !query || 
      o.no_order.toLowerCase().includes(query) ||
      o.nama_proyek.toLowerCase().includes(query) ||
      o.nama_pemesan.toLowerCase().includes(query) ||
      o.deskripsi_pekerjaan.toLowerCase().includes(query)

    const matchType = !selectedType.value || o.jenis_pekerjaan_kategori === selectedType.value
    
    let matchStatus = true
    if (selectedStatus.value) {
      if (selectedStatus.value === 'Diterima') {
        matchStatus = ['Diterima Operator', 'Plat Telah Diambil Yard'].includes(o.status)
      } else {
        matchStatus = o.status === selectedStatus.value
      }
    }

    return matchSearch && matchType && matchStatus
  })
})

function normalizeStatus(st: string): string {
  if (['Diterima Operator', 'Plat Telah Diambil Yard'].includes(st)) return 'Diterima'
  if (st === 'Menunggu Persetujuan Pemesan') return 'Estimasi Selesai'
  return st
}

function getStatusBadge(st: string): string {
  const norm = normalizeStatus(st)
  if (norm === 'Menunggu Estimasi') return 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  if (norm === 'Estimasi Selesai') return 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  if (norm === 'Diterima') return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
  if (norm === 'Sedang Dipotong') return 'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800'
  if (norm === 'Siap Diambil') return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
}

function getTypeBadge(cat: string): string {
  const map: Record<string, string> = {
    'Pemotongan Plat Baru': 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Pemotongan Plat Remnant / Sisa': 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'Repair / Perbaikan': 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'Pembuatan Part Baru': 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    'Cutting Nesting / Gambar Kerja': 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
  }
  return map[cat] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
}

function resetFilters() {
  searchQuery.value = ''
  selectedType.value = ''
  selectedStatus.value = ''
}

async function handleApprove(orderId: number) {
  await approveEstimation(orderId)
}
</script>

