<template>
  <div class="space-y-4">
    <!-- Success Banner -->
    <div 
      v-if="$route.query.created" 
      class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs"
    >
      <span class="flex items-center gap-2">
        <i class="fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400 text-base"></i>
        Order baru berhasil dibuat dan langsung masuk ke antrian Operator CNC!
      </span>
      <button @click="$router.replace('/orders')" class="text-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-300 font-bold text-sm cursor-pointer">&times;</button>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-wrap gap-2.5 text-xs items-center">
      <div class="relative flex-1 min-w-[220px]">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari No. Order, Proyek, Pemesan..." 
          class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:bg-white focus:border-blue-600 outline-none"
        >
      </div>

      <select 
        v-model="selectedType" 
        class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white outline-none"
      >
        <option value="">Semua Jenis Pekerjaan</option>
        <option>Pemotongan Plat Baru</option>
        <option>Pembuatan Part Baru</option>
        <option>Cutting Nesting / Gambar Kerja</option>
        <option value="Lainnya">Lainnya</option>
      </select>

      <select 
        v-model="selectedStatus" 
        class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white outline-none"
      >
        <option value="">Semua Status</option>
        <option value="Diterima">Diterima</option>
        <option value="Estimasi Selesai">Estimasi Selesai</option>
        <option value="Sedang Dipotong">Sedang Dipotong</option>
        <option value="Siap Diambil">Siap Diambil</option>
        <option value="Sudah Diambil">Sudah Diambil</option>
      </select>

      <button 
        v-if="searchQuery || selectedType || selectedStatus" 
        @click="resetFilters" 
        class="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold px-2 py-2 cursor-pointer"
      >
        Reset Filter
      </button>
    </div>

    <!-- Orders Table -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-extrabold text-left">
            <tr>
              <th class="p-3.5">No. Order</th>
              <th class="p-3.5">Pekerjaan / Jenis</th>
              <th class="p-3.5">Proyek</th>
              <th class="p-3.5">Pemesan</th>
              <th class="p-3.5">Material</th>
              <th class="p-3.5">Tebal</th>
              <th class="p-3.5">Jumlah</th>
              <th class="p-3.5">Status</th>
              <th class="p-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="o in filteredOrders" :key="o.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 align-top transition">
              <td class="p-3.5 whitespace-nowrap">
                <div class="relative inline-block pr-2">
                  <button 
                    type="button"
                    @click="openDetail(o)"
                    class="font-mono font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer text-left"
                    title="Klik untuk melihat Detail Item & Catatan"
                  >
                    {{ o.no_order }}
                  </button>

                  <!-- Overlay Icon di Pojok Kanan Atas jika terdapat catatan -->
                  <button 
                    v-if="hasNote(o)"
                    type="button"
                    @click.stop="openDetail(o)"
                    class="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-xs ring-2 ring-white dark:ring-slate-900 cursor-pointer transition hover:scale-110"
                    :title="`Terdapat Catatan: ${getNoteText(o)}`"
                  >
                    <i class="fa-solid fa-note-sticky text-[8px]"></i>
                  </button>
                </div>
                <div class="text-[10px] font-sans font-normal text-slate-400 mt-0.5">
                  {{ o.target_cnc?.replace(/^Gr(oup|up)\s*/i, '') || o.target_cnc }}
                </div>
              </td>
              <td class="p-3.5 min-w-[180px]">
                <span class="inline-block px-2.5 py-1 rounded-lg border text-[10px] font-bold" :class="getTypeBadge(o.jenis_pekerjaan_kategori)">
                  {{ o.jenis_pekerjaan }}
                </span>
                <div v-if="o.drawing_file_name" class="mt-1 text-[10px] text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1">
                  <i class="fa-solid fa-paperclip"></i>
                  <span>{{ o.drawing_file_name }}</span>
                </div>
              </td>
              <td class="p-3.5 min-w-[140px]">
                <div class="font-bold text-slate-800 dark:text-slate-200">{{ o.nama_proyek }}</div>
                <div class="text-[10px] text-slate-500">{{ o.nama_proyek_kapal }}</div>
              </td>
              <td class="p-3.5">
                <div class="font-semibold text-slate-800 dark:text-slate-200">{{ o.nama_pemesan }}</div>
                <div class="text-[10px] text-slate-400">{{ o.departemen_pemesan }}</div>
              </td>
              <td class="p-3.5 text-slate-700 dark:text-slate-300">{{ o.material }}</td>
              <td class="p-3.5 whitespace-nowrap font-mono text-slate-800 dark:text-slate-200">{{ o.ketebalan }}</td>
              <td class="p-3.5 font-mono font-bold whitespace-nowrap text-slate-900 dark:text-white">
                {{ o.jumlah_pesanan }} {{ o.satuan }}
              </td>
              <td class="p-3.5 whitespace-nowrap">
                <span class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border" :class="getStatusBadge(o.status)">
                  {{ normalizeStatus(o.status) }}
                </span>
                <div v-if="o.plat_dipakai" class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  {{ o.plat_dipakai }}
                </div>
              </td>
              <td class="p-3.5 text-center whitespace-nowrap space-y-1">
                <!-- Button Detail Item -->
                <div>
                  <button 
                    type="button"
                    @click="openDetail(o)" 
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold shadow-2xs transition cursor-pointer"
                    title="Lihat Detail Item & Catatan"
                  >
                    <i class="fa-solid fa-file-lines text-[10px]"></i>
                    <span>Detail Item</span>
                    <span 
                      v-if="hasNote(o)" 
                      class="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" 
                      title="Terdapat Catatan"
                    ></span>
                  </button>
                </div>

                <!-- Material Identification Button (Bisa diedit ketika barang selesai dikerjakan / diambil) -->
                <NuxtLink 
                  v-if="isFullAccess && (o.status === 'Siap Diambil' || o.status === 'Sudah Diambil')" 
                  :to="`/estimation?order_id=${o.id}`" 
                  class="inline-flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs transition"
                  title="Isi / Edit Material Identification"
                >
                  <i class="fa-solid fa-boxes-packing text-[10px]"></i>
                  <span>Material ID</span>
                </NuxtLink>

                <!-- Setujui Button -->
                <button 
                  v-if="isFullAccess && o.status === 'Menunggu Persetujuan Pemesan'" 
                  @click="handleApprove(o.id)" 
                  class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer"
                >
                  Setujui
                </button>

                <!-- PIN Button -->
                <NuxtLink 
                  v-if="o.status === 'Siap Diambil' && o.kode_pengambilan" 
                  :to="`/pickup-verify?order_id=${o.id}`" 
                  class="inline-block font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg font-extrabold text-[11px]"
                >
                  PIN: {{ o.kode_pengambilan }}
                </NuxtLink>

                <!-- Drawing download/preview -->
                <div v-if="o.drawing_data_url">
                  <a 
                    :href="o.drawing_data_url" 
                    :download="o.drawing_file_name || 'drawing-cnc'" 
                    class="text-blue-700 dark:text-blue-400 hover:underline text-[10px] font-semibold"
                  >
                    <i class="fa-solid fa-download mr-0.5"></i> Lihat File
                  </a>
                </div>

                <div v-if="!isFullAccess && o.status !== 'Siap Diambil' && !o.drawing_data_url" class="text-slate-400 text-[10px] italic">
                  Informasi
                </div>
              </td>
            </tr>

            <tr v-if="filteredOrders.length === 0">
              <td colspan="9" class="p-10 text-center text-slate-400 text-xs italic">
                <i class="fa-solid fa-inbox text-3xl mb-2 block text-slate-300 dark:text-slate-700"></i>
                Belum ada order pemotongan plat. Silakan buat Order Baru.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Modal Detail Item & Catatan -->
    <div 
      v-if="selectedDetailOrder" 
      class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      @click.self="closeDetail"
    >
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <span class="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <i class="fa-solid fa-file-lines text-lg"></i>
            </span>
            <div>
              <h3 class="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Detail Item & Catatan Order
              </h3>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {{ selectedDetailOrder.no_order }}
                </span>
                <span class="text-slate-300 dark:text-slate-700">•</span>
                <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <i class="fa-regular fa-clock text-[10px]"></i>
                  {{ formatOrderDate(selectedDetailOrder.created_at) }} • {{ formatOrderTime(selectedDetailOrder.created_at) }} WIB
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border" :class="getStatusBadge(selectedDetailOrder.status)">
              {{ normalizeStatus(selectedDetailOrder.status) }}
            </span>
            <button 
              type="button"
              @click="closeDetail" 
              class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xl transition leading-none cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Box Catatan Pekerjaan (Highlight Khusus) -->
        <div 
          v-if="hasNote(selectedDetailOrder)" 
          class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 shadow-xs space-y-1.5"
        >
          <div class="flex items-center gap-2 text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            <i class="fa-solid fa-note-sticky text-amber-500 text-sm"></i>
            <span>Catatan Pekerjaan / Instruksi Tambahan</span>
          </div>
          <div class="text-xs text-amber-950 dark:text-amber-100 font-semibold whitespace-pre-wrap leading-relaxed bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60">
            {{ getNoteText(selectedDetailOrder) }}
          </div>
        </div>
        <div 
          v-else 
          class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-xs italic flex items-center gap-2"
        >
          <i class="fa-regular fa-note-sticky text-slate-400"></i>
          <span>Tidak ada catatan khusus pada order ini.</span>
        </div>

        <!-- Detail Grid Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <!-- Card 1: Informasi Pekerjaan & Mesin -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <i class="fa-solid fa-gears text-blue-500"></i>
              <span>Pekerjaan & Mesin</span>
            </div>
            <div class="space-y-1.5">
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Jenis Pekerjaan</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ selectedDetailOrder.jenis_pekerjaan }}</span>
                <span class="text-[10px] text-slate-400 block">({{ selectedDetailOrder.jenis_pekerjaan_kategori }})</span>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Deskripsi Pekerjaan</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ selectedDetailOrder.deskripsi_pekerjaan }}</span>
              </div>
              <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                <div>
                  <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Tujuan Mesin CNC</span>
                  <span class="font-bold text-blue-600 dark:text-blue-400">
                    {{ selectedDetailOrder.target_cnc?.replace(/^Gr(oup|up)\s*/i, '') || selectedDetailOrder.target_cnc }}
                  </span>
                </div>
                <div>
                  <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Waktu Pengambilan</span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">
                    {{ selectedDetailOrder.waktu_pengambilan_diinginkan || '-' }}
                  </span>
                </div>
              </div>
              <div v-if="selectedDetailOrder.deadline_pekerjaan">
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Deadline Pekerjaan</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ selectedDetailOrder.deadline_pekerjaan }}</span>
              </div>
              <div class="pt-1 border-t border-slate-200 dark:border-slate-700/60">
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Waktu Masuk Order</span>
                <span class="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mt-0.5">
                  <i class="fa-regular fa-calendar-days text-xs"></i>
                  <span>{{ formatOrderDate(selectedDetailOrder.created_at) }}</span>
                  <span class="text-slate-400 font-normal">pukul</span>
                  <span class="font-mono">{{ formatOrderTime(selectedDetailOrder.created_at) }} WIB</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Card 2: Pemesan & Proyek -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <i class="fa-solid fa-user-tag text-indigo-500"></i>
              <span>Pemesan & Proyek</span>
            </div>
            <div class="space-y-1.5">
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Nama Pemesan & Departemen</span>
                <div class="font-bold text-slate-900 dark:text-white">{{ selectedDetailOrder.nama_pemesan }}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{{ selectedDetailOrder.departemen_pemesan }}</div>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Kontak WhatsApp / HP</span>
                <span class="font-mono font-semibold text-slate-800 dark:text-slate-200">{{ selectedDetailOrder.no_hp_pemesan || '-' }}</span>
              </div>
              <div class="pt-1 border-t border-slate-200 dark:border-slate-700/60">
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Proyek & Kapal / Blok</span>
                <div class="font-bold text-slate-900 dark:text-white">{{ selectedDetailOrder.nama_proyek }}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400">{{ selectedDetailOrder.nama_proyek_kapal || '-' }}</div>
              </div>
            </div>
          </div>

          <!-- Card 3: Spesifikasi Material & Part -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <i class="fa-solid fa-layer-group text-amber-500"></i>
              <span>Spesifikasi Material & Part</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Material</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ selectedDetailOrder.material }}</span>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Ketebalan Plat</span>
                <span class="font-mono font-bold text-slate-900 dark:text-white">{{ selectedDetailOrder.ketebalan }}</span>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Jumlah Pesanan</span>
                <span class="font-mono font-bold text-blue-600 dark:text-blue-400">{{ selectedDetailOrder.jumlah_pesanan }} {{ selectedDetailOrder.satuan }}</span>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Dimensi Part</span>
                <span class="font-mono text-slate-800 dark:text-slate-200">{{ selectedDetailOrder.ukuran_part || '-' }}</span>
              </div>
            </div>
            <div v-if="selectedDetailOrder.plat_dipakai" class="pt-1 border-t border-slate-200 dark:border-slate-700/60">
              <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Plat Terpakai (Yard)</span>
              <span class="font-mono font-bold text-cyan-600 dark:text-cyan-400">{{ selectedDetailOrder.plat_dipakai }}</span>
            </div>
          </div>

          <!-- Card 4: Lampiran Gambar & Serah Terima -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <i class="fa-solid fa-paperclip text-emerald-500"></i>
              <span>Lampiran & Serah Terima</span>
            </div>
            <div class="space-y-1.5">
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">File Drawing Nesting</span>
                <div v-if="selectedDetailOrder.drawing_data_url" class="mt-1">
                  <a 
                    :href="selectedDetailOrder.drawing_data_url" 
                    :download="selectedDetailOrder.drawing_file_name || 'drawing-cnc'" 
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <i class="fa-solid fa-download"></i>
                    <span>Unduh: {{ selectedDetailOrder.drawing_file_name || 'Drawing' }}</span>
                  </a>
                </div>
                <div v-else class="text-slate-400 italic text-[11px]">
                  Tidak ada lampiran file.
                </div>
              </div>

              <div class="pt-1 border-t border-slate-200 dark:border-slate-700/60">
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">PIN Pengambilan</span>
                <div v-if="selectedDetailOrder.kode_pengambilan" class="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {{ selectedDetailOrder.kode_pengambilan }}
                </div>
                <div v-else class="text-slate-400 italic text-[11px]">
                  PIN dibuat otomatis saat pemotongan selesai.
                </div>
              </div>

              <div v-if="selectedDetailOrder.pengambil_akhir">
                <span class="text-slate-500 dark:text-slate-400 block text-[10px]">Pengambil Akhir</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ selectedDetailOrder.pengambil_akhir }}</span>
                <span v-if="selectedDetailOrder.waktu_diambil" class="text-[10px] text-slate-400 block">
                  {{ new Date(selectedDetailOrder.waktu_diambil).toLocaleString('id-ID') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button 
            type="button"
            @click="closeDetail" 
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            Tutup
          </button>

          <div class="flex items-center gap-2">
            <NuxtLink 
              v-if="isFullAccess && (selectedDetailOrder.status === 'Siap Diambil' || selectedDetailOrder.status === 'Sudah Diambil')" 
              :to="`/estimation?order_id=${selectedDetailOrder.id}`" 
              class="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition"
            >
              <i class="fa-solid fa-boxes-packing text-xs"></i>
              <span>Material Identification</span>
            </NuxtLink>

            <NuxtLink 
              v-if="selectedDetailOrder.status === 'Siap Diambil' && selectedDetailOrder.kode_pengambilan" 
              :to="`/pickup-verify?order_id=${selectedDetailOrder.id}`" 
              class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-xs transition"
            >
              <i class="fa-solid fa-key text-xs"></i>
              <span>Verifikasi Pengambilan</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCncStore, type Order } from '~/composables/useCncStore'

const { orders, approveEstimation, currentUser } = useCncStore()

const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const selectedDetailOrder = ref<Order | null>(null)

function hasNote(o: Order): boolean {
  const note1 = o.catatan_pekerjaan && o.catatan_pekerjaan.trim().length > 0
  const note2 = o.estimation?.catatan && o.estimation.catatan.trim().length > 0
  return Boolean(note1 || note2)
}

function getNoteText(o: Order): string {
  if (o.catatan_pekerjaan && o.catatan_pekerjaan.trim()) return o.catatan_pekerjaan.trim()
  if (o.estimation?.catatan && o.estimation.catatan.trim()) return o.estimation.catatan.trim()
  return ''
}

function openDetail(o: Order) {
  selectedDetailOrder.value = o
}

function closeDetail() {
  selectedDetailOrder.value = null
}

const isFullAccess = computed(() => {
  return currentUser.value?.role === 'admin' || currentUser.value?.role === 'operator' || currentUser.value?.role === 'mandor'
})

const filteredOrders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return orders.value.filter(o => {
    const matchSearch = !query || 
      o.no_order.toLowerCase().includes(query) ||
      o.nama_proyek.toLowerCase().includes(query) ||
      o.nama_pemesan.toLowerCase().includes(query) ||
      o.deskripsi_pekerjaan.toLowerCase().includes(query)

    const matchType = !selectedType.value || o.jenis_pekerjaan_kategori === selectedType.value
    
    let matchStatus = true
    if (selectedStatus.value) {
      if (selectedStatus.value === 'Diterima') {
        matchStatus = ['Diterima', 'Diterima Operator', 'Plat Telah Diambil Yard'].includes(o.status)
      } else {
        matchStatus = o.status === selectedStatus.value
      }
    }

    return matchSearch && matchType && matchStatus
  })
})

function normalizeStatus(st: string): string {
  if (['Diterima Operator', 'Plat Telah Diambil Yard'].includes(st)) return 'Diterima'
  if (st === 'Menunggu Persetujuan Pemesan') return 'Estimasi Selesai'
  return st
}

function getStatusBadge(st: string): string {
  const norm = normalizeStatus(st)
  if (norm === 'Menunggu Estimasi') return 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  if (norm === 'Estimasi Selesai') return 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  if (norm === 'Diterima') return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
  if (norm === 'Sedang Dipotong') return 'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800'
  if (norm === 'Siap Diambil') return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
}

function getTypeBadge(cat: string): string {
  const map: Record<string, string> = {
    'Pemotongan Plat Baru': 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Pemotongan Plat Remnant / Sisa': 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'Repair / Perbaikan': 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'Pembuatan Part Baru': 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    'Cutting Nesting / Gambar Kerja': 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
  }
  return map[cat] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
}

function resetFilters() {
  searchQuery.value = ''
  selectedType.value = ''
  selectedStatus.value = ''
}

async function handleApprove(orderId: number) {
  await approveEstimation(orderId)
}

function formatOrderDate(dateStr?: string): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return '-'
  }
}

function formatOrderTime(dateStr?: string): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch {
    return '-'
  }
}
</script>

