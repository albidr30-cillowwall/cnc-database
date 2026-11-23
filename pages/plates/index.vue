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
        <button 
          @click="isModalOpen = true" 
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition cursor-pointer"
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
      <div class="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <i class="fa-solid fa-boxes-stacked text-blue-500"></i>
        <span>Katalog Persediaan Plat</span>
      </div>

      <div class="flex items-center gap-2.5">
        <select 
          v-model="filterStatus" 
          class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Semua Status ({{ store.plates.value.length }} jenis)</option>
          <option value="Tersedia">Tersedia (Ada Stok)</option>
          <option value="Habis">Habis (Stok 0)</option>
        </select>
        <span class="text-[11px] font-mono text-slate-400">
          Tampil: <b>{{ filteredPlates.length }}</b> jenis (<b>{{ totalLembar }}</b> lbr)
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
              <th class="p-3.5">Spesifikasi & Material</th>
              <th class="p-3.5">Dimensi (P x L x T)</th>
              <th class="p-3.5 text-center">Stok (Lembar)</th>
              <th class="p-3.5">Berat</th>
              <th class="p-3.5">Status</th>
              <th class="p-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr 
              v-for="p in filteredPlates" 
              :key="p.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <td class="p-3.5 font-mono font-bold whitespace-nowrap text-blue-600 dark:text-blue-400">
                {{ p.no_plat }}
              </td>
              <td class="p-3.5">
                <div class="font-bold text-slate-900 dark:text-slate-100">{{ p.grade }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ p.material_type }}</div>
              </td>
              <td class="p-3.5 font-mono">
                {{ p.panjang_mm }} x {{ p.lebar_mm }} x <b class="text-slate-900 dark:text-white">{{ p.tebal_mm }}mm</b>
              </td>
              <td class="p-3.5 text-center whitespace-nowrap">
                <button 
                  type="button"
                  @click="openEditStockModal(p)"
                  class="group inline-flex items-center gap-1.5 font-mono font-extrabold text-sm px-2.5 py-1 rounded-xl transition cursor-pointer"
                  :class="(p.stok !== undefined ? p.stok : (p.status === 'Diambil' || p.status === 'Habis' ? 0 : 1)) > 0
                    ? 'bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'
                    : 'bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:border-rose-400'"
                  title="Klik untuk ubah stok plat ini"
                >
                  <i class="fa-solid fa-boxes-stacked text-xs"></i>
                  <span v-if="(p.stok !== undefined ? p.stok : (p.status === 'Diambil' || p.status === 'Habis' ? 0 : 1)) > 0">
                    {{ p.stok !== undefined ? p.stok : 1 }}
                  </span>
                  <span v-else>0</span>
                  <span class="text-[10px] font-sans font-semibold text-slate-400">lbr</span>
                  <i class="fa-solid fa-pen-to-square text-[10px] opacity-60 group-hover:opacity-100 text-blue-600 dark:text-blue-400 ml-0.5"></i>
                </button>
              </td>
              <td class="p-3.5 font-mono">
                <div class="font-bold text-slate-800 dark:text-slate-200">
                  {{ ((Number(p.berat_kg) || 0) * (p.stok !== undefined ? p.stok : 1)).toLocaleString('id-ID', { minimumFractionDigits: 1 }) }} kg
                </div>
                <div v-if="(p.stok !== undefined ? p.stok : 1) > 1" class="text-[10px] text-slate-400">
                  ({{ Number(p.berat_kg).toLocaleString('id-ID', { minimumFractionDigits: 1 }) }} kg/lbr)
                </div>
              </td>
              <td class="p-3.5">
                <span 
                  class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border"
                  :class="getStatusBadgeClass(p)"
                >
                  {{ (p.stok !== undefined && p.stok <= 0) ? 'Habis' : p.status }}
                </span>
              </td>
              <td class="p-3.5 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1">
                  <button 
                    type="button"
                    @click="openEditStockModal(p)" 
                    class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 transition cursor-pointer"
                    title="Edit Stok Plat"
                  >
                    <i class="fa-solid fa-pen-to-square text-sm"></i>
                  </button>
                  <button 
                    type="button"
                    @click="handleDeletePlate(p)" 
                    class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 transition cursor-pointer"
                    title="Hapus Plat"
                  >
                    <i class="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredPlates.length === 0">
              <td colspan="7" class="p-10 text-center text-slate-400 dark:text-slate-500 text-xs italic">
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
              <select 
                v-model="newPlateForm.material_type" 
                required 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Pilih Jenis Material --</option>
                <option value="Baja">Baja</option>
                <option value="Alumunium">Alumunium</option>
                <option value="Bordes Baja">Bordes Baja</option>
                <option value="Bordes Alumunium">Bordes Alumunium</option>
                <option value="Lainnya">Lainnya (Input Sendiri)</option>
              </select>

              <!-- Input Manual Jika Memilih Material 'Lainnya' -->
              <div v-if="newPlateForm.material_type === 'Lainnya'" class="mt-2">
                <input 
                  v-model="newPlateForm.material_type_custom" 
                  type="text" 
                  required 
                  placeholder="Ketik jenis material (contoh: Kuningan, Stainless)..." 
                  class="w-full bg-white dark:bg-slate-950 border-2 border-blue-500 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
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

            <!-- Preset Pilihan Cepat Dimensi -->
            <div class="sm:col-span-2 flex items-center gap-1.5 pt-1">
              <span class="text-[10px] text-slate-400 font-semibold">Pilihan Cepat Ukuran:</span>
              <button 
                type="button"
                @click="newPlateForm.panjang_mm = 9000; newPlateForm.lebar_mm = 2000"
                class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition cursor-pointer border"
                :class="newPlateForm.panjang_mm === 9000 && newPlateForm.lebar_mm === 2000 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white border-slate-200 dark:border-slate-700'"
              >
                9000 x 2000
              </button>
              <button 
                type="button"
                @click="newPlateForm.panjang_mm = 6000; newPlateForm.lebar_mm = 1500"
                class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition cursor-pointer border"
                :class="newPlateForm.panjang_mm === 6000 && newPlateForm.lebar_mm === 1500 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white border-slate-200 dark:border-slate-700'"
              >
                6000 x 1500
              </button>
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

    <!-- Modal Edit Stok Plat -->
    <div 
      v-if="editingPlate" 
      class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-extrabold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <i class="fa-solid fa-pen-to-square"></i>
            <span>Edit Stok Plat</span>
          </h3>
          <button 
            type="button"
            @click="closeEditStockModal" 
            class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <!-- Info Plat yang Sedang Diedit -->
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{{ editingPlate.no_plat }}</span>
            <span 
              class="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border"
              :class="getStatusBadgeClass(editingPlate)"
            >
              {{ editingPlate.status }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
            <div>
              <span class="block text-[10px] text-slate-400 uppercase font-semibold">Material & Grade</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">{{ editingPlate.grade }} ({{ editingPlate.material_type }})</span>
            </div>
            <div>
              <span class="block text-[10px] text-slate-400 uppercase font-semibold">Dimensi (P x L x T)</span>
              <span class="font-mono font-semibold text-slate-800 dark:text-slate-200">{{ editingPlate.panjang_mm }} x {{ editingPlate.lebar_mm }} x {{ editingPlate.tebal_mm }}mm</span>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSaveEditStock" class="space-y-4">
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold text-xs mb-1.5 flex items-center justify-between">
              <span>Jumlah Stok (Lembar) *</span>
              <span class="text-[11px] font-normal text-slate-400">Stok saat ini: <b class="font-mono text-slate-600 dark:text-slate-300">{{ editingPlate.stok !== undefined ? editingPlate.stok : (editingPlate.status === 'Habis' ? 0 : 1) }} lbr</b></span>
            </label>
            
            <!-- Counter Controls -->
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                @click="adjustStock(-1)"
                :disabled="editStockInput <= 0"
                class="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-lg flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Kurangi 1 lembar"
              >
                <i class="fa-solid fa-minus text-xs"></i>
              </button>
              
              <input 
                v-model.number="editStockInput" 
                type="number" 
                min="0" 
                required 
                class="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-center text-slate-800 dark:text-slate-200 font-mono font-extrabold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <button 
                type="button" 
                @click="adjustStock(1)"
                class="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-lg flex items-center justify-center transition cursor-pointer"
                title="Tambah 1 lembar"
              >
                <i class="fa-solid fa-plus text-xs"></i>
              </button>
            </div>

            <!-- Quick Adjustments -->
            <div class="flex flex-wrap items-center gap-1.5 mt-2">
              <button 
                type="button" 
                @click="editStockInput = 0"
                class="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 cursor-pointer transition"
              >
                Set 0 (Habis)
              </button>
              <button 
                type="button" 
                @click="adjustStock(1)"
                class="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition"
              >
                +1
              </button>
              <button 
                type="button" 
                @click="adjustStock(5)"
                class="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition"
              >
                +5
              </button>
              <button 
                type="button" 
                @click="adjustStock(10)"
                class="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition"
              >
                +10
              </button>
              <button 
                type="button" 
                @click="adjustStock(20)"
                class="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition"
              >
                +20
              </button>
            </div>
          </div>

          <!-- Preview Status & Total Berat Baru -->
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Status baru:</span>
              <span 
                v-if="editStockInput > 0"
                class="inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              >
                <i class="fa-solid fa-circle-check text-[9px]"></i> Tersedia
              </span>
              <span 
                v-else
                class="inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              >
                <i class="fa-solid fa-circle-xmark text-[9px]"></i> Habis (0 lbr)
              </span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Perkiraan total berat:</span>
              <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
                {{ ((Number(editingPlate.berat_kg) || 0) * (editStockInput || 0)).toLocaleString('id-ID', { minimumFractionDigits: 1 }) }} kg
              </span>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              @click="closeEditStockModal" 
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="isSavingStock"
              class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <i v-if="isSavingStock" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-check"></i>
              <span>{{ isSavingStock ? 'Menyimpan...' : 'Simpan Perubahan Stok' }}</span>
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
const editingPlate = ref<any>(null)
const editStockInput = ref<number>(0)
const isSavingStock = ref(false)
const filterStatus = ref('')
const feedbackMsg = ref<string | null>(null)

const newPlateForm = reactive({
  material_type: '',
  material_type_custom: '',
  grade: '',
  panjang_mm: 6000,
  lebar_mm: 1500,
  tebal_mm: 12,
  jumlah: 1
})

const effectiveMaterialType = computed(() => {
  if (newPlateForm.material_type === 'Lainnya') {
    return newPlateForm.material_type_custom || ''
  }
  return newPlateForm.material_type || ''
})

const estimatedNewWeight = computed(() => {
  const p = newPlateForm.panjang_mm || 0
  const l = newPlateForm.lebar_mm || 0
  const t = newPlateForm.tebal_mm || 0
  const mat = (effectiveMaterialType.value || '').toLowerCase()
  const density = mat.includes('alumin') ? 0.0000027 : (mat.includes('stainless') ? 0.0000080 : 0.00000785)
  return (p * l * t * density).toFixed(2)
})

const filteredPlates = computed(() => {
  return store.plates.value.filter(p => {
    const stok = p.stok !== undefined ? p.stok : (p.status === 'Diambil' || p.status === 'Habis' ? 0 : 1)
    if (filterStatus.value === 'Tersedia' && (stok <= 0 || p.status !== 'Tersedia')) return false
    if (filterStatus.value === 'Habis' && stok > 0 && p.status !== 'Habis') return false
    if (filterStatus.value && !['Tersedia', 'Habis'].includes(filterStatus.value) && p.status !== filterStatus.value) return false
    return true
  })
})

const totalLembar = computed(() => {
  return filteredPlates.value.reduce((acc, p) => acc + (p.stok !== undefined ? p.stok : (p.status === 'Diambil' || p.status === 'Habis' ? 0 : 1)), 0)
})

function getStatusBadgeClass(p: any) {
  const stok = p.stok !== undefined ? p.stok : (p.status === 'Diambil' || p.status === 'Habis' ? 0 : 1)
  if (stok <= 0 || p.status === 'Habis') {
    return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  }
  switch (p.status) {
    case 'Tersedia':
      return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    case 'Diambil':
      return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  }
}

function openEditStockModal(plate: any) {
  editingPlate.value = plate
  editStockInput.value = plate.stok !== undefined ? plate.stok : (plate.status === 'Diambil' || plate.status === 'Habis' ? 0 : 1)
}

function closeEditStockModal() {
  editingPlate.value = null
  editStockInput.value = 0
}

function adjustStock(delta: number) {
  editStockInput.value = Math.max(0, (editStockInput.value || 0) + delta)
}

async function handleSaveEditStock() {
  if (!editingPlate.value) return
  isSavingStock.value = true
  try {
    const newStock = Math.max(0, Math.floor(Number(editStockInput.value) || 0))
    await store.updatePlateStock(editingPlate.value.id, newStock)
    feedbackMsg.value = `Stok plat ${editingPlate.value.no_plat} berhasil diperbarui menjadi ${newStock} lembar!`
    closeEditStockModal()
  } catch (err: any) {
    alert('Gagal menyimpan perubahan stok plat: ' + (err?.message || err))
  } finally {
    isSavingStock.value = false
  }
}

async function handleSubmitPlate() {
  const mat = effectiveMaterialType.value.trim()
  if (!mat) {
    alert('Silakan pilih jenis material terlebih dahulu.')
    return
  }

  const p = await store.addPlate({
    material_type: mat,
    grade: newPlateForm.grade,
    panjang_mm: newPlateForm.panjang_mm,
    lebar_mm: newPlateForm.lebar_mm,
    tebal_mm: newPlateForm.tebal_mm,
    jumlah: newPlateForm.jumlah
  })

  feedbackMsg.value = `Plat baru ${p.no_plat} (${p.material_type} - ${p.grade}) dengan stok ${p.stok} lembar berhasil didaftarkan ke Stok Plat!`
  isModalOpen.value = false

  // Reset form
  newPlateForm.material_type = ''
  newPlateForm.material_type_custom = ''
  newPlateForm.grade = ''
  newPlateForm.jumlah = 1
}

async function handleDeletePlate(plate: any) {
  if (!confirm(`Hapus data plat ${plate.no_plat} (${plate.grade} ${plate.material_type})?`)) return
  await store.deletePlate(plate.id)
  feedbackMsg.value = `Plat ${plate.no_plat} berhasil dihapus.`
}

onMounted(() => {
  store.initStore()
})
</script>

