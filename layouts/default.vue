<template>
  <div class="min-h-screen flex bg-slate-100 dark:bg-slate-950 transition-colors duration-200">
    <!-- Mobile Sidebar Backdrop -->
    <div 
      v-if="isMobileMenuOpen" 
      @click="isMobileMenuOpen = false" 
      class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden no-print"
    />

    <!-- ============================================== -->
    <!-- LEFT SIDEBAR NAVIGATION                        -->
    <!-- ============================================== -->
    <aside 
      class="fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800/80 transition-transform duration-200 ease-out no-print cnc-grid-bg"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <!-- Brand Header -->
      <div class="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/90">
        <NuxtLink :to="isFullAccess ? '/dashboard' : '/orders/create'" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition">
            <i class="fa-solid fa-anchor text-base"></i>
          </div>
          <div>
            <div class="text-sm font-extrabold tracking-wide text-white">CNC DATABASE</div>
            <div class="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{{ isConfigured ? 'Supabase Cloud' : 'Cloud / Vercel Ready' }}</span>
            </div>
          </div>
        </NuxtLink>
        <button @click="isMobileMenuOpen = false" class="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 overflow-y-auto sidebar-scroll px-3.5 py-4 space-y-5 text-[13px]">
        <!-- MENU LENGKAP ADMIN & MANDOR -->
        <template v-if="isFullAccess">
          <div>
            <div class="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Utama</div>
            <NuxtLink 
              to="/dashboard" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-gauge-high w-4 text-center" :class="$route.path === '/dashboard' ? 'text-white' : 'text-cyan-400'"></i>
                <span>Dashboard</span>
              </span>
            </NuxtLink>
          </div>

          <div class="space-y-1">
            <div class="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Order & Estimasi</div>
            <NuxtLink 
              to="/orders/create" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/orders/create' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-circle-plus w-4 text-center" :class="$route.path === '/orders/create' ? 'text-white' : 'text-emerald-400'"></i>
                <span>Buat Order Baru</span>
              </span>
            </NuxtLink>
            <NuxtLink 
              to="/orders" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/orders' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-list-check w-4 text-center" :class="$route.path === '/orders' ? 'text-white' : 'text-sky-400'"></i>
                <span>Daftar Order</span>
              </span>
              <span v-if="activeOrdersCount > 0" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-300">
                {{ activeOrdersCount }}
              </span>
            </NuxtLink>
            <NuxtLink 
              to="/estimation" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/estimation' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-calculator w-4 text-center" :class="$route.path === '/estimation' ? 'text-white' : 'text-violet-400'"></i>
                <span>Estimasi Plat</span>
              </span>
              <span v-if="waitingEstCount > 0" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                {{ waitingEstCount }}
              </span>
            </NuxtLink>
          </div>

          <div class="space-y-1">
            <div class="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Material & Produksi</div>
            <NuxtLink 
              to="/plates" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/plates' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-layer-group w-4 text-center" :class="$route.path === '/plates' ? 'text-white' : 'text-amber-400'"></i>
                <span>Stok Plat Yard</span>
              </span>
            </NuxtLink>
            <NuxtLink 
              to="/yard-pickup" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/yard-pickup' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-truck-ramp-box w-4 text-center" :class="$route.path === '/yard-pickup' ? 'text-white' : 'text-blue-400'"></i>
                <span>Ambil Plat Yard</span>
              </span>
            </NuxtLink>
            <NuxtLink 
              to="/operator" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/operator' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-fire-burner w-4 text-center" :class="$route.path === '/operator' ? 'text-white' : 'text-cyan-400'"></i>
                <span>Operator CNC</span>
              </span>
              <span v-if="operatorQueueCount > 0" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                {{ operatorQueueCount }}
              </span>
            </NuxtLink>
            <NuxtLink 
              to="/plates/remnants" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/plates/remnants' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-puzzle-piece w-4 text-center" :class="$route.path === '/plates/remnants' ? 'text-white' : 'text-orange-400'"></i>
                <span>Remnant Plat</span>
              </span>
              <span v-if="remnantsCount > 0" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
                {{ remnantsCount }}
              </span>
            </NuxtLink>
          </div>

          <div class="space-y-1">
            <div class="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Serah Terima & Arsip</div>
            <NuxtLink 
              to="/pickup-verify" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/pickup-verify' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-key w-4 text-center" :class="$route.path === '/pickup-verify' ? 'text-white' : 'text-emerald-400'"></i>
                <span>Pengambilan Barang (PIN)</span>
              </span>
              <span v-if="readyPickupCount > 0" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                {{ readyPickupCount }}
              </span>
            </NuxtLink>
            <NuxtLink 
              to="/history" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/history' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-clock-rotate-left w-4 text-center" :class="$route.path === '/history' ? 'text-white' : 'text-slate-400'"></i>
                <span>History & Lacak</span>
              </span>
            </NuxtLink>
          </div>

          <!-- ADMIN ONLY MENU -->
          <div v-if="isAdmin" class="space-y-1">
            <div class="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400/80">Administrasi</div>
            <NuxtLink 
              to="/admin/users" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/admin/users' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-users-gear w-4 text-center" :class="$route.path === '/admin/users' ? 'text-white' : 'text-indigo-400'"></i>
                <span>Kelola User & Reset</span>
              </span>
            </NuxtLink>
          </div>
        </template>

        <!-- MENU USER (3 MENU SAJA) -->
        <template v-else>
          <div class="space-y-1">
            <div class="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Menu User / Pemesan</div>
            <NuxtLink 
              to="/orders/create" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/orders/create' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-circle-plus w-4 text-center" :class="$route.path === '/orders/create' ? 'text-white' : 'text-emerald-400'"></i>
                <span>Buat Order Pekerjaan</span>
              </span>
            </NuxtLink>
            <NuxtLink 
              to="/orders" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/orders' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-list-check w-4 text-center" :class="$route.path === '/orders' ? 'text-white' : 'text-sky-400'"></i>
                <span>Order Plat</span>
              </span>
              <span v-if="activeOrdersCount > 0" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-300">
                {{ activeOrdersCount }}
              </span>
            </NuxtLink>
            <NuxtLink 
              to="/pickup-verify" 
              class="flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition"
              :class="$route.path === '/pickup-verify' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'"
              @click="isMobileMenuOpen = false"
            >
              <span class="flex items-center gap-3">
                <i class="fa-solid fa-key w-4 text-center" :class="$route.path === '/pickup-verify' ? 'text-white' : 'text-emerald-400'"></i>
                <span>Pengambilan Plat</span>
              </span>
              <span v-if="readyPickupCount > 0" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                {{ readyPickupCount }}
              </span>
            </NuxtLink>
          </div>

          <div class="mx-1 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div class="font-bold text-emerald-400 flex items-center gap-1.5">
              <i class="fa-solid fa-shield-halved"></i> Hak Akses Role User
            </div>
            <p class="leading-relaxed text-[11px]">Anda dapat membuat Order Pekerjaan, memantau status Order Plat, dan melihat PIN pengambilan barang.</p>
          </div>
        </template>
      </nav>

      <!-- Sidebar Footer: User Profile & Logout -->
      <div class="p-3.5 border-t border-slate-800/80 bg-slate-950/95 space-y-3">
        <div class="flex items-center gap-2.5 px-2 py-1.5">
          <div class="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-cyan-300 shrink-0">
            {{ userInitial }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-white truncate">{{ currentUser?.name || 'Pengguna' }}</div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border" :class="roleBadgeClass">
                {{ roleLabel }}
              </span>
              <span class="text-[10px] text-slate-400 truncate">{{ currentUser?.department || 'CNC Dept' }}</span>
            </div>
          </div>
        </div>

        <button 
          @click="handleLogout" 
          type="button" 
          class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold transition cursor-pointer"
        >
          <i class="fa-solid fa-right-from-bracket"></i> Keluar
        </button>
      </div>
    </aside>

    <!-- ============================================== -->
    <!-- MAIN CONTENT WRAPPER                           -->
    <!-- ============================================== -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- TOPBAR -->
      <header class="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 no-print transition-colors">
        <div class="flex items-center gap-3 min-w-0">
          <button @click="isMobileMenuOpen = true" class="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
            <i class="fa-solid fa-bars text-base"></i>
          </button>
          <div class="min-w-0">
            <h1 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
              {{ pageTitle }}
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
              Sistem Order, Estimasi & Pemotongan Plat CNC
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- Light / Dark Mode Toggle Button -->
          <button 
            type="button" 
            @click="toggleTheme" 
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer" 
            title="Ganti Tema Light / Dark"
          >
            <i class="fa-solid" :class="isDark ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'"></i>
            <span class="hidden sm:inline">{{ isDark ? 'Light' : 'Dark' }}</span>
          </button>

          <!-- Role Badge -->
          <span class="hidden md:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border" :class="topRoleBadgeClass">
            <i class="fa-solid" :class="isAdmin ? 'fa-user-shield' : (isMandor ? 'fa-hard-hat' : 'fa-user')"></i>
            Role: {{ roleLabel }}
          </span>

          <!-- Quick Action -->
          <NuxtLink 
            v-if="$route.path !== '/orders/create'" 
            to="/orders/create" 
            class="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm shadow-blue-600/20 transition"
          >
            <i class="fa-solid fa-plus"></i>
            <span class="hidden sm:inline">Buat Order</span>
          </NuxtLink>
        </div>
      </header>

      <!-- Access Denied Banner for User -->
      <div v-if="$route.query.denied" class="m-4 sm:m-6 lg:m-8 mb-0 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 flex items-start gap-3 shadow-xs">
        <div class="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
          <i class="fa-solid fa-ban"></i>
        </div>
        <div class="text-xs">
          <div class="font-extrabold uppercase tracking-wide text-rose-800 dark:text-rose-300">Akses Ditolak</div>
          <div class="mt-0.5 text-rose-700 dark:text-rose-400">
            Halaman tersebut hanya dapat diakses oleh Admin atau Mandor. Role User diarahkan ke menu yang diizinkan.
          </div>
        </div>
      </div>

      <!-- PAGE CONTENT -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCncStore } from '~/composables/useCncStore'
import { useTheme } from '~/composables/useTheme'

const route = useRoute()
const router = useRouter()
const { currentUser, orders, plates, logout, isConfigured } = useCncStore()
const { isDark, toggleTheme } = useTheme()

const isMobileMenuOpen = ref(false)

const isAdmin = computed(() => currentUser.value?.role === 'admin')
const isMandor = computed(() => currentUser.value?.role === 'mandor')
const isFullAccess = computed(() => isAdmin.value || isMandor.value)

const roleLabel = computed(() => {
  if (isAdmin.value) return 'Admin'
  if (isMandor.value) return 'Mandor'
  return 'User'
})

const userInitial = computed(() => {
  return (currentUser.value?.name || 'U').charAt(0).toUpperCase()
})

const roleBadgeClass = computed(() => {
  if (isAdmin.value) return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40'
  if (isMandor.value) return 'bg-amber-500/20 text-amber-300 border-amber-400/40'
  return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
})

const topRoleBadgeClass = computed(() => {
  if (isAdmin.value) return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
  if (isMandor.value) return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
})

const activeOrdersCount = computed(() => {
  return orders.value.filter(o => o.status !== 'Sudah Diambil').length
})

const waitingEstCount = computed(() => {
  return orders.value.filter(o => o.status === 'Menunggu Estimasi' || o.status === 'Menunggu Persetujuan Pemesan').length
})

const readyPickupCount = computed(() => {
  return orders.value.filter(o => o.status === 'Siap Diambil').length
})

const operatorQueueCount = computed(() => {
  return orders.value.filter(o => ['Estimasi Selesai', 'Diterima Operator', 'Plat Telah Diambil Yard', 'Sedang Dipotong'].includes(o.status)).length
})

const remnantsCount = computed(() => {
  return plates.value.filter(p => p.is_remnant && p.status === 'Sisa Potongan / Remnant').length
})

const pageTitle = computed(() => {
  const p = route.path
  if (p === '/dashboard') return 'Dashboard Monitoring CNC'
  if (p === '/orders/create') return 'Form Buat Order Pemotongan Plat CNC'
  if (p === '/orders') return 'Daftar Order Pemotongan Plat CNC'
  if (p === '/estimation') return 'Estimasi Kebutuhan Plat CNC'
  if (p === '/plates') return 'Master Data Plat & Stok Yard'
  if (p === '/plates/remnants') return 'Daftar Plat Remnant (Sisa Potongan)'
  if (p === '/yard-pickup') return 'Pengambilan Plat dari Yard (Stock Lock)'
  if (p === '/operator') return 'Workshop Operator CNC'
  if (p === '/pickup-verify') return 'Pengambilan Barang & Verifikasi PIN 6-Digit'
  if (p === '/history') return 'History & Traceability'
  if (p.startsWith('/admin')) return 'Manajemen Pengguna & Reset Database'
  return 'CNC DATABASE'
})

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

