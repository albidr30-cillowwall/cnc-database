<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-users-gear text-indigo-500"></i>
          <span>Manajemen Pengguna & Reset Database</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        </p>
      </div>

      <NuxtLink 
        to="/dashboard" 
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
      >
        <i class="fa-solid fa-gauge-high text-blue-500"></i>
        <span>Kembali ke Dashboard</span>
      </NuxtLink>
    </div>

    <!-- Feedback Notification -->
    <div 
      v-if="toast" 
      class="p-4 rounded-2xl flex items-center justify-between gap-3 transition"
      :class="toast.type === 'success' 
        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
        : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'"
    >
      <div class="flex items-center gap-2.5 text-xs font-semibold">
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-emerald-500' : 'fa-solid fa-triangle-exclamation text-rose-500'"></i>
        <span>{{ toast.text }}</span>
      </div>
      <button @click="toast = null" class="text-xs opacity-70 hover:opacity-100">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Main Grid: Users List (Col 8) + Add User (Col 4) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: User Table & Reset Card -->
      <div class="lg:col-span-8 space-y-6">
        <!-- User Table Card -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <i class="fa-solid fa-address-book text-indigo-500"></i>
              <span>Daftar Akun Pengguna Terdaftar</span>
            </h2>
            <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">Total: {{ store.users.value.length }} akun</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead class="bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-extrabold text-left">
                <tr>
                  <th class="p-3.5">Nama & Departemen</th>
                  <th class="p-3.5">Username / Email</th>
                  <th class="p-3.5">Role</th>
                  <th class="p-3.5 text-center">Status / Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr 
                  v-for="u in store.users.value" 
                  :key="u.id"
                  class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                >
                  <td class="p-3.5">
                    <div class="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{{ u.name }}</span>
                      <span v-if="u.id === store.currentUser.value?.id" class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        Anda
                      </span>
                    </div>
                    <div class="text-[10px] text-slate-400 dark:text-slate-500">{{ u.department || '-' }}</div>
                  </td>

                  <td class="p-3.5 font-mono">
                    <div class="font-bold text-blue-600 dark:text-blue-400">{{ u.username }}</div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ u.email }}</div>
                  </td>

                  <td class="p-3.5">
                    <select 
                      :value="u.role" 
                      @change="handleRoleChange(u.id, $event)"
                      :disabled="u.id === store.currentUser.value?.id"
                      class="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                    >
                      <option value="admin">Admin (Full + Reset)</option>
                      <option value="operator">Operator (Full Operasional CNC)</option>
                      <option value="mandor">Mandor (Full Operasional)</option>
                      <option value="user">User (Order & PIN Only)</option>
                    </select>
                  </td>

                  <td class="p-3.5 text-center">
                    <button 
                      v-if="u.id !== store.currentUser.value?.id"
                      @click="handleDeleteUser(u)"
                      class="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-bold text-[11px] p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Hapus Pengguna"
                    >
                      <i class="fa-solid fa-trash mr-1"></i>
                      <span>Hapus</span>
                    </button>
                    <span v-else class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <i class="fa-solid fa-circle-check mr-1"></i> Aktif Sesi
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Supabase Cloud Connection & Diagnostics Card -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <i class="fa-solid fa-cloud"></i>
              </div>
              <div>
                <h3 class="text-xs font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                  Status Database Supabase PostgreSQL
                </h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  Sinkronisasi cloud untuk memastikan data tidak hilang saat refresh
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span 
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border"
                :class="store.isConfigured ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'"
              >
                <span class="w-2 h-2 rounded-full" :class="store.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'"></span>
                <span>{{ store.isConfigured ? 'Supabase Terhubung' : 'Belum Dikonfigurasi (Mode Lokal)' }}</span>
              </span>
            </div>
          </div>

          <!-- Diagnostic Check Button & Alert -->
          <div class="flex flex-wrap items-center gap-2.5">
            <button 
              type="button"
              @click="handleTestConnection" 
              :disabled="isTestingConnection"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              <i class="fa-solid fa-plug" :class="{ 'fa-spin': isTestingConnection }"></i>
              <span>{{ isTestingConnection ? 'Menguji Koneksi...' : 'Uji Koneksi Database' }}</span>
            </button>

            <button 
              type="button"
              @click="handleManualSync" 
              :disabled="store.isSyncing.value"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              <i class="fa-solid fa-arrows-rotate" :class="{ 'fa-spin': store.isSyncing.value }"></i>
              <span>{{ store.isSyncing.value ? 'Menyinkronkan...' : 'Sinkronkan Ulang dari Cloud' }}</span>
            </button>

            <button 
              type="button"
              @click="showCredModal = !showCredModal"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline"
            >
              <i class="fa-solid fa-gear"></i>
              <span>{{ showCredModal ? 'Sembunyikan Form Kredensial' : 'Atur Supabase URL & Key Manual' }}</span>
            </button>
          </div>

          <div v-if="connectionResult" class="p-3 rounded-xl text-xs font-medium border" :class="connectionResult.ok ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'">
            <div class="flex items-center gap-2">
              <i :class="connectionResult.ok ? 'fa-solid fa-circle-check text-emerald-500' : 'fa-solid fa-circle-xmark text-rose-500'"></i>
              <span>{{ connectionResult.message }}</span>
            </div>
          </div>

          <!-- Manual Credentials Form -->
          <div v-if="showCredModal" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div class="text-[11px] text-slate-500 dark:text-slate-400">
              Jika environment variable Vercel belum aktif, Anda dapat memasukkan URL dan Anon Public Key Supabase secara langsung di sini. Kredensial akan disimpan aman di browser Anda.
            </div>
            <div class="space-y-2">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Supabase URL</label>
                <input 
                  v-model="customUrl" 
                  type="text" 
                  placeholder="https://xyzcompany.supabase.co" 
                  class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Supabase Anon Public Key</label>
                <input 
                  v-model="customKey" 
                  type="password" 
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..." 
                  class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="flex items-center gap-2 pt-1">
              <button 
                type="button"
                @click="saveCustomCreds" 
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Simpan & Hubungkan Database
              </button>
              <button 
                type="button"
                @click="clearCustomCreds" 
                class="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Hapus Kredensial Manual
              </button>
            </div>
          </div>
        </div>

        <!-- Reset Database ke Nol Card -->
        <div class="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="text-xs">
            <div class="font-extrabold text-rose-800 dark:text-rose-300 uppercase tracking-wide flex items-center gap-2">
              <i class="fa-solid fa-rotate-left text-rose-600 text-sm"></i>
              <span>Reset Semua Data Operasional ke Nol Bersih</span>
            </div>
          </div>

          <button 
            @click="handleResetDatabase" 
            class="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-lg shadow-rose-600/25 transition shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>Reset Nol Database</span>
          </button>
        </div>
      </div>

      <!-- Right Column: Tambah User Baru -->
      <div class="lg:col-span-4">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 class="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-user-plus"></i>
            <span>Tambah Pengguna Baru</span>
          </h2>

          <form @submit.prevent="handleCreateUser" class="space-y-3.5 text-xs">
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Nama Lengkap *</label>
              <input 
                v-model="newUser.name" 
                type="text" 
                required 
                placeholder="nama lengkap..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Username *</label>
              <input 
                v-model="newUser.username" 
                type="text" 
                required 
                placeholder="username login..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email (@gmail.com) *</label>
              <input 
                v-model="newUser.email" 
                type="email" 
                required 
                placeholder="email@gmail.com..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Hak Akses Role *</label>
              <select 
                v-model="newUser.role" 
                required 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              >
                <option value="user">User (Hanya Order Baru & PIN)</option>
                <option value="operator">Operator (Full Menu Operasional CNC)</option>
                <option value="mandor">Mandor (Full Menu Operasional)</option>
                <option value="admin">Admin (Full Akses + Manajemen User)</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Departemen / Divisi</label>
              <select 
                v-model="newUser.department" 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
              >
                <option value="">-- Pilih Departemen --</option>
                <option value="CNC">CNC</option>
                <option value="FTS">FTS</option>
                <option value="CLC">CLC</option>
                <option value="LPS">LPS</option>
                <option value="Gading Permata">Gading Permata</option>
                <option value="Bubut">Bubut</option>
                <option value="Repair">Repair</option>
                <option value="Mekanik">Mekanik</option>
                <option value="Electric">Electric</option>
                <option value="HSE">HSE</option>
                <option value="Interior">Interior</option>
                <option value="Pipa">Pipa</option>
                <option value="Painting">Painting</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-bold mb-1">Password Awal *</label>
              <input 
                v-model="newUser.password" 
                type="text" 
                required 
                placeholder="default: 123..." 
                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button 
              type="submit" 
              class="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold p-3.5 rounded-xl shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <i class="fa-solid fa-user-plus"></i>
              <span>Simpan Akun Pengguna</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useCncStore, type UserProfile } from '~/composables/useCncStore'

const store = useCncStore()
const toast = ref<{ text: string; type: 'success' | 'error' } | null>(null)

// Supabase diagnostics & custom creds
const isTestingConnection = ref(false)
const connectionResult = ref<{ ok: boolean; message: string } | null>(null)
const showCredModal = ref(false)
const customUrl = ref(store.supabaseUrl || '')
const customKey = ref(store.supabaseKey || '')

async function handleTestConnection() {
  isTestingConnection.value = true
  connectionResult.value = null
  try {
    const res = await store.checkConnection()
    connectionResult.value = res
  } catch (e: any) {
    connectionResult.value = { ok: false, message: e.message || 'Gagal menguji koneksi.' }
  } finally {
    isTestingConnection.value = false
  }
}

async function handleManualSync() {
  try {
    await store.syncFromSupabase()
    toast.value = {
      type: 'success',
      text: 'Berhasil menyinkronkan data terbaru dari database cloud!'
    }
  } catch (e: any) {
    toast.value = {
      type: 'error',
      text: e.message || 'Gagal sinkronisasi data.'
    }
  }
}

function saveCustomCreds() {
  if (!customUrl.value.trim() || !customKey.value.trim()) {
    alert('URL dan Anon Public Key Supabase wajib diisi.')
    return
  }
  store.setCustomCredentials(customUrl.value, customKey.value)
  toast.value = {
    type: 'success',
    text: 'Kredensial Supabase berhasil disimpan! Menghubungkan ulang...'
  }
  handleTestConnection()
  store.syncFromSupabase()
}

function clearCustomCreds() {
  if (confirm('Hapus kredensial Supabase yang tersimpan di browser ini?')) {
    store.clearCustomCredentials()
    customUrl.value = ''
    customKey.value = ''
    connectionResult.value = null
    toast.value = {
      type: 'success',
      text: 'Kredensial manual telah dihapus.'
    }
  }
}

const newUser = reactive({
  name: '',
  username: '',
  email: '',
  role: 'user' as 'admin' | 'operator' | 'mandor' | 'user',
  department: '',
  password: '123'
})

async function handleRoleChange(userId: string, event: Event) {
  const target = event.target as HTMLSelectElement
  const newRole = target.value as 'admin' | 'operator' | 'mandor' | 'user'
  const res = await store.updateUserRole(userId, newRole)
  if (res && !res.success) {
    toast.value = {
      type: 'error',
      text: res.message || 'Gagal mengubah role user.'
    }
    return
  }
  toast.value = {
    type: 'success',
    text: `Role user berhasil diubah menjadi ${newRole.toUpperCase()}!`
  }
}

async function handleDeleteUser(user: UserProfile) {
  if (confirm(`Apakah Anda yakin ingin menghapus user ${user.name} (${user.username})?`)) {
    const res = await store.deleteUser(user.id)
    if (res && !res.success) {
      toast.value = {
        type: 'error',
        text: res.message || 'Gagal menghapus user.'
      }
      return
    }
    toast.value = {
      type: 'success',
      text: `User ${user.name} berhasil dihapus.`
    }
  }
}

async function handleCreateUser() {
  const res = await store.createUser({
    name: newUser.name,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    department: newUser.department,
    password: newUser.password
  })

  if (!res.success) {
    toast.value = {
      type: 'error',
      text: res.message || 'Gagal mendaftarkan pengguna baru.'
    }
    return
  }

  toast.value = {
    type: 'success',
    text: `Pengguna baru ${newUser.name} (${newUser.email}) berhasil didaftarkan!`
  }

  // Reset form
  newUser.name = ''
  newUser.username = ''
  newUser.email = ''
  newUser.department = ''
  newUser.password = '123'
}

async function handleResetDatabase() {
  const confirm1 = confirm('PERINGATAN KRUSIAL: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA Order, Plat Yard, dan History Pemotongan?')
  if (!confirm1) return

  const confirm2 = confirm('KONFIRMASI TERAKHIR: Data yang dihapus tidak dapat dipulihkan. Lanjutkan reset ke nol?')
  if (!confirm2) return

  await store.resetDataToZero()
  toast.value = {
    type: 'success',
    text: 'DATABASE TELAH DIRESET KE KONDISI NOL BERSIH. Semua order dan stok plat telah dikosongkan.'
  }
}

onMounted(() => {
  store.initStore()
})
</script>

