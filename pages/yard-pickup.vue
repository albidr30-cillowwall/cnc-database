<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-truck-ramp-box text-blue-500"></i>
          <span>Pengambilan Plat (Stock Lock & Bon)</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">

        </p>
      </div>

      <NuxtLink 
        to="/plates" 
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
      >
        <i class="fa-solid fa-layer-group text-amber-500"></i>
        <span>Cek Stok Yard</span>
      </NuxtLink>
    </div>

    <!-- Alert / Feedback Notification -->
    <div 
      v-if="alertMsg" 
      class="p-4 rounded-2xl flex items-center justify-between gap-3 transition"
      :class="alertMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'"
    >
      <div class="flex items-center gap-2.5 text-xs font-semibold">
        <i :class="alertMsg.type === 'success' ? 'fa-solid fa-circle-check text-emerald-500' : 'fa-solid fa-triangle-exclamation text-rose-500'"></i>
        <span>{{ alertMsg.text }}</span>
      </div>
      <button @click="alertMsg = null" class="opacity-70 hover:opacity-100 text-xs">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Form Pengambilan Yard -->
    <form @submit.prevent="handlePickupSubmit" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
      <div>
        <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
          1. Pilih Order yang Disetujui Estimasinya *
        </label>
        <select 
          v-model="form.order_id" 
          required 
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option :value="null">-- Pilih Order Siap Diambil --</option>
          <option 
            v-for="o in readyOrders" 
            :key="o.id" 
            :value="o.id"
          >
            {{ o.no_order }} - {{ o.nama_proyek }} ({{ o.material }} {{ o.ketebalan }}) [{{ o.target_cnc }}]
          </option>
        </select>
        <p v-if="readyOrders.length === 0" class="text-[11px] text-amber-600 dark:text-amber-400 mt-1 italic">
          <i class="fa-solid fa-triangle-exclamation mr-1"></i> Tidak ada order aktif yang siap diambil platnya.
        </p>
      </div>

      <div>
        <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
          2. Pilih Plat dari Stok Yard yang Tersedia (Stock Lock) *
        </label>
        <select 
          v-model="form.plate_id" 
          required 
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option :value="null">-- Pilih Plat Yard --</option>
          <option 
            v-for="p in availablePlates" 
            :key="p.id" 
            :value="p.id"
          >
            {{ p.no_plat }} | Heat: {{ p.heat_number }} | {{ p.grade }} ({{ p.panjang_mm }}x{{ p.lebar_mm }}x{{ p.tebal_mm }}mm) - Lokasi: {{ p.lokasi_yard }}
          </option>
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Nama Pengambil / Operator CNC *</label>
          <input 
            v-model="form.pengambil" 
            type="text" 
            required 
            placeholder="nama operator pengambil plat..." 
            class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Petugas Yard / Rigger *</label>
          <input 
            v-model="form.petugas_yard" 
            type="text" 
            required 
            placeholder="petugas rigger yard..." 
            class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <!-- Checkbox Remnant -->
      <div class="p-4 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60 space-y-3">
        <label class="flex items-center gap-2.5 cursor-pointer font-bold text-orange-800 dark:text-orange-300">
          <input 
            v-model="form.is_partial" 
            type="checkbox" 
            class="rounded border-orange-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
          />
          <span>Plat diambil sebagian / ada sisa potongan (Otomatis Buat Remnant Baru)</span>
        </label>
        
        <div v-if="form.is_partial" class="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label class="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">Sisa Panjang (mm) *</label>
            <input 
              v-model.number="form.sisa_p" 
              type="number" 
              min="100" 
              required 
              placeholder="Sisa P (mm)" 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">Sisa Lebar (mm) *</label>
            <input 
              v-model.number="form.sisa_l" 
              type="number" 
              min="100" 
              required 
              placeholder="Sisa L (mm)" 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        :disabled="isSubmitting || readyOrders.length === 0 || availablePlates.length === 0"
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-extrabold p-3.5 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
      >
        <i class="fa-solid fa-truck-ramp-box"></i>
        <span>PROSES PENGAMBILAN & CATAT BON YARD RESMI</span>
      </button>
    </form>

    <!-- Log Bon Yard Terbaru -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <i class="fa-solid fa-receipt text-blue-500"></i>
          <span>Riwayat Bon Pengambilan Plat Yard Terbaru</span>
        </h2>
        <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">Total: {{ store.yardPickups.value.length }} bon</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-left">
            <tr>
              <th class="p-3">Order</th>
              <th class="p-3">Plat Diambil</th>
              <th class="p-3">Pengambil</th>
              <th class="p-3">Petugas Yard</th>
              <th class="p-3">Remnant Otomatis</th>
              <th class="p-3">Waktu</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr 
              v-for="yp in store.yardPickups.value" 
              :key="yp.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                {{ getOrderNo(yp.order_id) }}
              </td>
              <td class="p-3 font-mono text-slate-800 dark:text-slate-200">
                {{ getPlateNo(yp.plate_id) }}
              </td>
              <td class="p-3 font-semibold text-slate-900 dark:text-slate-100">
                {{ yp.pengambil }}
              </td>
              <td class="p-3 text-slate-600 dark:text-slate-400">
                {{ yp.petugas_yard }}
              </td>
              <td class="p-3 font-mono" :class="yp.remnant_plate_id ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-slate-400'">
                {{ yp.remnant_plate_id ? getPlateNo(yp.remnant_plate_id) : '-' }}
              </td>
              <td class="p-3 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                {{ yp.picked_up_at ? new Date(yp.picked_up_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-' }}
              </td>
            </tr>
            <tr v-if="store.yardPickups.value.length === 0">
              <td colspan="6" class="p-8 text-center text-slate-400 dark:text-slate-500 italic">
                Belum ada bon pengambilan plat dari yard.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useCncStore } from '~/composables/useCncStore'

const store = useCncStore()

const isSubmitting = ref(false)
const alertMsg = ref<{ text: string; type: 'success' | 'error' } | null>(null)

const form = reactive({
  order_id: null as number | null,
  plate_id: null as number | null,
  pengambil: '',
  petugas_yard: 'Rigger Yard A',
  is_partial: false,
  sisa_p: 1800,
  sisa_l: 1500
})

const readyOrders = computed(() => {
  return store.orders.value.filter(o => 
    o.status === 'Diterima' ||
    o.status === 'Diterima Operator' ||
    o.status === 'Plat Telah Diambil Yard' ||
    o.status === 'Sedang Dipotong' ||
    o.status === 'Estimasi Selesai'
  )
})

const availablePlates = computed(() => {
  return store.plates.value.filter(p => 
    p.status === 'Tersedia' || 
    p.status === 'Sisa Potongan / Remnant'
  )
})

function getOrderNo(orderId: number): string {
  const o = store.orders.value.find(item => item.id === orderId)
  return o ? o.no_order : `ORD-${orderId}`
}

function getPlateNo(plateId: number): string {
  const p = store.plates.value.find(item => item.id === plateId)
  return p ? p.no_plat : `PLT-${plateId}`
}

async function handlePickupSubmit() {
  if (!form.order_id || !form.plate_id) {
    alertMsg.value = { type: 'error', text: 'Mohon pilih Order dan Plat Yard terlebih dahulu.' }
    return
  }

  isSubmitting.value = true
  try {
    const res = await store.pickupPlateYard({
      order_id: form.order_id,
      plate_id: form.plate_id,
      pengambil: form.pengambil,
      petugas_yard: form.petugas_yard,
      is_partial: form.is_partial,
      sisa_p: form.sisa_p,
      sisa_l: form.sisa_l
    })

    const remInfo = res.remnant ? ` Plat Remnant otomatis dibuat: ${res.remnant.no_plat}.` : ''
    alertMsg.value = {
      type: 'success',
      text: `Pengambilan plat berhasil! Order ${res.order.no_order} kini berstatus 'Plat Telah Diambil Yard'.${remInfo}`
    }

    // Reset form
    form.order_id = null
    form.plate_id = null
    form.pengambil = ''
    form.is_partial = false
  } catch (err: any) {
    alertMsg.value = {
      type: 'error',
      text: err?.message || 'Gagal memproses pengambilan plat.'
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  store.initStore()
  if (store.currentUser.value) {
    form.pengambil = store.currentUser.value.name
  }
})
</script>

