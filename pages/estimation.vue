<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-calculator text-violet-500"></i>
          <span>Estimasi Kebutuhan Plat CNC</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Bagian 2: Penentuan grade material, lembar plat, estimasi berat kg, sisa remnant, dan jam potong mesin
        </p>
      </div>

      <NuxtLink 
        to="/orders" 
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
      >
        <i class="fa-solid fa-list-check text-blue-500"></i>
        <span>Lihat Semua Order</span>
      </NuxtLink>
    </div>

    <!-- Feedback Notification -->
    <div 
      v-if="feedbackMsg" 
      class="p-4 rounded-2xl flex items-center justify-between gap-3 transition"
      :class="feedbackMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'"
    >
      <div class="flex items-center gap-2.5 text-xs font-semibold">
        <i :class="feedbackMsg.type === 'success' ? 'fa-solid fa-circle-check text-emerald-500' : 'fa-solid fa-triangle-exclamation text-rose-500'"></i>
        <span>{{ feedbackMsg.text }}</span>
      </div>
      <button @click="feedbackMsg = null" class="text-xs opacity-70 hover:opacity-100">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Main Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
      <!-- Order Selector -->
      <div>
        <label class="block text-xs font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1.5">
          <i class="fa-solid fa-crosshairs mr-1"></i> Pilih Order yang Akan Dibuatkan / Diedit Estimasinya:
        </label>
        <select 
          v-model="selectedOrderId" 
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-violet-500 outline-none transition"
        >
          <option :value="null">-- Pilih Order --</option>
          <option 
            v-for="po in pendingOrders" 
            :key="po.id" 
            :value="po.id"
          >
            {{ po.no_order }} - {{ po.nama_proyek }} ({{ po.material }} {{ po.ketebalan }}) [{{ po.status }}]
          </option>
        </select>
      </div>

      <!-- Selected Order Preview & Form -->
      <template v-if="selectedOrder">
        <!-- Order Context Box -->
        <div class="p-4 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/60 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div>
            <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Pemesan</span>
            <b class="text-slate-900 dark:text-white">{{ selectedOrder.nama_pemesan }}</b>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">{{ selectedOrder.departemen_pemesan }}</div>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Material Order</span>
            <b class="text-slate-900 dark:text-white">{{ selectedOrder.material }} ({{ selectedOrder.ketebalan }})</b>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">Target: {{ selectedOrder.target_cnc }}</div>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Jumlah & Part</span>
            <b class="font-mono text-slate-900 dark:text-white">{{ selectedOrder.jumlah_pesanan }} {{ selectedOrder.satuan }}</b>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">{{ selectedOrder.ukuran_part }}</div>
          </div>
          <div>
            <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Status Saat Ini</span>
            <span class="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              {{ selectedOrder.status }}
            </span>
            <div v-if="selectedOrder.deadline_pekerjaan" class="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-semibold">
              Deadline: {{ selectedOrder.deadline_pekerjaan }}
            </div>
          </div>
        </div>

        <!-- Drawing preview if exists -->
        <div v-if="selectedOrder.drawing_data_url" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <i class="fa-solid fa-file-image text-blue-500 text-sm"></i>
            <span>Lampiran Gambar: <strong class="text-slate-800 dark:text-slate-200">{{ selectedOrder.drawing_file_name || 'drawing.png' }}</strong></span>
          </div>
          <a :href="selectedOrder.drawing_data_url" target="_blank" download="drawing.png" class="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            <i class="fa-solid fa-eye mr-1"></i> Buka / Download
          </a>
        </div>

        <!-- Estimation Form -->
        <form @submit.prevent="handleSubmitEstimation" class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Grade Plat yang Disarankan *</label>
              <select 
                v-model="form.grade" 
                required 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
              >
                <option value="AH36">AH36 (High Tensile Marine Steel)</option>
                <option value="DH36">DH36 (High Tensile Heavy Bulkhead)</option>
                <option value="EH36">EH36 (Extreme Strength Marine)</option>
                <option value="Grade A">Grade A (Standard Mild Steel Hull)</option>
                <option value="Grade B">Grade B (Mild Steel Deck Plate)</option>
                <option value="SS400">SS400 (General Outfitting Steel)</option>
                <option value="Aluminium 5083">Aluminium 5083-H116 (Marine)</option>
                <option value="Aluminium 6061">Aluminium 6061-T6 (Profil)</option>
                <option value="Stainless 316">Stainless Steel 316L</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Tebal Disarankan *</label>
              <input 
                v-model="form.tebal" 
                type="text" 
                required 
                placeholder="contoh: 12mm..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Ukuran Plat Standar *</label>
              <div class="flex gap-2">
                <select 
                  v-model="form.ukuran_plat" 
                  required 
                  class="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
                >
                  <option value="6000 x 1500 mm">6000 x 1500 mm (5 x 20 ft)</option>
                  <option value="6000 x 2000 mm">6000 x 2000 mm (Standard Galangan)</option>
                  <option value="9000 x 2000 mm">9000 x 2000 mm (Long Sheet)</option>
                  <option value="12000 x 2500 mm">12000 x 2500 mm (Mega Plate)</option>
                  <option value="Custom">Custom Ukuran Lain...</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Jumlah Lembar Plat Dibutuhkan *</label>
              <input 
                v-model.number="form.lembar" 
                type="number" 
                min="1" 
                required 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-slate-700 dark:text-slate-300 font-bold">Estimasi Berat Total (kg) *</label>
                <button 
                  type="button" 
                  @click="autoCalcWeight" 
                  class="text-[11px] text-violet-600 dark:text-violet-400 hover:underline font-semibold"
                >
                  <i class="fa-solid fa-wand-magic-sparkles mr-0.5"></i> Hitung Otomatis
                </button>
              </div>
              <input 
                v-model.number="form.berat_kg" 
                type="number" 
                step="0.01" 
                required 
                placeholder="berat total kg..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-amber-600 dark:text-amber-400 font-mono font-bold focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Estimasi Waktu Potong CNC (Jam) *</label>
              <input 
                v-model.number="form.jam" 
                type="number" 
                step="0.1" 
                required 
                placeholder="jam potong mesin..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Estimasi Sisa Remnant (Ukuran)</label>
              <input 
                v-model="form.remnant" 
                type="text" 
                placeholder="contoh: 1800 x 1500 mm..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Estimasi Tanggal Selesai *</label>
              <input 
                v-model="form.tgl_selesai" 
                type="date" 
                required 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Catatan Estimasi</label>
              <input 
                v-model="form.catatan" 
                type="text" 
                placeholder="catatan nesting, efisiensi sisa remnant..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
          </div>

          <div class="pt-2 flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              class="flex-1 bg-violet-600 hover:bg-violet-700 active:scale-[0.99] text-white font-extrabold p-3.5 rounded-xl shadow-md shadow-violet-600/25 transition flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-paper-plane"></i>
              <span>SIMPAN ESTIMASI & AJUKAN KE PEMESAN UNTUK PERSETUJUAN</span>
            </button>
            <button 
              v-if="selectedOrder.status === 'Menunggu Persetujuan Pemesan' || selectedOrder.estimation"
              type="button"
              @click="handleDirectApprove(selectedOrder.id)"
              class="px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0"
              title="Setujui langsung (Mandor / Admin override)"
            >
              <i class="fa-solid fa-circle-check"></i>
              <span>Setujui Langsung</span>
            </button>
          </div>
        </form>
      </template>

      <!-- Empty State -->
      <div v-else class="py-12 text-center text-slate-400 dark:text-slate-500 text-xs italic space-y-2">
        <i class="fa-solid fa-calculator text-4xl mb-2 block text-slate-300 dark:text-slate-700"></i>
        <p>Pilih salah satu order di atas untuk mengisi atau memperbarui data estimasi plat.</p>
        <p class="text-[11px] text-slate-400 dark:text-slate-600">Jika tidak ada order pending, Anda dapat membuat order baru di menu Order.</p>
      </div>
    </div>

    <!-- Active Estimations Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <i class="fa-solid fa-table-list text-violet-500"></i>
          <span>Daftar Estimasi Order Aktif</span>
        </h2>
        <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">{{ estimatedOrdersList.length }} order terestimasi</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-extrabold text-left">
            <tr>
              <th class="p-3.5">No. Order</th>
              <th class="p-3.5">Proyek & Pemesan</th>
              <th class="p-3.5">Grade & Tebal</th>
              <th class="p-3.5">Ukuran & Lembar</th>
              <th class="p-3.5">Berat (kg)</th>
              <th class="p-3.5">Jam Potong</th>
              <th class="p-3.5">Status Approval</th>
              <th class="p-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr 
              v-for="o in estimatedOrdersList" 
              :key="o.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="p-3.5 font-mono font-bold text-violet-600 dark:text-violet-400 whitespace-nowrap">
                {{ o.no_order }}
              </td>
              <td class="p-3.5">
                <div class="font-bold text-slate-900 dark:text-slate-100">{{ o.nama_proyek }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ o.nama_pemesan }} ({{ o.departemen_pemesan }})</div>
              </td>
              <td class="p-3.5">
                <span class="font-bold text-slate-900 dark:text-slate-100">{{ o.estimation?.grade || '-' }}</span>
                <span class="text-slate-500 dark:text-slate-400 ml-1">({{ o.estimation?.tebal || o.ketebalan }})</span>
              </td>
              <td class="p-3.5 font-mono">
                <div>{{ o.estimation?.ukuran_plat || '-' }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-sans">{{ o.estimation?.lembar }} lembar</div>
              </td>
              <td class="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                {{ o.estimation?.berat_kg ? Number(o.estimation.berat_kg).toLocaleString('id-ID') + ' kg' : '-' }}
              </td>
              <td class="p-3.5 font-mono">
                {{ o.estimation?.jam ? o.estimation.jam + ' jam' : '-' }}
              </td>
              <td class="p-3.5">
                <span 
                  class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border"
                  :class="o.estimation?.status_approval === 'Disetujui' || o.status === 'Estimasi Selesai' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'"
                >
                  {{ o.estimation?.status_approval || o.status }}
                </span>
              </td>
              <td class="p-3.5 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button 
                    @click="selectedOrderId = o.id" 
                    class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-[11px]"
                    title="Edit Estimasi"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    v-if="o.status === 'Menunggu Persetujuan Pemesan' || o.estimation?.status_approval !== 'Disetujui'"
                    @click="handleDirectApprove(o.id)" 
                    class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                    title="Setujui Sekarang"
                  >
                    <i class="fa-solid fa-check"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="estimatedOrdersList.length === 0">
              <td colspan="8" class="p-8 text-center text-slate-400 dark:text-slate-500 italic">
                Belum ada data estimasi yang tercatat.
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
import { useRoute } from 'vue-router'
import { useCncStore } from '~/composables/useCncStore'

const route = useRoute()
const store = useCncStore()

const selectedOrderId = ref<number | null>(null)
const feedbackMsg = ref<{ text: string; type: 'success' | 'error' } | null>(null)

// Form state
const form = reactive({
  grade: 'AH36',
  tebal: '',
  ukuran_plat: '6000 x 1500 mm',
  lembar: 1,
  berat_kg: 0,
  jam: 2.0,
  remnant: '',
  tgl_selesai: '',
  catatan: ''
})

// Orders that can be estimated (or re-estimated)
const pendingOrders = computed(() => {
  return store.orders.value.filter(o => 
    o.status === 'Menunggu Estimasi' || 
    o.status === 'Menunggu Persetujuan Pemesan' || 
    o.status === 'Estimasi Selesai' ||
    Boolean(o.estimation)
  )
})

const selectedOrder = computed(() => {
  if (!selectedOrderId.value) return null
  return store.orders.value.find(o => o.id === selectedOrderId.value) || null
})

// Orders with existing estimations
const estimatedOrdersList = computed(() => {
  return store.orders.value.filter(o => Boolean(o.estimation))
})

// Populate form when selectedOrder changes
watch(selectedOrder, (order) => {
  if (!order) return
  const est = order.estimation

  form.grade = est?.grade || (order.material === 'Aluminium' ? 'Aluminium 5083' : (order.material === 'Stainless' ? 'Stainless 316' : 'AH36'))
  form.tebal = est?.tebal || order.ketebalan || '12mm'
  form.ukuran_plat = est?.ukuran_plat || '6000 x 1500 mm'
  form.lembar = est?.lembar || 1
  form.berat_kg = est?.berat_kg || 0
  form.jam = est?.jam || 2.5
  form.remnant = est?.remnant || ''
  form.tgl_selesai = est?.tgl_selesai || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  form.catatan = est?.catatan || ''

  if (!est?.berat_kg) {
    autoCalcWeight()
  }
}, { immediate: true })

// Helper calculate theoretical weight
function autoCalcWeight() {
  const tMatch = form.tebal.match(/\d+(\.\d+)?/)
  const tebal = tMatch ? parseFloat(tMatch[0]) : 12

  let p = 6000
  let l = 1500
  if (form.ukuran_plat.includes('x')) {
    const parts = form.ukuran_plat.split('x').map(s => parseFloat(s.replace(/[^0-9.]/g, '')))
    if (parts[0] && parts[1]) {
      p = parts[0]
      l = parts[1]
    }
  }

  const mat = (selectedOrder.value?.material || 'Baja').toLowerCase()
  const density = mat.includes('alumin') ? 0.0000027 : (mat.includes('stainless') ? 0.0000080 : 0.00000785)
  const weightPerSheet = p * l * tebal * density
  form.berat_kg = parseFloat((weightPerSheet * (form.lembar || 1)).toFixed(2))
}

// Handle Submit Estimation
async function handleSubmitEstimation() {
  if (!selectedOrder.value) return

  await store.saveEstimation({
    order_id: selectedOrder.value.id,
    grade: form.grade,
    tebal: form.tebal,
    ukuran_plat: form.ukuran_plat,
    lembar: form.lembar,
    berat_kg: form.berat_kg,
    jam: form.jam,
    remnant: form.remnant,
    tgl_selesai: form.tgl_selesai,
    catatan: form.catatan
  })

  feedbackMsg.value = {
    type: 'success',
    text: `Estimasi untuk order ${selectedOrder.value.no_order} berhasil disimpan dan diajukan ke Pemesan!`
  }
}

// Handle Direct Approve
async function handleDirectApprove(orderId: number) {
  await store.approveEstimation(orderId)
  feedbackMsg.value = {
    type: 'success',
    text: `Estimasi order #${orderId} berhasil DISETUJUI! Order kini siap untuk pengambilan plat di Yard.`
  }
}

onMounted(() => {
  store.initStore()

  // Auto select from query param ?order_id=...
  if (route.query.order_id) {
    const oid = Number(route.query.order_id)
    if (oid) {
      selectedOrderId.value = oid
    }
  } else if (pendingOrders.value.length > 0 && !selectedOrderId.value) {
    selectedOrderId.value = pendingOrders.value[0].id
  }
})
</script>

