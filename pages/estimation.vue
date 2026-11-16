<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-id-card-clip text-violet-500"></i>
          <span>Material Identification</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Penentuan Project Name, Nesting No., Block/Item, Spec & Dimension of Material, Product & Heat Number
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
        <label class="block text-xs font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span><i class="fa-solid fa-crosshairs mr-1"></i> Pilih Order untuk Material Identification:</span>
          <span class="text-[11px] font-mono text-violet-500 font-bold lowercase">{{ pendingOrders.length }} order aktif</span>
        </label>
        <select 
          v-model="selectedOrderId" 
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-violet-500 outline-none transition"
        >
          <option :value="null">-- Pilih Order untuk Material Identification --</option>
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

        <!-- Estimation & Nesting Form (7 Standard Cutting Plan Fields) -->
        <form @submit.prevent="handleSubmitEstimation" class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- 1. Project Name -->
            <div class="sm:col-span-2">
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <i class="fa-solid fa-ship text-blue-500"></i>
                  <span>Project Name</span>
                </span>
                <span class="text-[10px] text-slate-400 font-normal">Opsional</span>
              </label>
              <input 
                v-model="form.project_name" 
                type="text" 
                placeholder="contoh: KM. Sabuk Nusantara, Tugboat 24M, Barge 300 Feet..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <!-- 2. Nesting No. -->
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <i class="fa-solid fa-layer-group text-violet-500"></i>
                  <span>Nesting No.</span>
                </span>
                <span class="text-[10px] text-slate-400 font-normal">Opsional</span>
              </label>
              <input 
                v-model="form.nesting_no" 
                type="text" 
                placeholder="contoh: NST-001, N-102-A, NST-HULL-01..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono font-bold focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <!-- 3. Block/Item -->
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <i class="fa-solid fa-cubes text-amber-500"></i>
                  <span>Block / Item</span>
                </span>
                <span class="text-[10px] text-slate-400 font-normal">Opsional</span>
              </label>
              <input 
                v-model="form.block_item" 
                type="text" 
                placeholder="contoh: Block 101, B-02, Web Frame 45..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <!-- 4. Spec of Material -->
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <i class="fa-solid fa-certificate text-cyan-500"></i>
                  <span>Spec of Material</span>
                </span>
                <span class="text-[10px] text-slate-400 font-normal">Opsional</span>
              </label>
              <input 
                v-model="form.spec_material" 
                type="text" 
                list="spec-material-suggestions"
                placeholder="contoh: AH36, DH36, EH36, Grade A, SS400, Al 5083..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-bold focus:ring-2 focus:ring-violet-500 outline-none"
              />
              <datalist id="spec-material-suggestions">
                <option value="AH36 (High Tensile Marine Steel)" />
                <option value="DH36 (High Tensile Heavy Bulkhead)" />
                <option value="EH36 (Extreme Strength Marine)" />
                <option value="Grade A (Standard Mild Steel Hull)" />
                <option value="Grade B (Mild Steel Deck Plate)" />
                <option value="SS400 (General Outfitting Steel)" />
                <option value="Aluminium 5083-H116 (Marine Grade)" />
                <option value="Aluminium 6061-T6" />
                <option value="Stainless Steel 316L" />
                <option value="Stainless Steel 304" />
              </datalist>
            </div>

            <!-- 5. Dimension of Material -->
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <i class="fa-solid fa-ruler-combined text-emerald-500"></i>
                  <span>Dimension of Material</span>
                </span>
                <span class="text-[10px] text-slate-400 font-normal">Opsional</span>
              </label>
              <input 
                v-model="form.dimension_material" 
                type="text" 
                placeholder="contoh: 12 x 1500 x 6000 mm, 8 x 2000 x 9000 mm..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono font-bold focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <!-- 6. Product Number -->
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <i class="fa-solid fa-barcode text-indigo-500"></i>
                  <span>Product Number</span>
                </span>
                <span class="text-[10px] text-slate-400 font-normal">Opsional</span>
              </label>
              <input 
                v-model="form.product_number" 
                type="text" 
                placeholder="contoh: PRD-001, P-304, PART-A..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono font-bold focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <!-- 7. Heat Number -->
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <i class="fa-solid fa-fire text-rose-500"></i>
                  <span>Heat Number</span>
                </span>
                <span class="text-[10px] text-slate-400 font-normal">Opsional</span>
              </label>
              <input 
                v-model="form.heat_number" 
                type="text" 
                placeholder="contoh: HT-98234, HN-2024-X, Heat 56421..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono font-bold focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
          </div>

          <div class="pt-2 flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              class="flex-1 bg-violet-600 hover:bg-violet-700 active:scale-[0.99] text-white font-extrabold p-3.5 rounded-xl shadow-md shadow-violet-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <i class="fa-solid fa-floppy-disk"></i>
              <span>SIMPAN MATERIAL IDENTIFICATION</span>
            </button>
            <button 
              v-if="selectedOrder.status === 'Menunggu Persetujuan Pemesan' || selectedOrder.estimation"
              type="button"
              @click="handleDirectApprove(selectedOrder.id)"
              class="px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer"
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
        <i class="fa-solid fa-clipboard-check text-4xl mb-2 block text-slate-300 dark:text-slate-700"></i>
        <p v-if="pendingOrders.length === 0" class="text-slate-600 dark:text-slate-300 font-semibold not-italic">
          Semua material identification order sudah selesai.
        </p>
        <p v-else>Pilih salah satu order di atas untuk mengisi data identifikasi material & nesting plat.</p>
        <p class="text-[11px] text-slate-400 dark:text-slate-600">Order baru yang dibuat akan langsung masuk ke Daftar Order dan dapat diidentifikasi di sini kapan saja.</p>
      </div>
    </div>

    <!-- Active Estimations Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <i class="fa-solid fa-table-list text-violet-500"></i>
          <span>Daftar Material Identification Order</span>
        </h2>
        <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">{{ estimatedOrdersList.length }} order teridentifikasi</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-extrabold text-left">
            <tr>
              <th class="p-3.5">No. Order</th>
              <th class="p-3.5">Project Name</th>
              <th class="p-3.5">Nesting No.</th>
              <th class="p-3.5">Block/Item</th>
              <th class="p-3.5">Spec of Material</th>
              <th class="p-3.5">Dimension of Material</th>
              <th class="p-3.5">Product No.</th>
              <th class="p-3.5">Heat No.</th>
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
                <div class="font-bold text-slate-900 dark:text-slate-100">{{ o.estimation?.project_name || o.nama_proyek }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ o.nama_pemesan }}</div>
              </td>
              <td class="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                {{ o.estimation?.nesting_no || '-' }}
              </td>
              <td class="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                {{ o.estimation?.block_item || '-' }}
              </td>
              <td class="p-3.5">
                <span class="font-bold text-cyan-600 dark:text-cyan-400">{{ o.estimation?.spec_material || o.estimation?.grade || o.material }}</span>
              </td>
              <td class="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                {{ o.estimation?.dimension_material || o.estimation?.ukuran_plat || o.ketebalan || '-' }}
              </td>
              <td class="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                {{ o.estimation?.product_number || o.ukuran_part || '-' }}
              </td>
              <td class="p-3.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                {{ o.estimation?.heat_number || '-' }}
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
                    class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-[11px] cursor-pointer"
                    title="Edit Estimasi"
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    v-if="o.status === 'Menunggu Persetujuan Pemesan' || o.estimation?.status_approval !== 'Disetujui'"
                    @click="handleDirectApprove(o.id)" 
                    class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                    title="Setujui Sekarang"
                  >
                    <i class="fa-solid fa-check"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="estimatedOrdersList.length === 0">
              <td colspan="10" class="p-8 text-center text-slate-400 dark:text-slate-500 italic">
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

// Form state with 7 standard cutting plan fields
const form = reactive({
  project_name: '',
  nesting_no: '',
  block_item: '',
  spec_material: '',
  dimension_material: '',
  product_number: '',
  heat_number: ''
})

// Orders available for material identification (exclude completed / already approved ones)
const pendingOrders = computed(() => {
  return store.orders.value.filter(o => {
    if (o.status === 'Sudah Diambil') return false
    if (o.estimation?.status_approval === 'Disetujui') return false
    return true
  })
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

  form.project_name = est?.project_name || order.nama_proyek_kapal || order.nama_proyek || ''
  form.nesting_no = est?.nesting_no || ''
  form.block_item = est?.block_item || ''
  form.spec_material = est?.spec_material || est?.grade || order.material || 'AH36'
  form.dimension_material = est?.dimension_material || est?.ukuran_plat || (order.ketebalan ? `${order.ketebalan} x 1500 x 6000 mm` : '12 x 1500 x 6000 mm')
  form.product_number = est?.product_number || order.ukuran_part || ''
  form.heat_number = est?.heat_number || ''
}, { immediate: true })

// Handle Submit Material Identification
async function handleSubmitEstimation() {
  if (!selectedOrder.value) return

  await store.saveEstimation({
    order_id: selectedOrder.value.id,
    project_name: form.project_name,
    nesting_no: form.nesting_no,
    block_item: form.block_item,
    spec_material: form.spec_material,
    dimension_material: form.dimension_material,
    product_number: form.product_number,
    heat_number: form.heat_number
  })

  feedbackMsg.value = {
    type: 'success',
    text: `Material Identification untuk order ${selectedOrder.value.no_order} berhasil disimpan!`
  }
}

// Handle Direct Approve
async function handleDirectApprove(orderId: number) {
  await store.approveEstimation(orderId)
  feedbackMsg.value = {
    type: 'success',
    text: `Material Identification order #${orderId} berhasil DISETUJUI!`
  }
  // Reset selected order to next pending order or null
  selectedOrderId.value = pendingOrders.value.length > 0 ? pendingOrders.value[0].id : null
}

onMounted(() => {
  store.initStore()

  // Auto select from query param ?order_id=...
  if (route.query.order_id) {
    const oid = Number(route.query.order_id)
    if (oid) {
      selectedOrderId.value = oid
    }
  } else if (pendingOrders.value.length > 0) {
    selectedOrderId.value = pendingOrders.value[0].id
  } else {
    selectedOrderId.value = null
  }
})
</script>
