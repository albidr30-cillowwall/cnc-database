<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-boxes-packing text-violet-500"></i>
          <span>Material Identification</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Input & Edit Data Project Name, Nesting No., Block/Item, Spec & Dimension Material, Product & Heat Number, serta Gambar Selesai Pemotongan
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
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-xs font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-crosshairs"></i>
            <span>Pilih Order untuk Material Identification:</span>
          </label>
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              @click="showAllOrders = !showAllOrders" 
              class="text-[11px] font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 underline cursor-pointer"
            >
              {{ showAllOrders ? 'Filter: Hanya Selesai / Diambil' : 'Tampilkan Semua Order' }}
            </button>
            <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">({{ eligibleOrders.length }} order)</span>
          </div>
        </div>
        <select 
          v-model="selectedOrderId" 
          class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-violet-500 outline-none transition"
        >
          <option :value="null">-- Pilih Order untuk Material Identification --</option>
          <option 
            v-for="po in eligibleOrders" 
            :key="po.id" 
            :value="po.id"
          >
            {{ po.no_order }} - {{ po.nama_proyek }} ({{ po.material }} {{ po.ketebalan }}) [Status: {{ po.status }}]
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
                placeholder="contoh: AH36, DH36, EH36, Grade A, SS400, Al 5083..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-violet-500 outline-none"
              />
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

          <!-- 8. Gambar Selesai Pemotongan Plat -->
          <div class="pt-2">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-camera text-emerald-500"></i>
                <span>Gambar Selesai Pemotongan Plat</span>
              </span>
              <span class="text-[10px] text-slate-400 font-normal">Opsional</span>
            </label>
            
            <!-- Preview existing image -->
            <div v-if="cuttingImagePreview" class="mb-3 relative inline-block">
              <img 
                :src="cuttingImagePreview" 
                alt="Preview gambar pemotongan" 
                class="max-h-48 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs object-contain"
              />
              <button 
                type="button" 
                @click="removeCuttingImage" 
                class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center hover:bg-rose-600 cursor-pointer shadow-md"
                title="Hapus gambar"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Upload input -->
            <div 
              class="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-violet-400 dark:hover:border-violet-600 transition cursor-pointer"
              @click="($refs.cuttingImageInput as HTMLInputElement)?.click()"
              @dragover.prevent
              @drop.prevent="handleImageDrop"
            >
              <input 
                ref="cuttingImageInput"
                type="file" 
                accept="image/*" 
                class="hidden" 
                @change="handleImageSelect"
              />
              <i class="fa-solid fa-cloud-arrow-up text-2xl text-slate-400 dark:text-slate-600 mb-1.5 block"></i>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                {{ cuttingImagePreview ? 'Klik untuk ganti gambar' : 'Klik atau seret gambar ke sini' }}
              </p>
              <p class="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">PNG, JPG, JPEG (max 5MB)</p>
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
        <i class="fa-solid fa-boxes-packing text-4xl mb-2 block text-slate-300 dark:text-slate-700"></i>
        <p v-if="eligibleOrders.length === 0" class="text-slate-600 dark:text-slate-300 font-semibold not-italic">
          Belum ada order yang selesai dikerjakan atau diambil. Material Identification dapat diisi setelah Operator CNC menyelesaikan pemotongan barang.
        </p>
        <p v-else>Pilih salah satu order di atas untuk mengisi atau mengedit data Material Identification & nesting plat.</p>
        <p class="text-[11px] text-slate-400 dark:text-slate-600">Material Identification dapat diedit kapan saja untuk order yang telah siap diambil atau sudah diserahkan.</p>
      </div>
    </div>

    <!-- Active Estimations Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <i class="fa-solid fa-table-list text-violet-500"></i>
          <span>Daftar Material Identification Order</span>
        </h2>
        <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">{{ estimatedOrdersList.length }} order terdata</span>
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
              <th class="p-3.5">Gambar</th>
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
                <a 
                  v-if="o.estimation?.cutting_image_url" 
                  :href="o.estimation.cutting_image_url" 
                  target="_blank"
                  class="inline-block"
                >
                  <img 
                    :src="o.estimation.cutting_image_url" 
                    alt="Gambar pemotongan" 
                    class="w-12 h-12 rounded-lg object-cover border border-slate-300 dark:border-slate-700 hover:opacity-80 transition"
                  />
                </a>
                <span v-else class="text-slate-400 text-[10px] italic">-</span>
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
              <td colspan="11" class="p-8 text-center text-slate-400 dark:text-slate-500 italic">
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

// Form state with 7 standard cutting plan fields + image
const form = reactive({
  project_name: '',
  nesting_no: '',
  block_item: '',
  spec_material: '',
  dimension_material: '',
  product_number: '',
  heat_number: ''
})

const cuttingImagePreview = ref<string>('')
const cuttingImageInput = ref<HTMLInputElement | null>(null)

const showAllOrders = ref(false)

// Orders available for estimasi muat: defaults to "selesai dikerjakan" (Siap Diambil) or "diambil" (Sudah Diambil)
const eligibleOrders = computed(() => {
  if (!showAllOrders.value) {
    return store.orders.value.filter(o => 
      ['Siap Diambil', 'Sudah Diambil'].includes(o.status) || 
      o.id === selectedOrderId.value
    )
  }
  return store.orders.value
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
  cuttingImagePreview.value = est?.cutting_image_url || ''
}, { immediate: true })

// Image handlers
function handleImageSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  processImageFile(input.files[0])
}

function handleImageDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    processImageFile(file)
  }
}

function processImageFile(file: File) {
  if (file.size > 5 * 1024 * 1024) {
    feedbackMsg.value = { type: 'error', text: 'Ukuran gambar maksimal 5MB!' }
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    cuttingImagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removeCuttingImage() {
  cuttingImagePreview.value = ''
  if (cuttingImageInput.value) {
    cuttingImageInput.value.value = ''
  }
}

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
    heat_number: form.heat_number,
    cutting_image_url: cuttingImagePreview.value
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
  // Reset selected order to next eligible order or null
  selectedOrderId.value = eligibleOrders.value.length > 0 ? eligibleOrders.value[0].id : null
}

onMounted(() => {
  store.initStore()

  // Auto select from query param ?order_id=...
  if (route.query.order_id) {
    const oid = Number(route.query.order_id)
    if (oid) {
      selectedOrderId.value = oid
    }
  } else if (eligibleOrders.value.length > 0) {
    selectedOrderId.value = eligibleOrders.value[0].id
  } else {
    selectedOrderId.value = null
  }
})
</script>
