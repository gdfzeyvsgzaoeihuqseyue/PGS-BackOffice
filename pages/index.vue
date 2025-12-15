<template>
  <div class="flex items-center justify-center min-h-screen bg-slate-50">
    <div class="animate-pulse flex flex-col items-center">
      <div class="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
      <div class="h-4 w-32 bg-slate-200 rounded"></div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo('/login')
    }
  ]
})
</script>
