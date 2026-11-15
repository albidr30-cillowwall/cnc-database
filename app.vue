<template>
  <div class="min-h-screen flex flex-col font-sans transition-colors duration-200">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '~/composables/useTheme'
import { useCncStore } from '~/composables/useCncStore'

const { initTheme } = useTheme()
const { initStore } = useCncStore()

onMounted(async () => {
  initTheme()
  await initStore()
})
</script>

