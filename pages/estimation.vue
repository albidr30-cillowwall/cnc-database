<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-boxes-packing text-violet-500"></i>
          <span>Material Identification</span>
        </h1>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- Shortcut Button: Input Manual -->
        <button 
          type="button" 
          @click="setMode('manual')" 
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          :class="activeMode === 'manual' && !isLocked
            ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-400/30' 
            : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40'"
        >
          <i class="fa-solid fa-pen-to-square"></i>
          <span>Input Manual</span>
        </button>

        <!-- Shortcut Button: By Order -->
        <button 
          type="button" 
          @click="setMode('order')" 
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          :class="activeMode === 'order' && !isLocked
            ? 'bg-violet-600 hover:bg-violet-700 text-white ring-2 ring-violet-500/30' 
            : 'bg-violet-50 dark:bg-violet-950/40 border border-violet-300 dark:border-violet-800 text-violet-800 dark:text-violet-200 hover:bg-violet-100 dark:hover:bg-violet-900/40'"
        >
          <i class="fa-solid fa-clipboard-list"></i>
          <span>By Order</span>
        </button>

        <NuxtLink 
          to="/orders" 
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
        >
          <i class="fa-solid fa-list-check text-blue-500"></i>
          <span>Semua Order</span>
        </NuxtLink>
      </div>
    </div>

    <!-- 2 FITUR UTAMA DENGAN ICON (FEATURE SWITCHER TABS) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- By Order -->
      <button 
        type="button" 
        @click="setMode('order')"
        class="p-4 rounded-2xl border transition text-left cursor-pointer flex items-center gap-4 relative overflow-hidden"
        :class="activeMode === 'order'
          ? 'bg-violet-50/90 dark:bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/30 text-violet-950 dark:text-violet-100 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'"
      >
        <div 
          class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition"
          :class="activeMode === 'order' ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'"
        >
          <i class="fa-solid fa-clipboard-list text-xl"></i>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <span>By Order</span>
              <span v-if="activeMode === 'order'" class="w-2 h-2 rounded-full bg-violet-500"></span>
            </span>
            <span 
              v-if="eligibleOrders.length > 0"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-mono"
            >
              {{ eligibleOrders.length }} menunggu
            </span>
          </div>
        </div>
      </button>

      <!-- Input Manual -->
      <button 
        type="button" 
        @click="setMode('manual')"
        class="p-4 rounded-2xl border transition text-left cursor-pointer flex items-center gap-4 relative overflow-hidden"
        :class="activeMode === 'manual'
          ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'"
      >
        <div 
          class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition"
          :class="activeMode === 'manual' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'"
        >
          <i class="fa-solid fa-pen-to-square text-xl"></i>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <span>Input Manual</span>
              <span v-if="activeMode === 'manual'" class="w-2 h-2 rounded-full bg-amber-500"></span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              Mandiri
            </span>
          </div>
        </div>
      </button>
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

    <!-- MAIN WORK AREA CARD -->
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
        <div class="flex items-center gap-2">
          <button 
            type="button" 
            @click="setMode('manual')" 
            class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <i class="fa-solid fa-pen-to-square"></i>
            <span>Input Manual Baru</span>
          </button>
          <button 
            type="button" 
            @click="setMode('order')" 
            class="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <i class="fa-solid fa-clipboard-list"></i>
            <span>Pilih Order Lain</span>
          </button>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAMPILAN JIKA MODE 1: DARI ORDER APLIKASI                -->
      <!-- ======================================================== -->
      <div v-if="activeMode === 'order'" class="space-y-4">
        <!-- Baris Selector Order & Tombol Shortcut Manual -->
        <div class="p-4 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/60 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label class="text-xs font-black text-violet-800 dark:text-violet-300 uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-crosshairs text-violet-600 dark:text-violet-400"></i>
              <span>PILIH ORDER UNTUK MATERIAL IDENTIFICATION:</span>
            </label>
            <div class="flex items-center gap-3">
              <button 
                type="button" 
                @click="showAllOrders = !showAllOrders" 
                class="text-[11px] font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 underline cursor-pointer"
              >
                {{ showAllOrders ? 'Filter: Order Menunggu Saja' : 'Tampilkan Semua Order' }}
              </button>
              <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                ({{ eligibleOrders.length }} order menunggu)
              </span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2.5">
            <!-- Dropdown Pilihan Order -->
            <select 
              v-model="selectedOrderId" 
              :disabled="isLocked && viewingEstId !== null"
              class="flex-1 bg-white dark:bg-slate-950 border border-violet-300 dark:border-violet-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-violet-500 outline-none transition disabled:opacity-60"
            >
              <option :value="null">-- Pilih Order untuk Material Identification --</option>
              <option 
                v-for="po in displayedOrders" 
                :key="po.id" 
                :value="po.id"
              >
                {{ po.no_order }} - {{ po.nama_proyek }} ({{ po.material }} {{ po.ketebalan }}) {{ po.estimation?.status_approval === 'Disetujui' ? ' [SUDAH SELESAI]' : '' }}
              </option>
            </select>

            <!-- Tombol Switch Langsung ke Input Manual -->
            <button 
              type="button" 
              @click="setMode('manual')" 
              class="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer shadow-xs shrink-0"
              title="Klik untuk input langsung tanpa memilih order"
            >
              <i class="fa-solid fa-pen-to-square"></i>
              <span>Input Manual</span>
            </button>
          </div>
        </div>

        <!-- Jika Belum Memilih Order: Tampilkan Info Ajak Memilih atau Input Manual -->
        <div v-if="!selectedOrder && !viewingEstId" class="text-center py-10 px-4 border-2 border-dashed border-violet-200 dark:border-violet-900/50 rounded-2xl space-y-3 bg-violet-50/30 dark:bg-violet-950/10">
          <div class="w-12 h-12 mx-auto rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xl">
            <i class="fa-solid fa-clipboard-question"></i>
          </div>
          <div>
            <h3 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">Pilih Order di Dropdown atau Gunakan Input Manual</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
              Silakan pilih salah satu order di atas untuk mengisi/memverifikasi data Material Identification & nesting plat, atau klik tombol di bawah untuk input langsung secara mandiri.
            </p>
          </div>
          <div class="pt-2">
            <button 
              type="button" 
              @click="setMode('manual')" 
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-md shadow-amber-500/25 cursor-pointer"
            >
              <i class="fa-solid fa-pen-to-square"></i>
              <span>Buka Formulir Input Manual</span>
            </button>
          </div>
        </div>

        <!-- Summary Order Terpilih -->
        <div v-if="selectedOrder" class="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
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
      </div>

      <!-- ======================================================== -->
      <!-- TAMPILAN JIKA MODE 2: INPUT MANUAL (TANPA ORDER)         -->
      <!-- ======================================================== -->
      <div v-else-if="activeMode === 'manual'" class="space-y-4">
        <!-- Header Banner Mode Manual -->
        <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
              <i class="fa-solid fa-pen-to-square"></i>
            </div>
            <div>
              <div class="font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <span>Mode Input Manual</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">Aktif</span>
              </div>
            </div>
          </div>
          <button 
            type="button" 
            @click="setMode('order')" 
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-950 font-bold text-xs transition cursor-pointer shrink-0"
          >
            <i class="fa-solid fa-clipboard-list text-violet-500"></i>
            <span>Beralih ke By Order</span>
          </button>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- HELPER STOK PLAT YARD (BISA DIGUNAKAN DI KEDUA MODE)     -->
      <!-- ======================================================== -->
      <div 
        v-if="(activeMode === 'manual' || selectedOrder || viewingEstId) && !isLocked" 
        class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800"
      >
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
          <span class="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-extrabold uppercase">
            <i class="fa-solid fa-layer-group"></i>
            <span>Helper: Ambil dari Stok Plat Yard (Opsional)</span>
          </span>
          <span class="text-[10px] text-blue-500 font-normal">Auto-fill Spec, Dimensi & Heat No.</span>
        </label>
        <select 
          v-model="selectedPlateHelper" 
          @change="applyPlateHelper"
          class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option :value="null">-- Ketik Manual atau Pilih dari Stok Plat Yard --</option>
          <option v-for="plt in store.plates.value" :key="plt.id" :value="plt">
            {{ plt.no_plat }} ({{ plt.grade }} {{ plt.material_type }} - {{ plt.tebal_mm }}mm) - Heat: {{ plt.heat_number }}
          </option>
        </select>
      </div>

      <!-- ======================================================== -->
      <!-- FORMULIR 7 KOLOM MATERIAL IDENTIFICATION                -->
      <!-- Tampil langsung jika mode manual ATAU order telah dipilih -->
      <!-- ======================================================== -->
      <form 
        v-if="activeMode === 'manual' || selectedOrder || viewingEstId" 
        @submit.prevent="handleSubmitEstimation" 
        class="space-y-4 text-xs pt-2"
      >
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
              placeholder="contoh: KM. Sabuk Nusantara, Tugboat 24M, Workshop CNC..." 
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
            @click="triggerImageUpload"
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

        <!-- Tombol Aksi Simpan & Setujui -->
        <div class="pt-2">
          <div v-if="isLocked" class="flex justify-end gap-2">
            <button 
              type="button" 
              @click="setMode('manual')" 
              class="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition shadow-md shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
            >
              <i class="fa-solid fa-pen-to-square"></i>
              <span>Buat Input Manual Baru</span>
            </button>
            <button 
              type="button" 
              @click="setMode('order')" 
              class="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs transition shadow-md shadow-violet-600/25 flex items-center gap-2 cursor-pointer"
            >
              <i class="fa-solid fa-clipboard-list"></i>
              <span>Pilih Order Lain</span>
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
                  <i class="fa-solid fa-pen-to-square text-[9px]"></i>
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

// 2 Mode Fitur: 'order' (Fitur 1) atau 'manual' (Fitur 2)
const activeMode = ref<'order' | 'manual'>('order')
const showAllOrders = ref(false)

// Selected order ID
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

// Orders waiting for estimation
const eligibleOrders = computed(() => {
  return store.orders.value.filter(o => o.estimation?.status_approval !== 'Disetujui')
})

const displayedOrders = computed(() => {
  if (showAllOrders.value) {
    return store.orders.value
  }
  return eligibleOrders.value
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

function setMode(mode: 'order' | 'manual') {
  activeMode.value = mode
  viewingEstId.value = null
  isLocked.value = false

  if (mode === 'manual') {
    selectedOrderId.value = null
    resetFormFields()
  } else {
    // Mode order: jika sebelumnya belum pilih order dan ada order pending, biarkan pilih
    if (!selectedOrderId.value && eligibleOrders.value.length > 0) {
      selectedOrderId.value = eligibleOrders.value[0].id
    }
  }
}

function resetFormFields() {
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

function resetToNewManual() {
  setMode('manual')
}

function applyPlateHelper() {
  if (!selectedPlateHelper.value) return
  const plt = selectedPlateHelper.value
  form.spec_material = plt.grade && plt.grade !== '-' ? plt.grade : plt.material_type
  form.dimension_material = `${plt.tebal_mm} x ${plt.lebar_mm} x ${plt.panjang_mm} mm`
  form.heat_number = plt.heat_number && plt.heat_number !== '-' ? plt.heat_number : ''
}

// Populate form when selectedOrder changes in order mode
watch(selectedOrder, (order) => {
  if (activeMode.value !== 'order') return
  if (!order) {
    if (!viewingEstId.value) {
      resetFormFields()
      isLocked.value = false
    }
    return
  }
  viewingEstId.value = null
  isLocked.value = order.estimation?.status_approval === 'Disetujui'
  const est = order.estimation

  const cleanVal = (v: any) => (v && typeof v === 'string' && v.trim() !== '-' ? v.trim() : (typeof v === 'string' ? '' : v || ''))

  form.project_name = cleanVal(est?.project_name) || cleanVal(order.nama_proyek_kapal) || cleanVal(order.nama_proyek) || ''
  form.nesting_no = cleanVal(est?.nesting_no)
  form.block_item = cleanVal(est?.block_item)
  form.spec_material = cleanVal(est?.spec_material) || cleanVal(order.material) || ''
  form.dimension_material = cleanVal(est?.dimension_material) || cleanVal(est?.ukuran_plat) || (order.ketebalan ? `${order.ketebalan} x 1500 x 6000 mm` : '12 x 1500 x 6000 mm')
  form.product_number = cleanVal(est?.product_number) || cleanVal(order.ukuran_part) || ''
  form.heat_number = cleanVal(est?.heat_number)
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

function triggerImageUpload() {
  cuttingImageInput.value?.click()
}

function removeCuttingImage() {
  cuttingImagePreview.value = ''
  if (cuttingImageInput.value) {
    cuttingImageInput.value.value = ''
  }
}

// Handle Submit Material Identification (Order ataupun Manual)
async function handleSubmitEstimation() {
  if (isLocked.value) return

  const isFromOrder = activeMode.value === 'order' && Boolean(selectedOrderId.value)
  const orderIdToSave = isFromOrder ? selectedOrderId.value : null

  // 1. Simpan ke database
  const saved = await store.saveEstimation({
    order_id: orderIdToSave,
    project_name: form.project_name.trim(),
    nesting_no: form.nesting_no.trim(),
    block_item: form.block_item.trim(),
    spec_material: form.spec_material.trim(),
    dimension_material: form.dimension_material.trim(),
    product_number: form.product_number.trim() === '-' ? '' : form.product_number.trim(),
    heat_number: form.heat_number.trim(),
    cutting_image_url: cuttingImagePreview.value,
    status_approval: 'Disetujui'
  })

  // 2. Setujui secara resmi
  if (isFromOrder && selectedOrderId.value) {
    await store.approveEstimation(selectedOrderId.value)
  } else if (saved?.id) {
    await store.approveEstimation(saved.id, true)
  }

  const projLabel = form.project_name || 'Material Identification'

  feedbackMsg.value = {
    type: 'success',
    text: isFromOrder 
      ? `Material Identification untuk order berhasil DISIMPAN & DISETUJUI (Selesai)!`
      : `Material Identification Manual "${projLabel}" BERHASIL DISIMPAN & DISETUJUI (Selesai)!`
  }

  // 3. Reset form
  if (isFromOrder) {
    selectedOrderId.value = null
    resetFormFields()
  } else {
    resetToNewManual()
  }
}

// Lihat detail dari baris tabel
function handleViewEstimation(item: any) {
  viewingEstId.value = item.id || null
  isLocked.value = true

  if (item.order_id) {
    activeMode.value = 'order'
    selectedOrderId.value = item.order_id
  } else {
    activeMode.value = 'manual'
    selectedOrderId.value = null
  }

  const cleanVal = (v: any) => (v && typeof v === 'string' && v.trim() !== '-' ? v.trim() : (typeof v === 'string' ? '' : v || ''))

  form.project_name = cleanVal(item.project_name) || cleanVal(item.order?.nama_proyek) || 'Workshop CNC'
  form.nesting_no = cleanVal(item.nesting_no)
  form.block_item = cleanVal(item.block_item)
  form.spec_material = cleanVal(item.spec_material) || cleanVal(item.grade) || ''
  form.dimension_material = cleanVal(item.dimension_material) || cleanVal(item.ukuran_plat) || ''
  form.product_number = cleanVal(item.product_number) || cleanVal(item.order?.ukuran_part) || ''
  form.heat_number = cleanVal(item.heat_number)
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
      activeMode.value = 'order'
      selectedOrderId.value = oid
    }
  } else if (eligibleOrders.value.length > 0) {
    activeMode.value = 'order'
    selectedOrderId.value = eligibleOrders.value[0].id
  } else {
    activeMode.value = 'manual'
  }
})
</script>
