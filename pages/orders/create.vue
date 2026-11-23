<template>
  <div class="max-w-4xl mx-auto space-y-5">
    <div class="flex items-center justify-between">
      <div class="text-xs text-slate-500 dark:text-slate-400">
        Nomor order (<code class="font-mono font-bold text-blue-600 dark:text-blue-400">ORD-CNC-XXX</code>) akan dibuat otomatis oleh sistem.
      </div>
      <NuxtLink 
        to="/orders" 
        class="text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3.5 py-2 rounded-xl shadow-xs transition"
      >
        <i class="fa-solid fa-list-check mr-1"></i> Daftar Order
      </NuxtLink>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- A. Detail Pekerjaan -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div class="text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider pb-2.5 border-b border-slate-100 dark:border-slate-800">
          A. Detail Pekerjaan
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Jenis Pekerjaan *</label>
            <select 
              v-model="form.jenis_pekerjaan_kategori" 
              required 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:border-blue-600"
            >
              <option value="">-- Pilih Jenis Pekerjaan --</option>
              <option>Pemotongan Plat Baru</option>
              <option>Cutting Nesting</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div v-if="form.jenis_pekerjaan_kategori === 'Lainnya'">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Isi Jenis Pekerjaan Lainnya *</label>
            <input 
              v-model="form.jenis_lainnya" 
              type="text" 
              required 
              placeholder="Tuliskan jenis pekerjaan..." 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:border-blue-600"
            >
          </div>
        </div>
      </div>

      <!-- B. Identitas Pemesan -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div class="text-xs font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider pb-2.5 border-b border-slate-100 dark:border-slate-800">
          B. Identitas Pemesan
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Nama Pemesan *</label>
            <input 
              v-model="form.nama_pemesan" 
              type="text" 
              required 
              placeholder="Isi nama pemesan..." 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:border-blue-600"
            >
          </div>
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Departemen *</label>
            <select 
              v-model="form.departemen_pemesan" 
              required 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none"
            >
              <option value="" disabled>-- Pilih Departemen --</option>
              <option v-for="d in departmentOptions" :key="d" :value="d">{{ d }}</option>
              <option value="Lainnya">Lainnya...</option>
            </select>
            <div v-if="form.departemen_pemesan === 'Lainnya'" class="mt-2">
              <input 
                v-model="customDepartemen" 
                type="text" 
                required 
                placeholder="Tuliskan nama departemen lainnya..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:border-blue-600 outline-none"
              >
            </div>
          </div>
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">No. HP Pemesan *</label>
            <input 
              v-model="form.no_hp_pemesan" 
              type="text" 
              required 
              placeholder="Isi nomor WhatsApp/HP..." 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:border-blue-600"
            >
          </div>
        </div>
      </div>

      <!-- C. Detail Pesanan Part Plat -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div class="text-xs font-extrabold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider pb-2.5 border-b border-slate-100 dark:border-slate-800">
          C. Detail Pesanan Part Plat
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Nama Proyek / Part Pesanan *</label>
            <input 
              v-model="form.nama_proyek" 
              type="text" 
              required 
              placeholder="Isi nama proyek atau nama part..." 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:border-blue-600"
            >
          </div>
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Kapal / No. Hull / No. Blok (Opsional)</label>
            <input 
              v-model="form.nama_proyek_kapal" 
              type="text" 
              placeholder="Isi nama kapal, nomor hull, atau blok..." 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:border-blue-600"
            >
          </div>
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Jenis Material (Material Pilihan) *</label>
            <select 
              v-model="form.material" 
              required 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="">-- Pilih Jenis Material --</option>
              <option value="Baja">Baja</option>
              <option value="Alumunium">Alumunium</option>
              <option value="Bordes Baja">Bordes Baja</option>
              <option value="Bordes Alumunium">Bordes Alumunium</option>
              <option value="Lainnya">Lainnya (Input Sendiri)</option>
            </select>
          </div>

          <!-- Input Manual Jika Memilih Material 'Lainnya' -->
          <div v-if="form.material === 'Lainnya'">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Sebutkan Jenis Material Lainnya *</label>
            <input 
              v-model="form.material_lainnya" 
              type="text" 
              required 
              placeholder="Ketik jenis material (contoh: Kuningan, Tembaga, Hardox)..." 
              class="w-full bg-white dark:bg-slate-950 border-2 border-blue-500 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
          </div>
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Ketebalan Plat *</label>
            <input 
              v-model="form.ketebalan" 
              type="text" 
              required 
              placeholder="Contoh: 6mm, 10mm, 12mm, 20mm..." 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:border-blue-600"
            >
          </div>
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Jumlah Pesanan (pcs) *</label>
            <input 
              v-model.number="form.jumlah_pesanan" 
              type="number" 
              required 
              min="1" 
              placeholder="Isi jumlah part..." 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 font-mono focus:border-blue-600"
            >
          </div>
          <!-- Dropdown Ukuran Part (Editable Combobox + Preset + Tambah Opsi) -->
          <div class="relative" ref="ukuranContainerRef">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-ruler-combined text-blue-500"></i>
                <span>Ukuran Part (Panjang x Lebar mm)</span>
              </span>
              <span class="text-[10px] text-slate-400 font-normal">Opsional (Pilih / Edit Manual)</span>
            </label>

            <div class="relative">
              <input 
                v-model="form.ukuran_part" 
                type="text" 
                list="ukuran-part-datalist"
                placeholder="Pilih dropdown atau ketik (contoh: 9000 x 2000)..." 
                @focus="isUkuranDropdownOpen = true"
                @keydown.down.prevent="isUkuranDropdownOpen = true"
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 pr-10 text-slate-800 dark:text-slate-100 font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
              <!-- Tombol toggle dropdown icon panah -->
              <button 
                type="button"
                @click.stop="isUkuranDropdownOpen = !isUkuranDropdownOpen"
                tabindex="-1"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                title="Buka pilihan ukuran"
              >
                <i class="fa-solid fa-chevron-down text-xs transition-transform duration-200" :class="{ 'rotate-180': isUkuranDropdownOpen }"></i>
              </button>
            </div>

            <!-- Native Datalist untuk fallback autocomplete browser -->
            <datalist id="ukuran-part-datalist">
              <option v-for="item in availableUkuranList" :key="item" :value="item" />
            </datalist>

            <!-- Floating Dropdown Menu -->
            <div 
              v-if="isUkuranDropdownOpen"
              class="absolute z-30 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden py-1.5 text-xs animate-in fade-in"
            >
              <div class="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <span>Daftar Pilihan Ukuran</span>
                <span class="text-[9px] text-blue-500">Klik untuk memilih</span>
              </div>

              <!-- List Options -->
              <div class="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                <div 
                  v-for="item in availableUkuranList" 
                  :key="item"
                  @click="selectUkuran(item)"
                  class="px-3.5 py-2.5 flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition group"
                  :class="form.ukuran_part === item ? 'bg-blue-50/70 dark:bg-blue-950/50 font-bold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'"
                >
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-ruler text-slate-400 group-hover:text-blue-500 text-xs"></i>
                    <span class="font-mono text-xs">{{ item }}</span>
                    <span v-if="defaultUkuranList.includes(item)" class="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-normal">Standar</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i v-if="form.ukuran_part === item" class="fa-solid fa-check text-blue-600 dark:text-blue-400 text-xs"></i>
                    <!-- Hapus jika custom item -->
                    <button 
                      v-if="!defaultUkuranList.includes(item)" 
                      type="button"
                      @click.stop="removeCustomUkuran(item)"
                      class="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Hapus dari daftar pilihan"
                    >
                      <i class="fa-solid fa-trash-can text-[11px]"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Tambah input ke opsi jika belum ada di list -->
              <div class="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 space-y-2">
                <div v-if="canAddCurrentInput">
                  <button 
                    type="button"
                    @click.stop="addCurrentInputToOptions"
                    class="w-full py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center gap-1.5 transition text-[11px] border border-blue-200 dark:border-blue-800 cursor-pointer"
                  >
                    <i class="fa-solid fa-plus text-xs"></i>
                    <span>Tambahkan "{{ form.ukuran_part.trim() }}" ke Dropdown</span>
                  </button>
                </div>

                <!-- Input cepat tambah ukuran baru ke dropdown -->
                <div class="flex items-center gap-1.5">
                  <input 
                    v-model="newCustomUkuranInput"
                    type="text"
                    placeholder="Tambah ukuran lain (cth: 3000 x 1200)..."
                    @keydown.enter.prevent="addCustomUkuran"
                    class="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                  <button 
                    type="button"
                    @click.stop="addCustomUkuran"
                    class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition shrink-0 cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            </div>

            <!-- Tombol Quick Select (Pilihan Cepat 1-Klik) -->
            <div class="flex flex-wrap items-center gap-1.5 mt-2">
              <span class="text-[10px] text-slate-400 font-semibold">Pilihan Cepat:</span>
              <button 
                v-for="item in availableUkuranList" 
                :key="'badge-' + item"
                type="button"
                @click="selectUkuran(item)"
                class="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-medium transition cursor-pointer"
                :class="form.ukuran_part === item 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'"
              >
                {{ item }}
              </button>
            </div>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-paperclip text-blue-500"></i>
                <span>Lampiran Drawing / Gambar Kerja</span>
              </span>
              <span class="text-[10px] text-slate-400 font-normal">Opsional</span>
            </label>

            <!-- Preview Gambar / Dokumen -->
            <div v-if="fileDataUrl" class="mb-3 relative inline-block">
              <div 
                v-if="isImageFile"
                @click="openLightbox(fileDataUrl, fileName || 'Preview Gambar Kerja')"
                class="cursor-pointer group relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xs"
                title="Klik untuk membuka Lightbox"
              >
                <img 
                  :src="fileDataUrl" 
                  :alt="fileName || 'Preview Gambar Kerja'" 
                  class="max-h-56 rounded-xl object-contain bg-slate-50 dark:bg-slate-900 group-hover:opacity-90 transition"
                />
                <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white font-bold text-xs transition backdrop-blur-2xs">
                  <i class="fa-solid fa-expand"></i>
                  <span>Perbesar Lightbox</span>
                </div>
              </div>
              <div 
                v-else 
                @click="openLightbox(fileDataUrl, fileName || 'Preview Dokumen')"
                class="p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Klik untuk membuka dokumen di Lightbox"
              >
                <i class="fa-solid fa-file-pdf text-rose-500 text-3xl"></i>
                <div>
                  <p class="font-bold text-xs text-slate-800 dark:text-slate-200">{{ fileName }}</p>
                  <p class="text-[10px] text-slate-400">Dokumen PDF (Klik untuk buka Lightbox)</p>
                </div>
              </div>

              <!-- Tombol Hapus Preview -->
              <button 
                type="button" 
                @click.stop="removeFile" 
                class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center hover:bg-rose-600 cursor-pointer shadow-md transition hover:scale-110 z-10"
                title="Hapus lampiran"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Upload Dropzone Box -->
            <div 
              class="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center hover:border-blue-500 dark:hover:border-blue-500 transition cursor-pointer bg-slate-50/50 dark:bg-slate-950/40"
              @click="triggerFileUpload"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
            >
              <input 
                ref="fileInputRef" 
                type="file" 
                accept="image/*,application/pdf" 
                class="hidden" 
                @change="handleFileUpload"
              />
              <i class="fa-solid fa-cloud-arrow-up text-2xl text-slate-400 dark:text-slate-500 mb-1.5 block"></i>
              <p class="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                {{ fileDataUrl ? 'Klik untuk ganti gambar' : 'Klik atau seret gambar kerja ke sini' }}
              </p>
              <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                PNG, JPG, JPEG (Otomatis dikompres) atau PDF (Maks. 10MB)
              </p>
            </div>

            <p v-if="fileName" class="text-[11px] text-blue-600 dark:text-blue-400 mt-1.5 flex items-center gap-1 font-semibold">
              <i class="fa-solid fa-paperclip"></i>
              <span>File terpilih: {{ fileName }}</span>
            </p>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Catatan Pekerjaan</label>
            <textarea 
              v-model="form.catatan_pekerjaan" 
              rows="3" 
              placeholder="Catatan tambahan, toleransi, nesting..." 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:border-blue-600"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- D & E. Waktu Pengambilan & Tujuan Mesin CNC -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div class="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
            D. Waktu Pengambilan
          </div>
          <div class="text-xs space-y-2">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Pilihan Waktu *</label>
            <select 
              v-model="form.waktu_pengambilan" 
              required 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100"
            >
              <option value="Hari Ini">Hari Ini</option>
              <option value="Besok">Besok</option>
              <option value="Lainnya">Lainnya (Isi Manual)</option>
            </select>

            <div v-if="form.waktu_pengambilan === 'Lainnya'" class="pt-1">
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Tulis Waktu Pengambilan *</label>
              <input 
                v-model="form.waktu_custom" 
                type="text" 
                required 
                placeholder="Tuliskan waktu pengambilan manual..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:border-blue-600 outline-none"
              >
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div class="text-xs font-extrabold text-violet-700 dark:text-violet-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
            E. Tujuan Mesin CNC
          </div>
          <div class="text-xs">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Pilih Mesin CNC *</label>
            <select 
              v-model="form.target_cnc" 
              required 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100"
            >
              <option>CNC 1</option>
              <option>CNC 2</option>
              <option>CNC 3</option>
              <option>CNC 4</option>
            </select>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        :disabled="isSubmitting" 
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold p-3.5 rounded-2xl shadow-lg shadow-blue-600/20 text-sm flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <i class="fa-solid" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
        <span>{{ isSubmitting ? 'Menyimpan Order...' : 'KIRIM ORDER (NOMOR OTOMATIS)' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCncStore } from '~/composables/useCncStore'
import { useImageCompressor } from '~/composables/useImageCompressor'
import { useLightbox } from '~/composables/useLightbox'

const router = useRouter()
const { createOrder, currentUser } = useCncStore()
const { compressImage } = useImageCompressor()
const { openLightbox } = useLightbox()

const isSubmitting = ref(false)
const fileName = ref('')
const fileDataUrl = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const customDepartemen = ref('')

const isImageFile = computed(() => {
  if (!fileDataUrl.value) return false
  return fileDataUrl.value.startsWith('data:image/') || /\.(png|jpe?g|webp|gif)$/i.test(fileName.value)
})

function triggerFileUpload() {
  fileInputRef.value?.click()
}

function removeFile() {
  fileName.value = ''
  fileDataUrl.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function handleFileDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    processSelectedFile(file)
  }
}

async function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  await processSelectedFile(file)
}

async function processSelectedFile(file: File) {
  // Security validation: Allow only safe image formats or PDF, max 10MB
  const safeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf']
  if (!safeTypes.includes(file.type) && !file.type.startsWith('image/')) {
    alert('File tidak didukung. Harap upload file gambar kerja (PNG, JPG, WEBP) atau PDF.')
    if (fileInputRef.value) fileInputRef.value.value = ''
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('Ukuran file melebihi batas maksimal 10MB!')
    if (fileInputRef.value) fileInputRef.value.value = ''
    return
  }

  fileName.value = file.name
  if (file.type.startsWith('image/')) {
    try {
      fileDataUrl.value = await compressImage(file, 1200, 0.75)
    } catch {
      const reader = new FileReader()
      reader.onload = () => {
        fileDataUrl.value = reader.result as string
      }
      reader.readAsDataURL(file)
    }
  } else {
    const reader = new FileReader()
    reader.onload = () => {
      fileDataUrl.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

const departmentOptions = [
  'CNC',
  'FTS',
  'CLC',
  'LPS',
  'Gading Permata',
  'Bubut',
  'Repair',
  'Mekanik',
  'Electric',
  'HSE',
  'Interior',
  'Pipa',
  'Painting'
]

const form = reactive({
  jenis_pekerjaan_kategori: 'Pemotongan Plat Baru',
  jenis_lainnya: '',
  deskripsi_pekerjaan: '',
  nama_pemesan: currentUser.value?.name || '',
  departemen_pemesan: '',
  nik_pemesan: '',
  no_hp_pemesan: '',
  nama_proyek: '',
  nama_proyek_kapal: '',
  material: '',
  material_lainnya: '',
  ketebalan: '',
  jumlah_pesanan: 1,
  ukuran_part: '',
  waktu_pengambilan: 'Hari Ini',
  waktu_custom: '',
  deadline_pekerjaan: '',
  catatan_pekerjaan: '',
  target_cnc: 'CNC 2'
})

watch(() => form.departemen_pemesan, (val) => {
  if (val !== 'Lainnya') {
    customDepartemen.value = ''
  }
})

watch(() => form.waktu_pengambilan, (val) => {
  if (val !== 'Lainnya') {
    form.waktu_custom = ''
  }
})

// Dropdown Ukuran Part (Editable Combobox + Preset + Tambah Opsi)
const ukuranContainerRef = ref<HTMLElement | null>(null)
const isUkuranDropdownOpen = ref(false)
const defaultUkuranList = ['9000 x 2000', '6000 x 1500']
const customUkuranList = ref<string[]>([])
const newCustomUkuranInput = ref('')

const availableUkuranList = computed(() => {
  const merged = [...defaultUkuranList, ...customUkuranList.value]
  return Array.from(new Set(merged.map(s => s.trim()))).filter(Boolean)
})

const canAddCurrentInput = computed(() => {
  const val = form.ukuran_part?.trim() || ''
  return val.length > 0 && !availableUkuranList.value.includes(val)
})

function selectUkuran(val: string) {
  form.ukuran_part = val
  isUkuranDropdownOpen.value = false
}

function addCustomUkuran() {
  const val = newCustomUkuranInput.value.trim()
  if (!val) return
  if (!availableUkuranList.value.includes(val)) {
    customUkuranList.value.push(val)
    saveCustomUkuranToStorage()
  }
  form.ukuran_part = val
  newCustomUkuranInput.value = ''
  isUkuranDropdownOpen.value = false
}

function addCurrentInputToOptions() {
  const val = form.ukuran_part?.trim() || ''
  if (!val) return
  if (!availableUkuranList.value.includes(val)) {
    customUkuranList.value.push(val)
    saveCustomUkuranToStorage()
  }
}

function removeCustomUkuran(item: string) {
  customUkuranList.value = customUkuranList.value.filter(s => s !== item)
  saveCustomUkuranToStorage()
}

function loadCustomUkuran() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem('cnc_custom_ukuran_options')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          customUkuranList.value = parsed
        }
      }
    } catch (e) {
      console.warn('Gagal memuat custom ukuran dari localStorage', e)
    }
  }
}

function saveCustomUkuranToStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('cnc_custom_ukuran_options', JSON.stringify(customUkuranList.value))
    } catch (e) {
      console.warn('Gagal menyimpan custom ukuran ke localStorage', e)
    }
  }
}

function handleClickOutside(e: MouseEvent) {
  if (ukuranContainerRef.value && !ukuranContainerRef.value.contains(e.target as Node)) {
    isUkuranDropdownOpen.value = false
  }
}

onMounted(() => {
  loadCustomUkuran()
  if (typeof document !== 'undefined') {
    document.addEventListener('click', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('click', handleClickOutside)
  }
})

async function handleSubmit() {
  isSubmitting.value = true
  const finalMaterial = form.material === 'Lainnya'
    ? (form.material_lainnya?.trim() || 'Lainnya')
    : form.material

  const finalDepartemen = form.departemen_pemesan === 'Lainnya'
    ? (customDepartemen.value?.trim() || 'Lainnya')
    : form.departemen_pemesan

  const finalWaktu = form.waktu_pengambilan === 'Lainnya'
    ? (form.waktu_custom?.trim() || 'Lainnya')
    : form.waktu_pengambilan

  try {
    await createOrder({
      jenis_pekerjaan_kategori: form.jenis_pekerjaan_kategori,
      jenis_lainnya: form.jenis_lainnya,
      deskripsi_pekerjaan: form.deskripsi_pekerjaan?.trim() || form.nama_proyek?.trim() || form.jenis_pekerjaan_kategori,
      nama_pemesan: form.nama_pemesan,
      departemen_pemesan: finalDepartemen,
      nik_pemesan: form.nik_pemesan,
      no_hp_pemesan: form.no_hp_pemesan,
      nama_proyek: form.nama_proyek,
      nama_proyek_kapal: form.nama_proyek_kapal,
      material: finalMaterial,
      ketebalan: form.ketebalan,
      jumlah_pesanan: form.jumlah_pesanan,
      ukuran_part: form.ukuran_part,
      waktu_pengambilan: finalWaktu,
      waktu_custom: form.waktu_custom,
      deadline_pekerjaan: form.deadline_pekerjaan,
      catatan_pekerjaan: form.catatan_pekerjaan,
      drawing_file_name: fileName.value || undefined,
      drawing_data_url: fileDataUrl.value || undefined,
      target_cnc: form.target_cnc
    })

    router.push('/orders?created=1')
  } catch (err: any) {
    console.error('Submit order error:', err)
    alert('Terjadi kesalahan saat menyimpan order: ' + (err?.message || err || 'Silakan coba beberapa saat lagi.'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

