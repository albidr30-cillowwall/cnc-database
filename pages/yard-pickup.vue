<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-truck-ramp-box text-blue-500"></i>
          <span>Ambil Plat dari Stok</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Pengambilan & pemotongan jumlah stok plat tanpa terikat dengan order baru
        </p>
      </div>

      <NuxtLink 
        to="/plates" 
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
      >
        <i class="fa-solid fa-layer-group text-amber-500"></i>
        <span>Cek Stok Plat</span>
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

    <!-- Form Pengambilan Plat -->
    <form @submit.prevent="handlePickupSubmit" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
      <div>
        <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <i class="fa-solid fa-layer-group text-blue-500"></i>
            <span>Pilih Plat dari Stok Plat (Tersedia) *</span>
          </span>
          <span v-if="selectedPlate" class="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
            Sisa Stok: {{ selectedPlateStock }} lembar
          </span>
        </label>
        <select 
          v-model="form.plate_id" 
          required 
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option :value="null">-- Pilih Plat dari Stok --</option>
          <option 
            v-for="p in availablePlates" 
            :key="p.id" 
            :value="p.id"
          >
            {{ p.no_plat }} | {{ p.grade }} ({{ p.material_type }}) | {{ p.panjang_mm }}x{{ p.lebar_mm }}x{{ p.tebal_mm }}mm | Stok: {{ p.stok !== undefined ? p.stok : 1 }} lbr - Lokasi: {{ p.lokasi_yard }}
          </option>
        </select>
        <p v-if="availablePlates.length === 0" class="text-[11px] text-amber-600 dark:text-amber-400 mt-1 italic">
          <i class="fa-solid fa-triangle-exclamation mr-1"></i> Tidak ada stok plat yang tersedia untuk diambil.
        </p>
      </div>

      <!-- Preview Detail Plat Terpilih -->
      <div v-if="selectedPlate" class="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-bold">Material & Spec</span>
          <b class="text-slate-900 dark:text-white">{{ selectedPlate.grade }} ({{ selectedPlate.material_type }})</b>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-bold">Ukuran (P x L x T)</span>
          <b class="font-mono text-slate-900 dark:text-white">{{ selectedPlate.panjang_mm }} x {{ selectedPlate.lebar_mm }} x {{ selectedPlate.tebal_mm }}mm</b>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-bold">Sisa Stok Tersedia</span>
          <b class="font-mono text-emerald-600 dark:text-emerald-400 text-sm">{{ selectedPlateStock }} Lembar</b>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-bold">Berat per Lembar</span>
          <b class="font-mono text-slate-900 dark:text-white">{{ Number(selectedPlate.berat_kg).toLocaleString('id-ID', { minimumFractionDigits: 1 }) }} kg</b>
        </div>
      </div>

      <!-- Jumlah Ambil & Keperluan -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
            <span>Jumlah Lembar yang Diambil *</span>
            <span v-if="selectedPlate" class="text-slate-400 text-[10px]">Maks: {{ selectedPlateStock }} lbr</span>
          </label>
          <input 
            v-model.number="form.jumlah_ambil" 
            type="number" 
            min="1" 
            :max="selectedPlateStock || 1" 
            required 
            placeholder="1" 
            class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Keperluan / Keterangan (Opsional)</label>
          <input 
            v-model="form.keperluan" 
            type="text" 
            placeholder="contoh: Pemotongan Part, Bracket, Repair, Kebutuhan Yard..." 
            class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <!-- Nama Pengambil & Petugas Yard -->
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
        :disabled="isSubmitting || availablePlates.length === 0"
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-extrabold p-3.5 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
      >
        <i class="fa-solid fa-truck-ramp-box"></i>
        <span>PROSES PENGAMBILAN & POTONG STOK PLAT</span>
      </button>
    </form>

    <!-- Log Bon Yard Terbaru -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <i class="fa-solid fa-receipt text-blue-500"></i>
          <span>Riwayat Bon Pengambilan Plat Terbaru</span>
        </h2>
        <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">Total: {{ store.yardPickups.value.length }} bon</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-left">
            <tr>
              <th class="p-3">Waktu</th>
              <th class="p-3">Plat Diambil</th>
              <th class="p-3 text-center">Jumlah Diambil</th>
              <th class="p-3 text-center">Sisa Stok</th>
              <th class="p-3">Pengambil</th>
              <th class="p-3">Petugas Yard</th>
              <th class="p-3">Keperluan</th>
              <th class="p-3">Remnant</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr 
              v-for="yp in store.yardPickups.value" 
              :key="yp.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="p-3 font-mono text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                {{ yp.picked_up_at ? new Date(yp.picked_up_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-' }}
              </td>
              <td class="p-3">
                <div class="font-mono font-bold text-slate-900 dark:text-slate-100">{{ getPlateNo(yp.plate_id) }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ getPlateDesc(yp.plate_id) }}</div>
              </td>
              <td class="p-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                {{ yp.jumlah_ambil || 1 }} lbr
              </td>
              <td class="p-3 text-center font-mono font-semibold" :class="(yp.sisa_stok || 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'">
                {{ yp.sisa_stok !== undefined ? `${yp.sisa_stok} lbr` : '-' }}
              </td>
              <td class="p-3 font-semibold text-slate-900 dark:text-slate-100">
                {{ yp.pengambil }}
              </td>
              <td class="p-3 text-slate-600 dark:text-slate-400">
                {{ yp.petugas_yard }}
              </td>
              <td class="p-3 text-slate-600 dark:text-slate-400">
                {{ yp.keperluan || '-' }}
              </td>
              <td class="p-3 font-mono" :class="yp.remnant_plate_id ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-slate-400'">
                {{ yp.remnant_plate_id ? getPlateNo(yp.remnant_plate_id) : '-' }}
              </td>
            </tr>
            <tr v-if="store.yardPickups.value.length === 0">
              <td colspan="8" class="p-8 text-center text-slate-400 dark:text-slate-500 italic">
                Belum ada bon pengambilan plat dari stok.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useCncStore } from '~/composables/useCncStore'

const store = useCncStore()

const isSubmitting = ref(false)
const alertMsg = ref<{ text: string; type: 'success' | 'error' } | null>(null)

const form = reactive({
  plate_id: null as number | null,
  jumlah_ambil: 1,
  pengambil: '',
  petugas_yard: 'Rigger Yard A',
  keperluan: '',
  is_partial: false,
  sisa_p: 1800,
  sisa_l: 1500
})

const availablePlates = computed(() => {
  return store.plates.value.filter(p => {
    const stok = p.stok !== undefined ? p.stok : (p.status === 'Diambil' || p.status === 'Habis' ? 0 : 1)
    return stok > 0 && p.status !== 'Habis' && p.status !== 'Sudah Dipotong'
  })
})

const selectedPlate = computed(() => {
  if (!form.plate_id) return null
  return store.plates.value.find(p => p.id === form.plate_id) || null
})

const selectedPlateStock = computed(() => {
  if (!selectedPlate.value) return 1
  return selectedPlate.value.stok !== undefined ? selectedPlate.value.stok : (selectedPlate.value.status === 'Diambil' || selectedPlate.value.status === 'Habis' ? 0 : 1)
})

watch(() => form.plate_id, () => {
  form.jumlah_ambil = 1
})

function getPlateNo(plateId: number): string {
  const p = store.plates.value.find(item => item.id === plateId)
  return p ? p.no_plat : `PLT-${plateId}`
}

function getPlateDesc(plateId: number): string {
  const p = store.plates.value.find(item => item.id === plateId)
  if (!p) return '-'
  return `${p.grade} (${p.material_type}) - ${p.panjang_mm}x${p.lebar_mm}x${p.tebal_mm}mm`
}

async function handlePickupSubmit() {
  if (!form.plate_id) {
    alertMsg.value = { type: 'error', text: 'Mohon pilih Plat dari Stok terlebih dahulu.' }
    return
  }
  if (form.jumlah_ambil > selectedPlateStock.value) {
    alertMsg.value = { type: 'error', text: `Jumlah yang diambil (${form.jumlah_ambil} lbr) melebihi stok yang tersedia (${selectedPlateStock.value} lbr).` }
    return
  }

  isSubmitting.value = true
  try {
    const res = await store.pickupPlateYard({
      plate_id: form.plate_id,
      jumlah_ambil: form.jumlah_ambil,
      pengambil: form.pengambil,
      petugas_yard: form.petugas_yard,
      keperluan: form.keperluan,
      is_partial: form.is_partial,
      sisa_p: form.sisa_p,
      sisa_l: form.sisa_l
    })

    const remInfo = res.remnant ? ` Plat Remnant otomatis dibuat: ${res.remnant.no_plat}.` : ''
    alertMsg.value = {
      type: 'success',
      text: `Pengambilan plat ${res.plate.no_plat} sebanyak ${res.jumlah_ambil} lembar berhasil! Sisa stok saat ini: ${res.sisa_stok} lembar.${remInfo}`
    }

    // Reset form
    form.plate_id = null
    form.jumlah_ambil = 1
    form.keperluan = ''
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

