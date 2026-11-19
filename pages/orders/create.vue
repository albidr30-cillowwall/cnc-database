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
              <option>Pembuatan Part Baru</option>
              <option>Cutting Nesting / Gambar Kerja</option>
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
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Lampiran Drawing / Gambar Kerja (Opsional)</label>
            <input 
              type="file" 
              accept=".pdf,.dxf,.dwg,.jpg,.jpeg,.png,.zip,.rar" 
              @change="handleFileUpload" 
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-300"
            >
            <p v-if="fileName" class="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
              <i class="fa-solid fa-paperclip"></i> Terpilih: {{ fileName }}
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
          <div class="text-xs">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Pilihan Waktu *</label>
            <select 
              v-model="form.waktu_pengambilan" 
              required 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100"
            >
              <option>Sore Hari</option>
              <option>Besok Pagi</option>
              <option>Besok Sore</option>
              <option>Lusa</option>
              <option>Tanggal + Jam</option>
              <option>Sesuai Jadwal Lapangan</option>
            </select>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div class="text-xs font-extrabold text-violet-700 dark:text-violet-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
            E. Tujuan Mesin CNC
          </div>
          <div class="text-xs">
            <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Pilih Group CNC *</label>
            <select 
              v-model="form.target_cnc" 
              required 
              class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100"
            >
              <option>Group CNC 1</option>
              <option>Group CNC 2</option>
              <option>Group CNC 3</option>
              <option>Group CNC 4</option>
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
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCncStore } from '~/composables/useCncStore'
import { useImageCompressor } from '~/composables/useImageCompressor'

const router = useRouter()
const { createOrder, currentUser } = useCncStore()
const { compressImage } = useImageCompressor()

const isSubmitting = ref(false)
const fileName = ref('')
const fileDataUrl = ref('')
const customDepartemen = ref('')

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
  waktu_pengambilan: 'Besok Pagi',
  waktu_custom: '',
  deadline_pekerjaan: '',
  catatan_pekerjaan: '',
  target_cnc: 'Group CNC 2'
})

watch(() => form.departemen_pemesan, (val) => {
  if (val !== 'Lainnya') {
    customDepartemen.value = ''
  }
})

async function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Security validation: Allow only safe image formats or PDF, max 10MB
  const safeTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
  if (!safeTypes.includes(file.type) && !file.type.startsWith('image/')) {
    alert('File tidak didukung. Harap upload file gambar kerja (PNG, JPG, WEBP) atau PDF.')
    target.value = ''
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('Ukuran file melebihi batas maksimal 10MB!')
    target.value = ''
    return
  }

  fileName.value = file.name
  try {
    fileDataUrl.value = await compressImage(file, 1200, 0.75)
  } catch {
    const reader = new FileReader()
    reader.onload = () => {
      fileDataUrl.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function handleSubmit() {
  isSubmitting.value = true
  const finalMaterial = form.material === 'Lainnya'
    ? (form.material_lainnya?.trim() || 'Lainnya')
    : form.material

  const finalDepartemen = form.departemen_pemesan === 'Lainnya'
    ? (customDepartemen.value?.trim() || 'Lainnya')
    : form.departemen_pemesan

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
      waktu_pengambilan: form.waktu_pengambilan,
      waktu_custom: form.waktu_custom,
      deadline_pekerjaan: form.deadline_pekerjaan,
      catatan_pekerjaan: form.catatan_pekerjaan,
      drawing_file_name: fileName.value || undefined,
      drawing_data_url: fileDataUrl.value || undefined,
      target_cnc: form.target_cnc
    })

    router.push('/orders?created=1')
  } catch (err) {
    alert('Terjadi kesalahan saat menyimpan order.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

