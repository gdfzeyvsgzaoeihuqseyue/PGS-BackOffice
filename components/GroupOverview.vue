<template>
  <div class="max-w-7xl mx-auto p-6 md:p-8">
    <!-- Header -->
    <div class="mb-10 animate-fade-in">
      <div class="flex items-center gap-3 text-slate-400 mb-2">
        <NuxtLink to="/me" class="hover:text-slate-600 transition-colors">Dashboard</NuxtLink>
        <span class="text-slate-300">/</span>
        <span class="text-slate-600 font-medium">{{ group.label }}</span>
      </div>
      <h1 class="text-4xl font-extrabold text-slate-800 tracking-tight">{{ group.label }}</h1>
      <p class="text-slate-500 mt-2 text-lg">Choisissez une section à administrer</p>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
      <NuxtLink v-for="item in group.items" :key="item.to" :to="item.to"
        class="group relative bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-500 overflow-hidden">
        <!-- Background decoration -->
        <div
          class="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-50 rounded-full group-hover:bg-primary-50 group-hover:scale-150 transition-all duration-700 opacity-50">
        </div>

        <div class="relative z-10 flex flex-col h-full">
          <div
            class="mb-6 inline-flex p-4 bg-slate-50 text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600 rounded-2xl transition-all duration-500 transform group-hover:rotate-6">
            <component :is="getIcon(item.icon)" class="w-8 h-8" />
          </div>

          <div class="mt-auto">
            <h3 class="text-xl font-bold text-slate-800 group-hover:text-primary-700 transition-colors mb-2">
              {{ item.label }}
            </h3>
            <p class="text-slate-500 text-sm leading-relaxed mb-4">
              Accédez à la gestion complète des {{ item.label.toLowerCase() }} et effectuez vos opérations.
            </p>

            <div
              class="flex items-center gap-2 text-primary-600 font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
              Explorer
              <IconArrowRight size="16" />
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import * as TablerIcons from '@tabler/icons-vue'
import { IconArrowRight } from '@tabler/icons-vue'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
})

const getIcon = (iconName) => {
  // Try to find the icon in the imported TablerIcons object
  return TablerIcons[iconName] || TablerIcons.IconCircle
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
