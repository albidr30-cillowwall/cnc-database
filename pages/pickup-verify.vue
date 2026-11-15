<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-key text-emerald-500"></i>
          <span>Pengambilan Barang & Verifikasi PIN 6-Digit</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Bagian 6: Kode verifikasi resmi serah terima barang antara Pemesan/User dan Operator CNC
        </p>
      </div>

      <NuxtLink 
        v-if="isFullAccess"
        to="/history" 
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
      >
        <i class="fa-solid fa-clock-rotate-left text-blue-500"></i>
        <span>Lihat History & Audit Trail</span>
      </NuxtLink>
    </div>

    <!-- Feedback Banner -->
    <div 
      v-if="feedback" 
      class="p-4 rounded-2xl flex items-center justify-between gap-3 transition"
      :class="feedback.type === 'success' 
        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
        : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'"
    >
      <div class="flex items-center gap-2.5 text-xs font-semibold">
        <i :class="feedback.type === 'success' ? 'fa-solid fa-circle-check text-emerald-500' : 'fa-solid fa-triangle-exclamation text-rose-500'"></i>
        <span>{{ feedback.text }}</span>
      </div>
      <button @click="feedback = null" class="text-xs opacity-70 hover:opacity-100">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Dual Column Layout: Left = Pemesan/Vault, Right = Operator Verification -->
    <div class="max-w-5xl mx-auto grid grid-cols-1" :class="isFullAccess ? 'md:grid-cols-2 gap-6' : 'max-w-xl'">
      <!-- SISI 1: PEMESAN / USER (PIN VAULT BOX) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 class="text-xs font-extrabold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <i class="fa-solid fa-user-tag"></i>
            <span>1. Sisi Pemesan (Kode PIN Anda)</span>
          </h2>
          <span class="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            Siap Diambil
          </span>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Pilih Order yang Sudah Siap Diambil:
          </label>
          <select 
            v-model="selectedOrderId" 
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option :value="null">-- Pilih Order Siap Diambil --</option>
            <option 
              v-for="ro in readyOrders" 
              :key="ro.id" 
              :value="ro.id"
            >
              {{ ro.no_order }} - {{ ro.nama_proyek }} ({{ ro.target_cnc }})
            </option>
          </select>
        </div>

        <!-- Order Summary if selected -->
        <div v-if="selectedOrder" class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
          <div class="flex justify-between">
            <span class="text-slate-400">Pemesan:</span>
            <b class="text-slate-800 dark:text-slate-200">{{ selectedOrder.nama_pemesan }} ({{ selectedOrder.departemen_pemesan }})</b>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Proyek / Kapal:</span>
            <b class="text-slate-800 dark:text-slate-200">{{ selectedOrder.nama_proyek }} ({{ selectedOrder.nama_proyek_kapal }})</b>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Material & Jumlah:</span>
            <b class="text-slate-800 dark:text-slate-200">{{ selectedOrder.material }} {{ selectedOrder.ketebalan }} - {{ selectedOrder.jumlah_pesanan }} pcs</b>
          </div>
        </div>

        <!-- BIG PIN VAULT DISPLAY -->
        <div class="pin-vault-box rounded-3xl p-6 text-center shadow-xl space-y-3 text-white border border-cyan-500/30">
          <div class="text-[11px] font-black uppercase tracking-widest text-cyan-300 flex items-center justify-center gap-2">
            <i class="fa-solid fa-shield-halved"></i>
            <span>KODE PENGAMBILAN RESMI (PIN 6-DIGIT)</span>
          </div>

          <div class="text-5xl font-black font-mono tracking-widest text-white py-2 select-all drop-shadow-md">
            {{ selectedOrder?.kode_pengambilan || '------' }}
          </div>

          <div class="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            Tunjukkan atau sebutkan kode 6-digit di atas kepada Operator CNC saat mengambil barang fisik di workshop.
          </div>
        </div>
      </div>

      <!-- SISI 2: OPERATOR CNC (INPUT & VERIFIKASI) - ADMIN & MANDOR ONLY -->
      <div 
        v-if="isFullAccess"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5"
      >
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 class="text-xs font-extrabold uppercase text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
            <i class="fa-solid fa-shield-check"></i>
            <span>2. Sisi Operator CNC (Input & Verifikasi)</span>
          </h2>
          <span class="text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-200 dark:border-cyan-800">
            Verifikator
          </span>
        </div>

        <form @submit.prevent="handleVerifyPin" class="space-y-4 text-xs">
          <div>
            <label class="block text-amber-600 dark:text-amber-400 font-extrabold uppercase mb-1.5">
              Masukkan Kode PIN Pengambilan dari Pemesan *
            </label>
            <input 
              v-model="inputPin" 
              type="text" 
              required 
              maxlength="10" 
              placeholder="Ketik 6-Digit PIN..." 
              :disabled="!selectedOrder"
              class="w-full bg-slate-50 dark:bg-slate-950 border-2 border-blue-500 rounded-2xl p-3 text-3xl font-black font-mono tracking-widest text-center text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Nama Pengambil Fisik *</label>
            <input 
              v-model="inputPengambil" 
              type="text" 
              required 
              placeholder="Nama personil pengambil..." 
              :disabled="!selectedOrder"
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Departemen Pengambil *</label>
            <input 
              v-model="inputDepartemen" 
              type="text" 
              required 
              placeholder="contoh: Hull Construction, Outfitting..." 
              :disabled="!selectedOrder"
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            />
          </div>

          <button 
            type="submit" 
            :disabled="!selectedOrder || !inputPin"
            class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-extrabold p-4 rounded-xl shadow-lg shadow-emerald-600/25 text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <i class="fa-solid fa-check-double"></i>
            <span>VERIFIKASI KODE & KONFIRMASI DIAMBIL</span>
          </button>
        </form>

        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <div class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <i class="fa-solid fa-lock text-emerald-500"></i>
            <span>Keamanan Serah Terima Material</span>
          </div>
          <p>Setelah verifikasi berhasil, order akan otomatis berstatus 'Sudah Diambil' dan status plat di yard diupdate menjadi 'Sudah Dipotong'. Data tersimpan di History secara permanen.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCncStore } from '~/composables/useCncStore'

const route = useRoute()
const store = useCncStore()

const selectedOrderId = ref<number | null>(null)
const inputPin = ref('')
const inputPengambil = ref('')
const inputDepartemen = ref('')
const feedback = ref<{ text: string; type: 'success' | 'error' } | null>(null)

const isFullAccess = computed(() => {
  const role = store.currentUser.value?.role
  return role === 'admin' || role === 'operator' || role === 'mandor'
})

const readyOrders = computed(() => {
  return store.orders.value.filter(o => o.status === 'Siap Diambil' && Boolean(o.kode_pengambilan))
})

const selectedOrder = computed(() => {
  if (!selectedOrderId.value) return null
  return store.orders.value.find(o => o.id === selectedOrderId.value) || null
})

// Auto-populate verifier form fields when selected order changes
watch(selectedOrder, (order) => {
  if (order) {
    inputPengambil.value = order.nama_pemesan || ''
    inputDepartemen.value = order.departemen_pemesan || ''
  }
}, { immediate: true })

async function handleVerifyPin() {
  if (!selectedOrder.value || !inputPin.value) return

  const success = await store.verifyPin(
    selectedOrder.value.id,
    inputPin.value,
    inputPengambil.value,
    inputDepartemen.value
  )

  if (success) {
    feedback.value = {
      type: 'success',
      text: `PIN BERHASIL DIVERIFIKASI! Barang untuk order ${selectedOrder.value.no_order} resmi diserahkan kepada ${inputPengambil.value} (${inputDepartemen.value}). Status telah diperbarui di audit trail.`
    }
    inputPin.value = ''
    selectedOrderId.value = null
  } else {
    feedback.value = {
      type: 'error',
      text: 'PIN SALAH! Kode PIN yang Anda masukkan tidak cocok dengan sistem. Silahkan cek kembali kode pada Pemesan.'
    }
  }
}

onMounted(() => {
  store.initStore()

  // Auto select from query
  if (route.query.order_id) {
    const oid = Number(route.query.order_id)
    if (oid) selectedOrderId.value = oid
  } else if (readyOrders.value.length > 0) {
    selectedOrderId.value = readyOrders.value[0].id
  }
})
</script>

