<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-fire-burner text-cyan-500"></i>
          <span>Workshop Operator Mesin CNC</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        </p>
      </div>

      <NuxtLink 
        to="/pickup-verify" 
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
      >
        <i class="fa-solid fa-key text-emerald-500"></i>
        <span>Verifikasi PIN Pengambilan</span>
      </NuxtLink>
    </div>

    <!-- Alert / Toast -->
    <div 
      v-if="toastMsg" 
      class="p-4 rounded-2xl flex items-center justify-between gap-3 transition bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 text-xs font-semibold"
    >
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-circle-check text-cyan-500"></i>
        <span>{{ toastMsg }}</span>
      </div>
      <button @click="toastMsg = null" class="opacity-70 hover:opacity-100">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Group CNC Machine Tabs -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
        <button 
          v-for="group in groups" 
          :key="group"
          @click="activeGroup = group" 
          class="px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer"
          :class="activeGroup === group 
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'"
        >
          <span>{{ group }}</span>
          <span 
            class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
            :class="activeGroup === group ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
          >
            {{ getGroupCount(group) }}
          </span>
        </button>
      </div>

      <div class="text-[11px] font-mono text-slate-500 dark:text-slate-400">
        Antrian Mesin: <b>{{ groupOrders.length }}</b> order aktif
      </div>
    </div>

    <!-- Orders Cards List -->
    <div class="space-y-4">
      <div 
        v-for="o in groupOrders" 
        :key="o.id"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4 hover:shadow-md transition"
      >
        <!-- Card Top Bar -->
        <div class="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <span class="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
              {{ o.no_order }}
            </span>
            <span 
              class="text-[10px] px-2.5 py-0.5 rounded-lg font-bold border"
              :class="getStatusBadgeClass(o.status)"
            >
              {{ o.status }}
            </span>
            <span v-if="o.target_cnc" class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              {{ o.target_cnc }}
            </span>
          </div>

          <div class="text-xs text-slate-500 dark:text-slate-400">
            Pemesan: <b class="text-slate-800 dark:text-slate-200">{{ o.nama_pemesan }}</b> ({{ o.departemen_pemesan }})
          </div>
        </div>

        <!-- Card Grid Details -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Nama Part / Proyek</div>
            <div class="font-black text-slate-900 dark:text-white text-sm mt-0.5">{{ o.nama_proyek }}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">
              {{ o.nama_proyek_kapal }} &bull; {{ o.deskripsi_pekerjaan }}
            </div>
          </div>

          <div>
            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Jumlah & Spesifikasi</div>
            <div class="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {{ o.jumlah_pesanan }} {{ o.satuan }} ({{ o.material }} - {{ o.ketebalan }})
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">
              Dimensi part: {{ o.ukuran_part }}
            </div>
            <div v-if="o.plat_dipakai" class="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold mt-1 flex items-center gap-1">
              <i class="fa-solid fa-layer-group text-[10px]"></i>
              <span>Plat: {{ o.plat_dipakai }}</span>
            </div>
          </div>

          <div>
            <div class="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Target & Waktu Mesin</div>
            <div class="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              Target Ambil: {{ o.waktu_pengambilan_diinginkan }}
            </div>
            <div v-if="o.waktu_mulai" class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Mulai: {{ new Date(o.waktu_mulai).toLocaleTimeString('id-ID') }}
            </div>
            <div v-if="o.waktu_selesai" class="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono font-semibold">
              Selesai: {{ new Date(o.waktu_selesai).toLocaleTimeString('id-ID') }}
            </div>
          </div>
        </div>

        <!-- Card Action Footer -->
        <div class="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <!-- Drawing link if any -->
          <div>
            <a 
              v-if="o.drawing_data_url" 
              :href="sanitizeUrl(o.drawing_data_url)" 
              target="_blank" 
              download="drawing.png" 
              class="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              <i class="fa-solid fa-paperclip"></i>
              <span>Lihat Gambar Kerja ({{ o.drawing_file_name || 'drawing' }})</span>
            </a>
          </div>

          <!-- Operator State Buttons -->
          <div class="flex items-center gap-2">
            <!-- Step 1: Terima Order -->
            <button 
              v-if="o.status === 'Diterima'"
              @click="handleAccept(o.id)" 
              class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition flex items-center gap-1.5"
            >
              <i class="fa-solid fa-check"></i>
              <span>TERIMA ORDER</span>
            </button>

            <!-- Step 2: Start Pemotongan -->
            <button 
              v-if="o.status === 'Diterima Operator' || o.status === 'Plat Telah Diambil Yard'"
              @click="handleStart(o.id)" 
              class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition flex items-center gap-1.5"
            >
              <i class="fa-solid fa-play"></i>
              <span>START PEMOTONGAN</span>
            </button>

            <!-- Step 3: Finish Pemotongan (Auto PIN) -->
            <button 
              v-if="o.status === 'Sedang Dipotong'"
              @click="handleFinish(o.id)" 
              class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 animate-pulse"
            >
              <i class="fa-solid fa-flag-checkered"></i>
              <span>FINISH POTONG (BUAT PIN 6-DIGIT)</span>
            </button>

            <!-- Step 4: Siap Diambil / PIN Badge -->
            <div 
              v-if="o.status === 'Siap Diambil'"
              class="font-mono text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 font-black flex items-center gap-2"
            >
              <i class="fa-solid fa-key text-emerald-500"></i>
              <span>PIN RESMI: {{ o.kode_pengambilan }}</span>
            </div>

            <!-- Step 5: Sudah Diambil -->
            <div 
              v-if="o.status === 'Sudah Diambil'"
              class="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold flex items-center gap-2"
            >
              <i class="fa-solid fa-circle-check text-emerald-500"></i>
              <span>SUDAH DISERAHKAN ({{ o.pengambil_akhir }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div 
        v-if="groupOrders.length === 0" 
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 text-xs italic space-y-2"
      >
        <i class="fa-solid fa-fire-burner text-4xl mb-2 block text-slate-300 dark:text-slate-700"></i>
        <p>Belum ada order antrian masuk untuk <b>{{ activeGroup }}</b>.</p>
        <p class="text-[11px] text-slate-400 dark:text-slate-600">Order baru yang dibuat akan langsung masuk ke antrian operator di sini.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCncStore } from '~/composables/useCncStore'
import { useSecurity } from '~/composables/useSecurity'

const store = useCncStore()
const { sanitizeUrl } = useSecurity()

const groups = ['Group CNC 1', 'Group CNC 2', 'Group CNC 3', 'Group CNC 4']
const activeGroup = ref('Group CNC 1')
const toastMsg = ref<string | null>(null)

function getGroupCount(g: string): number {
  return store.orders.value.filter(o => o.target_cnc === g && o.status !== 'Sudah Diambil').length
}

const groupOrders = computed(() => {
  return store.orders.value.filter(o => o.target_cnc === activeGroup.value)
})

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'Diterima':
      return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    case 'Diterima Operator':
    case 'Plat Telah Diambil Yard':
      return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    case 'Sedang Dipotong':
      return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    case 'Siap Diambil':
      return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    case 'Sudah Diambil':
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

async function handleAccept(orderId: number) {
  await store.operatorAccept(orderId)
  toastMsg.value = `Order #${orderId} telah DITERIMA oleh Operator CNC.`
}

async function handleStart(orderId: number) {
  await store.operatorStart(orderId)
  toastMsg.value = `Proses potong dimulai untuk Order #${orderId}!`
}

async function handleFinish(orderId: number) {
  const pin = await store.operatorFinish(orderId)
  toastMsg.value = `Pemotongan selesai! Kode PIN Pengambilan 6-Digit dibuat: ${pin}. Pemesan sekarang dapat mengambil barang!`
}

onMounted(() => {
  store.initStore()
})
</script>

