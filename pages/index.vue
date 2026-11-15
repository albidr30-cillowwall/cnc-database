<template>
  <div class="p-8 text-center text-slate-400">
    <i class="fa-solid fa-spinner fa-spin text-2xl"></i>
    <p class="mt-2 text-xs">Memuat aplikasi...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCncStore } from '~/composables/useCncStore'

const router = useRouter()
const { currentUser } = useCncStore()
const userCookie = useCookie<any>('cnc_session_user')

onMounted(() => {
  const active = currentUser.value || userCookie.value
  if (!active) {
    router.replace('/login')
  } else if (active.role === 'user') {
    router.replace('/orders')
  } else {
    router.replace('/dashboard')
  }
})
</script>
