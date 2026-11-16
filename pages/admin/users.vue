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
          Khusus Role Admin: Kelola akun pengguna, hak akses Role (Admin, Mandor, User), dan reset data operasional ke nol
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
                      @change="handleRoleChange(u.id, ($event.target as HTMLSelectElement).value as any)"
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

        <!-- Reset Database ke Nol Card -->
        <div class="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="text-xs space-y-1.5">
            <div class="font-extrabold text-rose-800 dark:text-rose-300 uppercase tracking-wide flex items-center gap-2">
              <i class="fa-solid fa-rotate-left text-rose-600 text-sm"></i>
              <span>Reset Semua Data Operasional ke Nol Bersih</span>
            </div>
            <p class="text-rose-700 dark:text-rose-400 leading-relaxed text-[11px]">
              Menghapus seluruh data <b>Order ({{ store.orders.value.length }})</b>, <b>Plat Yard & Remnant ({{ store.plates.value.length }})</b>, serta <b>Bon Pengambilan Yard ({{ store.yardPickups.value.length }})</b>. Akun pengguna <b>tetap aman</b> dipertahankan.
            </p>
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
                <option value="user">User (Hanya Order Pekerjaan & PIN)</option>
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

const newUser = reactive({
  name: '',
  username: '',
  email: '',
  role: 'user' as 'admin' | 'operator' | 'mandor' | 'user',
  department: '',
  password: '123'
})

async function handleRoleChange(userId: string, newRole: 'admin' | 'operator' | 'mandor' | 'user') {
  await store.updateUserRole(userId, newRole)
  toast.value = {
    type: 'success',
    text: `Role user berhasil diubah menjadi ${newRole.toUpperCase()}!`
  }
}

async function handleDeleteUser(user: UserProfile) {
  if (confirm(`Apakah Anda yakin ingin menghapus user ${user.name} (${user.username})?`)) {
    await store.deleteUser(user.id)
    toast.value = {
      type: 'success',
      text: `User ${user.name} berhasil dihapus.`
    }
  }
}

async function handleCreateUser() {
  await store.createUser({
    name: newUser.name,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    department: newUser.department,
    password: newUser.password
  })

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

