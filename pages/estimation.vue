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
          Pencatatan lembar kerja nesting, spec material, heat number & verifikasi hasil pemotongan plat CNC (dengan atau tanpa order).
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button 
          v-if="isLocked || selectedOrderId" 
          type="button" 
          @click="resetToNewManual" 
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <i class="fa-solid fa-plus-circle"></i>
          <span>Form Baru (Input Manual)</span>
        </button>

        <NuxtLink 
          to="/orders" 
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
        >
          <i class="fa-solid fa-list-check text-blue-500"></i>
          <span>Lihat Semua Order</span>
        </NuxtLink>
      </div>
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

    <!-- Main Card: Form Selalu Tampil Langsung (Always Open) -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
      
      <!-- Banner jika Sedang Melihat Data yang Sudah Disetujui (Terkunci) -->
      <div v-if="isLocked" class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-200">
        <div class="flex items-center gap-2.5">
          <i class="fa-solid fa-circle-check text-emerald-600 text-base"></i>
          <div>
            <p class="font-bold">Material Identification Selesai & Disetujui (Terkunci)</p>
            <p class="text-[11px] text-emerald-600 dark:text-emerald-400">Data telah selesai dipotong & diverifikasi. Formulir dalam mode lihat (read-only).</p>
          </div>
        </div>
        <button 
          type="button" 
          @click="resetToNewManual" 
          class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <i class="fa-solid fa-plus-circle"></i>
          <span>Buat Identifikasi Baru</span>
        </button>
      </div>

      <!-- Bagian 1: Pemilihan Order (Opsional - Bisa Kosong untuk Input Manual) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <!-- Dropdown Hubungkan ke Order -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-extrabold uppercase">
              <i class="fa-solid fa-link"></i>
              <span>Hubungkan ke Order Aplikasi (Opsional):</span>
            </span>
            <span class="text-[10px] text-slate-400 font-normal">Tidak wajib dipilih</span>
          </label>
          <select 
            v-model="selectedOrderId" 
            :disabled="isLocked"
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-violet-500 outline-none transition disabled:opacity-60"
          >
            <option :value="null">-- Tanpa Order (Input Manual / Langsung) --</option>
            <option 
              v-for="po in eligibleOrders" 
              :key="po.id" 
              :value="po.id"
            >
              {{ po.no_order }} - {{ po.nama_proyek }} ({{ po.material }} {{ po.ketebalan }})
            </option>
          </select>
        </div>

        <!-- Dropdown Bantuan Ambil dari Stok Plat Yard (Opsional) -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-extrabold uppercase">
              <i class="fa-solid fa-layer-group"></i>
              <span>Ambil dari Stok Plat Yard (Opsional):</span>
            </span>
            <span class="text-[10px] text-blue-500 font-normal">Auto-fill Dimensi & Heat No.</span>
          </label>
          <select 
            v-model="selectedPlateHelper" 
            @change="applyPlateHelper"
            :disabled="isLocked"
            class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          >
            <option :value="null">-- Ketik Manual atau Pilih dari Stok Plat --</option>
            <option v-for="plt in store.plates.value" :key="plt.id" :value="plt">
              {{ plt.no_plat }} ({{ plt.grade }} {{ plt.material_type }} - {{ plt.tebal_mm }}mm) - Heat: {{ plt.heat_number }}
            </option>
          </select>
        </div>
      </div>

      <!-- Info Box jika Terhubung ke Order Aplikasi -->
      <div v-if="selectedOrder" class="p-3.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/60 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Pemesan</span>
          <b class="text-slate-900 dark:text-white">{{ selectedOrder.nama_pemesan }}</b>
          <div class="text-[10px] text-slate-400">{{ selectedOrder.departemen_pemesan }}</div>
        </div>
        <div>
          <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Material Order</span>
          <b class="text-slate-900 dark:text-white">{{ selectedOrder.material }} ({{ selectedOrder.ketebalan }})</b>
          <div class="text-[10px] text-slate-400">Target: {{ selectedOrder.target_cnc }}</div>
        </div>
        <div>
          <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Jumlah & Part</span>
          <b class="font-mono text-slate-900 dark:text-white">{{ selectedOrder.jumlah_pesanan }} {{ selectedOrder.satuan }}</b>
          <div class="text-[10px] text-slate-400">{{ selectedOrder.ukuran_part }}</div>
        </div>
        <div>
          <span class="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Status Order</span>
          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            {{ selectedOrder.status }}
          </span>
        </div>
      </div>

      <!-- Info Badge jika Mode Manual (Tanpa Order) -->
      <div v-else-if="!isLocked" class="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
        <i class="fa-solid fa-pen-ruler text-amber-500 text-sm"></i>
        <span><strong>Mode Input Manual (Tanpa Order):</strong> Isi data identifikasi pemotongan di bawah ini. Data akan langsung tercatat di sistem sebagai pekerjaan workshop mandiri.</span>
      </div>

      <!-- FORMULIR 7 KOLOM MATERIAL IDENTIFICATION (LANGSUNG TAMPIL) -->
      <form @submit.prevent="handleSubmitEstimation" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- 1. Project Name -->
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
              <i class="fa-solid fa-ship text-blue-500"></i>
              <span>Project Name *</span>
            </label>
            <input 
              v-model="form.project_name" 
              type="text" 
              required
              :disabled="isLocked"
              placeholder="contoh: KM. Sabuk Nusantara, Tugboat 24M, Barge 300..." 
              :class="isLocked ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-80 text-slate-600 dark:text-slate-400' : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200'"
              class="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-violet-500 outline-none"
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
              :disabled="isLocked"
              placeholder="contoh: NST-001, N-102-A..." 
              :class="isLocked ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-80 text-slate-600 dark:text-slate-400' : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200'"
              class="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold focus:ring-2 focus:ring-violet-500 outline-none"
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
              :disabled="isLocked"
              placeholder="contoh: Block 101, B-02, Web Frame 45..." 
              :class="isLocked ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-80 text-slate-600 dark:text-slate-400' : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200'"
              class="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          <!-- 4. Spec of Material -->
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-certificate text-cyan-500"></i>
                <span>Spec of Material *</span>
              </span>
              <span class="text-[10px] text-slate-400 font-normal">Wajib</span>
            </label>
            <input 
              v-model="form.spec_material" 
              type="text" 
              required
              :disabled="isLocked"
              placeholder="contoh: AH36, DH36, Grade A, SS400, Al 5083..." 
              :class="isLocked ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-80 text-slate-600 dark:text-slate-400' : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200'"
              class="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          <!-- 5. Dimension of Material -->
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-ruler-combined text-emerald-500"></i>
                <span>Dimension of Material *</span>
              </span>
              <span class="text-[10px] text-slate-400 font-normal">Wajib</span>
            </label>
            <input 
              v-model="form.dimension_material" 
              type="text" 
              required
              :disabled="isLocked"
              placeholder="contoh: 12 x 1500 x 6000 mm, 8 x 2000 x 9000 mm..." 
              :class="isLocked ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-80 text-slate-600 dark:text-slate-400' : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200'"
              class="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold focus:ring-2 focus:ring-violet-500 outline-none"
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
              :disabled="isLocked"
              placeholder="contoh: PRD-001, P-304, PART-A..." 
              :class="isLocked ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-80 text-slate-600 dark:text-slate-400' : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200'"
              class="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono font-semibold focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          <!-- 7. Heat Number -->
          <div class="sm:col-span-2">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-fire text-rose-500"></i>
                <span>Heat Number / Nomor Leburan Plat *</span>
              </span>
              <span class="text-[10px] text-rose-500 font-bold">Wajib untuk Traceability</span>
            </label>
            <input 
              v-model="form.heat_number" 
              type="text" 
              required
              :disabled="isLocked"
              placeholder="contoh: HT-99882, H-12345, 240899..." 
              :class="isLocked ? 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-80 text-slate-600 dark:text-slate-400' : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200'"
              class="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>
        </div>

        <!-- 8. Foto Gambar Selesai Pemotongan Plat -->
        <div class="pt-2">
          <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <i class="fa-solid fa-camera text-sky-500"></i>
              <span>Foto Gambar Selesai Pemotongan Plat (Cutting Photo)</span>
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
              v-if="!isLocked" 
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
            v-if="!isLocked"
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
              {{ cuttingImagePreview ? 'Klik untuk ganti gambar' : 'Klik atau seret foto hasil pemotongan plat ke sini' }}
            </p>
            <p class="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">PNG, JPG, JPEG (Otomatis dikompres)</p>
          </div>
        </div>

        <!-- Tombol Simpan -->
        <div class="pt-2">
          <div v-if="isLocked" class="flex justify-end">
            <button 
              type="button" 
              @click="resetToNewManual" 
              class="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs transition shadow-md shadow-violet-600/25 flex items-center gap-2 cursor-pointer"
            >
              <i class="fa-solid fa-plus-circle"></i>
              <span>Buat Material Identification Baru</span>
            </button>
          </div>
          <button 
            v-else
            type="submit" 
            class="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold p-3.5 rounded-xl shadow-md shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <i class="fa-solid fa-circle-check"></i>
            <span>SIMPAN & SETUJUI MATERIAL IDENTIFICATION (SELESAI)</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Active Estimations Table (Menampilkan seluruh Material Identification, baik Order maupun Manual) -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <i class="fa-solid fa-table-list text-violet-500"></i>
          <span>Daftar Material Identification (Order & Manual)</span>
        </h2>
        <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">Total: {{ allEstimationsList.length }} data terdaftar</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-extrabold text-left">
            <tr>
              <th class="p-3.5">No. Order / Asal</th>
              <th class="p-3.5">Project Name</th>
              <th class="p-3.5">Nesting No.</th>
              <th class="p-3.5">Block/Item</th>
              <th class="p-3.5">Spec of Material</th>
              <th class="p-3.5">Dimension of Material</th>
              <th class="p-3.5">Product No.</th>
              <th class="p-3.5">Heat No.</th>
              <th class="p-3.5">Foto Potongan</th>
              <th class="p-3.5">Status Approval</th>
              <th class="p-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr 
              v-for="item in allEstimationsList" 
              :key="item.id || ('est-' + item.order_id)"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="p-3.5 font-mono font-bold whitespace-nowrap">
                <span v-if="item.order" class="text-violet-600 dark:text-violet-400">
                  {{ item.order.no_order }}
                </span>
                <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <i class="fa-solid fa-wrench text-[9px]"></i>
                  <span>MANUAL</span>
                </span>
              </td>
              <td class="p-3.5">
                <div class="font-bold text-slate-900 dark:text-slate-100">{{ item.project_name || item.order?.nama_proyek || 'Workshop CNC' }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ item.order?.nama_pemesan || 'Operator Workshop' }}</div>
              </td>
              <td class="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                {{ item.nesting_no || '-' }}
              </td>
              <td class="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                {{ item.block_item || '-' }}
              </td>
              <td class="p-3.5">
                <span class="font-bold text-cyan-600 dark:text-cyan-400">{{ item.spec_material || item.grade || '-' }}</span>
              </td>
              <td class="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                {{ item.dimension_material || item.ukuran_plat || item.order?.ketebalan || '-' }}
              </td>
              <td class="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                {{ item.product_number || item.order?.ukuran_part || '-' }}
              </td>
              <td class="p-3.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                {{ item.heat_number || '-' }}
              </td>
              <td class="p-3.5">
                <a 
                  v-if="item.cutting_image_url" 
                  :href="sanitizeUrl(item.cutting_image_url)" 
                  target="_blank"
                  class="inline-block"
                >
                  <img 
                    :src="item.cutting_image_url" 
                    alt="Gambar pemotongan" 
                    class="w-12 h-12 rounded-lg object-cover border border-slate-300 dark:border-slate-700 hover:opacity-80 transition"
                  />
                </a>
                <span v-else class="text-slate-400 text-[10px] italic">-</span>
              </td>
              <td class="p-3.5">
                <span 
                  class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border"
                  :class="item.status_approval === 'Disetujui'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'"
                >
                  {{ item.status_approval || 'Disetujui' }}
                </span>
              </td>
              <td class="p-3.5 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button 
                    @click="handleViewEstimation(item)" 
                    class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-[11px] cursor-pointer"
                    title="Lihat Detail (Terkunci)"
                  >
                    <i class="fa-solid fa-eye text-blue-600 dark:text-blue-400"></i>
                  </button>
                  <button 
                    v-if="item.id"
                    @click="handleDeleteEst(item)"
                    class="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] cursor-pointer"
                    title="Hapus Data"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="allEstimationsList.length === 0">
              <td colspan="11" class="p-8 text-center text-slate-400 dark:text-slate-500 italic">
                Belum ada data Material Identification yang tercatat.
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
import { useCncStore, type Plate } from '~/composables/useCncStore'
import { useSecurity } from '~/composables/useSecurity'
import { useImageCompressor } from '~/composables/useImageCompressor'

const route = useRoute()
const store = useCncStore()
const { sanitizeUrl } = useSecurity()
const { compressImage } = useImageCompressor()

// Selected order ID (null = Mode Manual tanpa order)
const selectedOrderId = ref<number | null>(null)
const viewingEstId = ref<number | null>(null)
const isLocked = ref(false)
const selectedPlateHelper = ref<Plate | null>(null)
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

// Eligible orders that still need material identification
const eligibleOrders = computed(() => {
  return store.orders.value.filter(o => o.estimation?.status_approval !== 'Disetujui')
})

const selectedOrder = computed(() => {
  if (!selectedOrderId.value) return null
  return store.orders.value.find(o => o.id === selectedOrderId.value) || null
})

// Unified list of all estimations for the table below (orders + manual)
const allEstimationsList = computed(() => {
  return store.estimations.value.map(est => {
    const linkedOrder = est.order_id ? store.orders.value.find(o => o.id === est.order_id) : null
    return {
      ...est,
      order: linkedOrder
    }
  })
})

function resetToNewManual() {
  selectedOrderId.value = null
  viewingEstId.value = null
  isLocked.value = false
  selectedPlateHelper.value = null
  form.project_name = ''
  form.nesting_no = ''
  form.block_item = ''
  form.spec_material = ''
  form.dimension_material = ''
  form.product_number = ''
  form.heat_number = ''
  cuttingImagePreview.value = ''
  if (cuttingImageInput.value) {
    cuttingImageInput.value.value = ''
  }
}

function applyPlateHelper() {
  if (!selectedPlateHelper.value) return
  const plt = selectedPlateHelper.value
  form.spec_material = plt.grade && plt.grade !== '-' ? plt.grade : plt.material_type
  form.dimension_material = `${plt.tebal_mm} x ${plt.lebar_mm} x ${plt.panjang_mm} mm`
  form.heat_number = plt.heat_number && plt.heat_number !== '-' ? plt.heat_number : ''
}

// Populate form when selectedOrder changes
watch(selectedOrder, (order) => {
  if (!order) {
    if (!viewingEstId.value) {
      resetToNewManual()
    }
    return
  }
  viewingEstId.value = null
  isLocked.value = order.estimation?.status_approval === 'Disetujui'
  const est = order.estimation

  form.project_name = est?.project_name || order.nama_proyek_kapal || order.nama_proyek || ''
  form.nesting_no = est?.nesting_no || ''
  form.block_item = est?.block_item || ''
  form.spec_material = est?.spec_material || order.material || ''
  form.dimension_material = est?.dimension_material || est?.ukuran_plat || (order.ketebalan ? `${order.ketebalan} x 1500 x 6000 mm` : '12 x 1500 x 6000 mm')
  form.product_number = est?.product_number || order.ukuran_part || ''
  form.heat_number = est?.heat_number || ''
  cuttingImagePreview.value = est?.cutting_image_url || ''
})

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

async function processImageFile(file: File) {
  if (file.size > 10 * 1024 * 1024) {
    feedbackMsg.value = { type: 'error', text: 'Ukuran gambar maksimal 10MB!' }
    return
  }
  try {
    cuttingImagePreview.value = await compressImage(file, 1200, 0.75)
  } catch {
    const reader = new FileReader()
    reader.onload = (e) => {
      cuttingImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function removeCuttingImage() {
  cuttingImagePreview.value = ''
  if (cuttingImageInput.value) {
    cuttingImageInput.value.value = ''
  }
}

// Handle Submit Material Identification (Dengan Order ataupun Manual Tanpa Order)
async function handleSubmitEstimation() {
  if (isLocked.value) return

  // 1. Simpan ke database (jika selectedOrderId ada, dikaitkan ke order; jika null, disimpan sebagai manual)
  const saved = await store.saveEstimation({
    order_id: selectedOrderId.value || null,
    project_name: form.project_name.trim(),
    nesting_no: form.nesting_no.trim(),
    block_item: form.block_item.trim(),
    spec_material: form.spec_material.trim(),
    dimension_material: form.dimension_material.trim(),
    product_number: form.product_number.trim(),
    heat_number: form.heat_number.trim(),
    cutting_image_url: cuttingImagePreview.value,
    status_approval: 'Disetujui'
  })

  // 2. Setujui secara resmi
  if (selectedOrderId.value) {
    await store.approveEstimation(selectedOrderId.value)
  } else if (saved?.id) {
    await store.approveEstimation(saved.id, true)
  }

  const projLabel = form.project_name || 'Material Identification'
  const isFromOrder = Boolean(selectedOrderId.value)

  // 3. Reset form siap untuk input berikutnya
  resetToNewManual()

  feedbackMsg.value = {
    type: 'success',
    text: isFromOrder 
      ? `Material Identification untuk order berhasil DISIMPAN & DISETUJUI (Selesai)!`
      : `Material Identification Manual "${projLabel}" BERHASIL DISIMPAN & DISETUJUI (Selesai)!`
  }
}

// Lihat detail dari baris tabel
function handleViewEstimation(item: any) {
  viewingEstId.value = item.id || null
  isLocked.value = true
  selectedOrderId.value = item.order_id || null

  form.project_name = item.project_name || item.order?.nama_proyek || 'Workshop CNC'
  form.nesting_no = item.nesting_no || ''
  form.block_item = item.block_item || ''
  form.spec_material = item.spec_material || item.grade || ''
  form.dimension_material = item.dimension_material || item.ukuran_plat || ''
  form.product_number = item.product_number || ''
  form.heat_number = item.heat_number || ''
  cuttingImagePreview.value = item.cutting_image_url || ''
  selectedPlateHelper.value = null

  // Scroll ke formulir atas agar operator langsung melihat detailnya
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleDeleteEst(item: any) {
  const label = item.order ? item.order.no_order : (item.project_name || 'Material Identification')
  if (!confirm(`Hapus data Material Identification ${label}?`)) return
  if (item.id) {
    await store.deleteEstimation(item.id)
    feedbackMsg.value = {
      type: 'success',
      text: `Data Material Identification ${label} berhasil dihapus.`
    }
    if (viewingEstId.value === item.id || selectedOrderId.value === item.order_id) {
      resetToNewManual()
    }
  }
}

onMounted(() => {
  store.initStore()

  // Jika ada query param ?order_id=...
  if (route.query.order_id) {
    const oid = Number(route.query.order_id)
    if (oid) {
      selectedOrderId.value = oid
    }
  }
})
</script>