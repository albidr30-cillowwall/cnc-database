<template>
  <div class="space-y-5">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-layer-group text-amber-500"></i>
          <span>Stok Plat CNC</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        </p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink 
          to="/plates/remnants" 
          class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-xs font-bold text-orange-700 dark:text-orange-300 hover:bg-orange-100 transition shadow-xs"
        >
          <i class="fa-solid fa-puzzle-piece"></i>
          <span>Lihat Plat Remnant ({{ remnantCount }})</span>
        </NuxtLink>
        <button 
          @click="isModalOpen = true" 
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition"
        >
          <i class="fa-solid fa-plus"></i>
          <span>Tambah Plat Baru</span>
        </button>
      </div>
    </div>

    <!-- Alert / Feedback -->
    <div 
      v-if="feedbackMsg" 
      class="p-4 rounded-2xl flex items-center justify-between gap-3 transition bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold"
    >
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-circle-check text-emerald-500"></i>
        <span>{{ feedbackMsg }}</span>
      </div>
      <button @click="feedbackMsg = null" class="opacity-70 hover:opacity-100">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div class="flex flex-wrap items-center gap-2.5">
        <span class="text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-1.5">
          <i class="fa-solid fa-ruler-combined"></i>
          <span>Filter Min Dimensi:</span>
        </span>
        <div class="flex items-center gap-1.5">
          <input 
            v-model.number="filterMinP" 
            type="number" 
            placeholder="Min P (mm)" 
            class="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <span class="text-slate-400 dark:text-slate-500">x</span>
          <input 
            v-model.number="filterMinL" 
            type="number" 
            placeholder="Min L (mm)" 
            class="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button 
          v-if="filterMinP || filterMinL" 
          @click="resetDimensionFilter" 
          class="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
        >
          Reset Dimensi
        </button>
      </div>

      <div class="flex items-center gap-2.5">
        <select 
          v-model="filterStatus" 
          class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Semua Status ({{ store.plates.value.length }})</option>
          <option value="Tersedia">Tersedia</option>
          <option value="Dipesan">Dipesan</option>
          <option value="Diambil">Diambil</option>
          <option value="Sudah Dipotong">Sudah Dipotong</option>
          <option value="Sisa Potongan / Remnant">Sisa Potongan / Remnant</option>
        </select>
        <span class="text-[11px] font-mono text-slate-400">
          Tampil: <b>{{ filteredPlates.length }}</b> plat
        </span>
      </div>
    </div>

    <!-- Table of Plates -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-extrabold text-left">
            <tr>
              <th class="p-3.5">No. Plat</th>
              <th class="p-3.5">Heat Number</th>
              <th class="p-3.5">Spesifikasi & Material</th>
              <th class="p-3.5">Dimensi (P x L x T)</th>
              <th class="p-3.5">Berat (kg)</th>
              <th class="p-3.5">Sertifikat Class</th>
              <th class="p-3.5">Lokasi Yard</th>
              <th class="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr 
              v-for="p in filteredPlates" 
              :key="p.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="p-3.5 font-mono font-bold whitespace-nowrap" :class="p.is_remnant ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'">
                {{ p.no_plat }}
                <span v-if="p.is_remnant" class="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-sans font-bold">
                  REMNANT
                </span>
              </td>
              <td class="p-3.5 font-mono text-slate-800 dark:text-slate-200">
                {{ p.heat_number }}
              </td>
              <td class="p-3.5">
                <div class="font-bold text-slate-900 dark:text-slate-100">{{ p.grade }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ p.material_type }}</div>
              </td>
              <td class="p-3.5 font-mono">
                {{ p.panjang_mm }} x {{ p.lebar_mm }} x <b class="text-slate-900 dark:text-white">{{ p.tebal_mm }}mm</b>
              </td>
              <td class="p-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                {{ Number(p.berat_kg).toLocaleString('id-ID', { minimumFractionDigits: 1 }) }} kg
              </td>
              <td class="p-3.5 text-cyan-600 dark:text-cyan-400 font-semibold">
                {{ p.no_sertifikat_class || '-' }}
              </td>
              <td class="p-3.5 text-slate-700 dark:text-slate-300">
                <i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>
                <span>{{ p.lokasi_yard }}</span>
              </td>
              <td class="p-3.5">
                <span 
                  class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border"
                  :class="getStatusBadgeClass(p.status)"
                >
                  {{ p.status }}
                </span>
                <div v-if="p.order_id_pemakai" class="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                  Order: {{ p.order_id_pemakai }}
                </div>
              </td>
            </tr>
            <tr v-if="filteredPlates.length === 0">
              <td colspan="8" class="p-10 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                <i class="fa-solid fa-layer-group text-3xl mb-2 block text-slate-300 dark:text-slate-700"></i>
                Tidak ada data plat yang sesuai dengan filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Tambah Plat Baru -->
    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-extrabold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <i class="fa-solid fa-square-plus"></i>
            <span>Pendaftaran Stok Plat Baru</span>
          </h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl leading-none">
            &times;
          </button>
        </div>

        <form @submit.prevent="handleSubmitPlate" class="space-y-3.5 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- 1. Jenis Material -->
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Jenis Material *</label>
              <input 
                v-model="newPlateForm.material_type" 
                type="text" 
                required 
                placeholder="contoh: Baja, Aluminium, Stainless..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- 2. Spesifikasi Material -->
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Spesifikasi Material *</label>
              <input 
                v-model="newPlateForm.grade" 
                type="text" 
                required 
                placeholder="contoh: AH36, DH36, Grade A, SS400..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- 3. Panjang (mm) -->
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Panjang (mm) *</label>
              <input 
                v-model.number="newPlateForm.panjang_mm" 
                type="number" 
                min="100" 
                required 
                placeholder="contoh: 6000" 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- 4. Lebar (mm) -->
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Lebar (mm) *</label>
              <input 
                v-model.number="newPlateForm.lebar_mm" 
                type="number" 
                min="100" 
                required 
                placeholder="contoh: 1500" 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- 5. Tebal (mm) -->
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Tebal (mm) *</label>
              <input 
                v-model.number="newPlateForm.tebal_mm" 
                type="number" 
                step="0.1" 
                min="0.5" 
                required 
                placeholder="contoh: 12" 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- 6. Jumlah -->
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center justify-between">
                <span>Jumlah (Lembar) *</span>
                <span class="text-[10px] text-blue-500 font-normal">Pcs / Lembar</span>
              </label>
              <input 
                v-model.number="newPlateForm.jumlah" 
                type="number" 
                min="1" 
                required 
                placeholder="contoh: 1" 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <!-- Opsi Data Tambahan (Opsional) -->
          <details class="text-xs group border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-slate-50/50 dark:bg-slate-950/30">
            <summary class="cursor-pointer font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-sliders text-blue-500"></i>
                <span>Data Tambahan (Heat No., Lokasi, Sertifikat - Opsional)</span>
              </span>
              <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 group-open:rotate-180 transition-transform"></i>
            </summary>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Heat Number</label>
                <input 
                  v-model="newPlateForm.heat_number" 
                  type="text" 
                  placeholder="nomor heat plat..." 
                  class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Lokasi Yard</label>
                <input 
                  v-model="newPlateForm.lokasi_yard" 
                  type="text" 
                  placeholder="contoh: Yard A - Bay 1" 
                  class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label class="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Sertifikat Class</label>
                <input 
                  v-model="newPlateForm.no_sertifikat_class" 
                  type="text" 
                  placeholder="BKI-2026-XXXX..." 
                  class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </details>

          <!-- Perkiraan Berat -->
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <div>
              Perkiraan berat per lembar: <b class="text-amber-600 dark:text-amber-400 font-mono">{{ estimatedNewWeight }} kg</b>
            </div>
            <div v-if="newPlateForm.jumlah > 1">
              Total berat ({{ newPlateForm.jumlah }} lembar): <b class="text-blue-600 dark:text-blue-400 font-mono">{{ (Number(estimatedNewWeight) * newPlateForm.jumlah).toLocaleString('id-ID', { minimumFractionDigits: 1 }) }} kg</b>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              @click="isModalOpen = false" 
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
            >
              Batal
            </button>
            <button 
              type="submit" 
              class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20"
            >
              Simpan Stok Plat
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useCncStore } from '~/composables/useCncStore'

const store = useCncStore()

const isModalOpen = ref(false)
const filterMinP = ref<number | null>(null)
const filterMinL = ref<number | null>(null)
const filterStatus = ref('')
const feedbackMsg = ref<string | null>(null)

const newPlateForm = reactive({
  material_type: '',
  grade: '',
  panjang_mm: 6000,
  lebar_mm: 1500,
  tebal_mm: 12,
  jumlah: 1,
  heat_number: '',
  no_sertifikat_class: '',
  lokasi_yard: 'Yard A - Bay 1'
})

const remnantCount = computed(() => {
  return store.plates.value.filter(p => p.is_remnant).length
})

const estimatedNewWeight = computed(() => {
  const p = newPlateForm.panjang_mm || 0
  const l = newPlateForm.lebar_mm || 0
  const t = newPlateForm.tebal_mm || 0
  const mat = (newPlateForm.material_type || '').toLowerCase()
  const density = mat.includes('alumin') ? 0.0000027 : (mat.includes('stainless') ? 0.0000080 : 0.00000785)
  return (p * l * t * density).toFixed(2)
})

const filteredPlates = computed(() => {
  return store.plates.value.filter(p => {
    if (filterStatus.value && p.status !== filterStatus.value) return false
    if (filterMinP.value && p.panjang_mm < filterMinP.value) return false
    if (filterMinL.value && p.lebar_mm < filterMinL.value) return false
    return true
  })
})

function resetDimensionFilter() {
  filterMinP.value = null
  filterMinL.value = null
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'Tersedia':
      return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    case 'Sisa Potongan / Remnant':
      return 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    case 'Diambil':
      return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    case 'Sudah Dipotong':
      return 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800'
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  }
}

async function handleSubmitPlate() {
  const created = await store.addPlate({
    material_type: newPlateForm.material_type,
    grade: newPlateForm.grade,
    heat_number: newPlateForm.heat_number,
    no_sertifikat_class: newPlateForm.no_sertifikat_class,
    panjang_mm: newPlateForm.panjang_mm,
    lebar_mm: newPlateForm.lebar_mm,
    tebal_mm: newPlateForm.tebal_mm,
    lokasi_yard: newPlateForm.lokasi_yard,
    jumlah: newPlateForm.jumlah
  })

  const count = Array.isArray(created) ? created.length : 1
  if (count > 1) {
    feedbackMsg.value = `${count} lembar plat baru (${newPlateForm.material_type} - ${newPlateForm.grade}) berhasil didaftarkan ke Stok Plat!`
  } else {
    const p = Array.isArray(created) ? created[0] : created
    feedbackMsg.value = `Plat baru ${p.no_plat} (${p.material_type} - ${p.grade}) berhasil didaftarkan ke Stok Plat!`
  }
  isModalOpen.value = false

  // Reset form
  newPlateForm.heat_number = ''
  newPlateForm.jumlah = 1
}

onMounted(() => {
  store.initStore()
})
</script>

