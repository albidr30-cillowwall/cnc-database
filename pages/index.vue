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
import { useSecurity } from '~/composables/useSecurity'

const router = useRouter()
const { currentUser } = useCncStore()
const { verifySessionToken } = useSecurity()
const sessionToken = useCookie<string | null>('cnc_session_token')

onMounted(async () => {
  let active = currentUser.value
  if (!active && sessionToken.value) {
    active = await verifySessionToken(sessionToken.value)
  }

  if (!active) {
    router.replace('/login')
  } else if (active.role === 'user') {
    router.replace('/orders')
  } else {
    router.replace('/dashboard')
  }
})
</script>
