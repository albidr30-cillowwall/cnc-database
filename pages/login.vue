<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 cnc-grid-bg flex items-center justify-center p-4 transition-colors">
    <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
      <!-- Top Brand Header -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white px-7 py-6 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 text-lg shrink-0">
            <i class="fa-solid fa-anchor"></i>
          </div>
          <div>
            <h1 class="text-lg font-extrabold tracking-wide">CNC DATABASE</h1>
            <p class="text-[11px] text-cyan-300 font-semibold">Sistem Order, Estimasi & Pemotongan Plat CNC</p>
          </div>
        </div>
        <button 
          type="button" 
          @click="toggleTheme" 
          class="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs transition shrink-0 cursor-pointer" 
          title="Ganti Tema Light / Dark"
        >
          <i class="fa-solid" :class="isDark ? 'fa-sun text-amber-400' : 'fa-moon text-slate-200'"></i>
        </button>
      </div>

      <!-- Login Form -->
      <div class="p-7">
        <div class="mb-5">
          <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Masuk ke Akun Anda</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Gunakan email atau username beserta password yang terdaftar.</p>
        </div>

        <div v-if="errorMessage" class="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <i class="fa-solid fa-circle-exclamation shrink-0"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="identity" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email atau Username</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                <i class="fa-solid fa-user"></i>
              </span>
              <input
                id="identity"
                v-model="identity"
                type="text"
                required
                autofocus
                autocomplete="username"
                placeholder="Masukkan email atau username"
                class="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none"
              >
            </div>
          </div>

          <div>
            <label for="password" class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                <i class="fa-solid fa-lock"></i>
              </span>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Masukkan password..."
                class="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs p-1 cursor-pointer"
                title="Lihat / Sembunyikan Password"
              >
                <i class="fa-solid" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isLoading" 
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <i class="fa-solid" :class="isLoading ? 'fa-spinner fa-spin' : 'fa-right-to-bracket'"></i>
            <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem' }}</span>
          </button>
        </form>

        <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
          <div class="font-bold text-slate-700 dark:text-slate-300">Akun Mandor & Admin (Password: <code class="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-bold">123</code>):</div>
          <div>&bull; <code class="font-mono text-slate-800 dark:text-slate-200">mandor@gmail.com</code> (mandor) &rarr; Akses Operasional</div>
          <div>&bull; <code class="font-mono text-slate-800 dark:text-slate-200">admin@gmail.com</code> (admin) &rarr; Akses Penuh & Kelola User</div>
        </div>


      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCncStore } from '~/composables/useCncStore'
import { useTheme } from '~/composables/useTheme'

definePageMeta({
  layout: false
})

const router = useRouter()
const { login, currentUser } = useCncStore()
const { isDark, toggleTheme } = useTheme()

onMounted(() => {
  if (currentUser.value) {
    router.replace(currentUser.value.role === 'user' ? '/orders' : '/dashboard')
  }
})

const identity = ref('user@gmail.com')
const password = ref('123')
const showPassword = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true

  const res = login(identity.value, password.value)
  isLoading.value = false

  if (!res.success) {
    errorMessage.value = res.message || 'Login gagal.'
    return
  }

  if (currentUser.value?.role === 'user') {
    router.push('/orders/create')
  } else {
    router.push('/dashboard')
  }
}
</script>

