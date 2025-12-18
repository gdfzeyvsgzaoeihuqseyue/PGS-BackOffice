<template>
  <div class="px-3" :class="{ 'mb-1': collapsed }">
    <!-- Group Header / Toggle -->
    <div
      class="flex items-center justify-between cursor-pointer text-secondary-500 hover:text-secondary-300 transition-colors py-2 group"
      :class="[collapsed ? 'justify-center' : 'px-3']">
      <div @click="handleLabelClick" class="flex-1 flex items-center gap-3">
        <component v-if="icon" :is="icon" class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed" class="text-xs font-semibold uppercase tracking-wider">{{ label }}</span>
      </div>

      <!-- Chevron (Toggle only) -->
      <div v-if="!collapsed" @click.stop="toggle"
        class="p-1 hover:bg-secondary-800 rounded transition-colors opacity-0 group-hover:opacity-100"
        :class="{ 'opacity-100': isOpen }">
        <IconChevronDown class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
      </div>
    </div>

    <!-- Content -->
    <div v-show="isOpen && !collapsed" class="space-y-1 overflow-hidden transition-all duration-300">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { IconChevronDown } from '@tabler/icons-vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  label: String,
  collapsed: Boolean,
  icon: Object,
  startOpen: Boolean,
  to: String
})

const router = useRouter()
const isOpen = ref(props.startOpen || false)

const toggle = () => {
  if (!props.collapsed) isOpen.value = !isOpen.value
}

const handleLabelClick = () => {
  if (props.to && !props.collapsed) {
    router.push(props.to)
  } else {
    toggle()
  }
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
