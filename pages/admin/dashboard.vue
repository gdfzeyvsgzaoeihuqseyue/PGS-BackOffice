<template>
  <div>
    <h1 class="text-3xl font-bold text-slate-800 mb-2">Tableau de bord</h1>
    <p class="text-slate-500 mb-8">Vue d'ensemble de l'activité.</p>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
       <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-4">
             <div class="text-slate-500 text-xs font-bold uppercase tracking-wider">Utilisateurs Actifs</div>
             <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <IconUsers size="20" />
             </div>
          </div>
          <div class="text-3xl font-bold text-slate-800">--</div>
          <div class="mt-2 text-sm text-slate-400">Total inscrits</div>
       </div>

       <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
          <div class="flex items-center justify-between mb-4">
             <div class="text-slate-500 text-xs font-bold uppercase tracking-wider">Apprenants</div>
             <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
                <IconSchool size="20" />
             </div>
          </div>
          <div class="text-3xl font-bold text-slate-800">--</div>
          <div class="mt-2 text-sm text-slate-400">Total actifs</div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { IconUsers, IconSchool } from '@tabler/icons-vue'

definePageMeta({
  layout: 'admin',
  title: 'Dashboard'
})
</script>
