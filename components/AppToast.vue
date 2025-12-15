<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id" 
        class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium min-w-[300px]"
        :class="{
          'bg-white text-emerald-700 border-emerald-100': toast.type === 'success',
          'bg-white text-red-700 border-red-100': toast.type === 'error',
          'bg-white text-blue-700 border-blue-100': toast.type === 'info'
        }"
      >
        <span v-if="toast.type === 'success'" class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span v-else-if="toast.type === 'error'" class="w-2 h-2 rounded-full bg-red-500"></span>
        <span v-else class="w-2 h-2 rounded-full bg-blue-500"></span>
        
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
const { toasts } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
