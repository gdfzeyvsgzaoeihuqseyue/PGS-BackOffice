<template>
  <div class="px-3" :class="{ 'mb-1': collapsed }">
    <!-- Group Header / Toggle -->
    <div @click="toggle"
      class="flex items-center justify-between cursor-pointer text-slate-500 hover:text-slate-300 transition-colors py-2"
      :class="[collapsed ? 'justify-center' : 'px-3']">
      <!-- Icon only when Sidebar is collapsed (if desired, or hidden) -->
      <component v-if="collapsed && icon" :is="icon" class="w-5 h-5" />

      <!-- Text Label + Chevron when Expanded -->
      <template v-else-if="!collapsed">
        <span class="text-xs font-semibold uppercase tracking-wider">{{ label }}</span>
        <IconChevronDown class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
      </template>
    </div>

    <!-- Content -->
    <div v-show="isOpen && !collapsed" class="space-y-1 overflow-hidden transition-all duration-300">
      <slot />
    </div>

    <!-- Flyout helper for Collapsed State if needed - For now hidden or handled by NavItem tooltip -->
  </div>
</template>

<script setup>
import { IconChevronDown } from '@tabler/icons-vue'

const props = defineProps({
  label: String,
  collapsed: Boolean,
  icon: Object // Optional icon for the group itself when collapsed
})

const isOpen = ref(true)
const toggle = () => {
  if (!props.collapsed) isOpen.value = !isOpen.value
}

// Auto open when expanding sidebar if it was previously open
watch(() => props.collapsed, (isCollapsed) => {
  if (isCollapsed) isOpen.value = false
  else isOpen.value = true
})
</script>
