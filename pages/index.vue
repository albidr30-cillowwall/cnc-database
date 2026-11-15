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
const { currentUser, isInitialized } = useCncStore()

onMounted(() => {
  if (!currentUser.value) {
    router.replace('/login')
  } else if (currentUser.value.role === 'user') {
    router.replace('/orders/create')
  } else {
    router.replace('/dashboard')
  }
})
</script>

