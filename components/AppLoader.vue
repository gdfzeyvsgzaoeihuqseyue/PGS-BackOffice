<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center p-8">
    <div class="relative w-20 h-20 mb-6">
      <div class="absolute top-0 left-0 w-full h-full border-4 border-primary-100 rounded-full animate-pulse"></div>
      <div
        class="absolute top-0 left-0 w-full h-full border-4 border-primary-500 rounded-full animate-spin border-t-transparent">
      </div>
      <div class="absolute inset-0 flex items-center justify-center">
        <IconLoader2 class="w-8 h-8 text-primary-600 animate-pulse" />
      </div>
    </div>
    <div class="text-center space-y-2 fade-in">
      <h3 class="text-lg font-semibold text-secondary-800">Chargement en cours</h3>
      <p class="text-secondary-500 text-sm">Veuillez patienter quelques instants...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconLoader2 } from '@tabler/icons-vue'
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
