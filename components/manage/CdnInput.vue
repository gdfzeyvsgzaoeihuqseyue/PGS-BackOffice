<template>
  <div>
    <label v-if="label" class="block text-sm font-bold text-slate-700 mb-1">{{ label }}</label>
    <div class="flex items-center">
      <span
        class="bg-slate-200 px-3 py-2 border border-r-0 rounded-l-lg text-xs text-slate-500 whitespace-nowrap hidden sm:block truncate max-w-[120px]">
        {{ displayPrefix }}
      </span>
      <input v-model="inputValue" type="text" :placeholder="placeholder"
        class="flex-1 min-w-0 px-4 py-2 border rounded-lg sm:rounded-l-none sm:rounded-r-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
      <span class="bg-slate-200 px-3 py-2 border border-l-0 rounded-r-lg text-xs text-slate-500 font-mono">
        {{ suffix }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const PREFIX = 'https://cdn.jsdelivr.net/gh/progestionsoft/Files/_General/Images/Logos/'
const SUFFIX = '.png'

const displayPrefix = '.../Logos/'
const suffix = SUFFIX

const inputValue = computed({
  get() {
    if (!props.modelValue) return ''
    if (props.modelValue.startsWith(PREFIX) && props.modelValue.endsWith(SUFFIX)) {
      return props.modelValue.replace(PREFIX, '').replace(SUFFIX, '')
    }
    // If it doesn't match the pattern, strictly speaking we return empty or raw?
    // User logic suggested returning empty if not matching pattern, assuming we only want to edit valid logos.
    // However, to avoid dataloss for legacy/manual URLs, we could return it? 
    // But the input is designed to ADD prefix/suffix. If we return raw, saving it will append prefix/suffix again.
    // So distinct behavior: if not matching, clear it or assume it's empty.
    return ''
  },
  set(val) {
    if (!val) {
      emit('update:modelValue', '')
    } else {
      emit('update:modelValue', `${PREFIX}${val}${SUFFIX}`)
    }
  }
})
</script>
