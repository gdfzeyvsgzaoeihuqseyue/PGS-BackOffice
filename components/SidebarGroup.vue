<template>
  <div class="px-3" :class="{ 'mb-1': collapsed }">
    <!-- Group Header / Toggle -->
    <div @click="toggle"
      class="flex items-center justify-between cursor-pointer text-secondary-500 hover:text-secondary-300 transition-colors py-2"
      :class="[collapsed ? 'justify-center' : 'px-3']">
      <component v-if="collapsed && icon" :is="icon" class="w-5 h-5 flex-shrink-0" />

      <!-- Text Label + Chevron -->
      <template v-else-if="!collapsed">
        <div class="flex items-center gap-3">
          <component v-if="icon" :is="icon" class="w-5 h-5 flex-shrink-0" />
          <span class="text-xs font-semibold uppercase tracking-wider">{{ label }}</span>
        </div>
        <IconChevronDown class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
      </template>
    </div>

    <!-- Content -->
    <div v-show="isOpen && !collapsed" class="space-y-1 overflow-hidden transition-all duration-300">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { IconChevronDown } from '@tabler/icons-vue'

const props = defineProps({
  label: String,
  collapsed: Boolean,
  icon: Object,
  startOpen: Boolean
})

const isOpen = ref(props.startOpen || false)

const toggle = () => {
  if (!props.collapsed) isOpen.value = !isOpen.value
}

// Auto open when expanding sidebar if it was previously open
watch(() => props.collapsed, (isCollapsed) => {
  if (isCollapsed) isOpen.value = false
  // else isOpen.value = true
})

// Allow parent to control open state
watch(() => props.startOpen, (val) => {
  isOpen.value = val
})
</script>
