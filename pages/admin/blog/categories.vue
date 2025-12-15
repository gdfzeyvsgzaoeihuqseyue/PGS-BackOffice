<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Catégories</h2>
        <p class="text-slate-500 mt-1">Gérer les catégories du blog</p>
      </div>
      <button
        class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
        <IconPlus size="20" />
        <span>Nouvelle Catégorie</span>
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
      <IconCategory size="48" class="mx-auto text-slate-300 mb-4" />
      <p>Fonctionnalité en cours de développement.</p>
    </div>
  </div>
</template>

<script setup>
import { IconCategory, IconPlus } from '@tabler/icons-vue'

definePageMeta({
  layout: 'admin',
  title: 'Blog - Catégories'
})
</script>

<style scoped>
.fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
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
