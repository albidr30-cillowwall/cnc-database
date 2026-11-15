import { ref, computed, onMounted } from 'vue'

const themeMode = ref<'light' | 'dark' | 'system'>('system')

export function useTheme() {
  const isDark = computed(() => {
    if (themeMode.value === 'dark') return true
    if (themeMode.value === 'light') return false
    if (import.meta.client) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  function applyTheme() {
    if (!import.meta.client) return
    const root = document.documentElement
    if (isDark.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    window.dispatchEvent(new CustomEvent('cnc:theme-changed', { detail: { dark: isDark.value } }))
  }

  function setTheme(mode: 'light' | 'dark' | 'system') {
    themeMode.value = mode
    if (import.meta.client) {
      localStorage.setItem('cnc_theme', mode)
    }
    applyTheme()
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  function initTheme() {
    if (!import.meta.client) return
    const saved = localStorage.getItem('cnc_theme') as 'light' | 'dark' | 'system' | null
    if (saved) {
      themeMode.value = saved
    } else {
      themeMode.value = 'system'
    }
    applyTheme()
  }

  return {
    themeMode,
    isDark,
    setTheme,
    toggleTheme,
    initTheme
  }
}

