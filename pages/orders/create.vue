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
          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Ukuran Part (P x L mm) (Opsional)</label>
            <input 
              v-model="form.ukuran_part" 
              type="text" 
              placeholder="Contoh: 1800 x 400 mm..." 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:border-blue-600"
            >
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
import { ref, reactive, watch, computed } from 'vue'
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

