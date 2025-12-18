<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
    <div class="w-20 h-20 bg-danger-50 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
      <IconAlertTriangle class="w-10 h-10 text-danger-500" />
    </div>

    <h3 class="text-xl font-bold text-secondary-900 mb-2">Une erreur est survenue</h3>
    <p class="text-secondary-500 mb-8">
      {{ "Impossible de charger les données." }}</p>

    <div class="flex gap-4">
      <button v-if="retry" @click="$emit('retry')"
        class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-200 hover:shadow-primary-300 active:scale-95 flex items-center gap-2">
        <IconRefresh class="w-5 h-5" />
        Réessayer
      </button>
      <button @click="$router.back()"
        class="px-6 py-2.5 bg-white border border-secondary-200 text-secondary-700 font-medium rounded-xl hover:bg-secondary-50 transition-all active:scale-95">
        Retour
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-vue'

defineProps<{
  message?: string
  retry?: boolean
}>()

defineEmits(['retry'])
</script>

<style scoped>
.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }

  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>
