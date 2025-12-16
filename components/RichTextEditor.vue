<template>
  <div class="rich-text-editor border rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-500 transition-shadow">
    <div v-if="editor" class="toolbar bg-slate-50 border-b p-2 flex flex-wrap gap-1">
      <button 
        type="button"
        @click="editor.chain().focus().toggleBold().run()" 
        :class="{ 'is-active': editor.isActive('bold') }"
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
        title="Gras"
      >
        <IconBold size="18" />
      </button>
      <button 
        type="button"
        @click="editor.chain().focus().toggleItalic().run()" 
        :class="{ 'is-active': editor.isActive('italic') }"
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
        title="Italique"
      >
        <IconItalic size="18" />
      </button>
      <button 
        type="button"
        @click="editor.chain().focus().toggleStrike().run()" 
        :class="{ 'is-active': editor.isActive('strike') }"
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
        title="Barré"
      >
        <IconStrikethrough size="18" />
      </button>
      
      <div class="w-px h-6 bg-slate-300 mx-1 self-center"></div>

      <button 
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" 
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors font-bold"
        title="Titre H2"
      >
        H2
      </button>
      <button 
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" 
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors font-semibold"
        title="Titre H3"
      >
        H3
      </button>
      
      <div class="w-px h-6 bg-slate-300 mx-1 self-center"></div>

      <button 
        type="button"
        @click="editor.chain().focus().toggleBulletList().run()" 
        :class="{ 'is-active': editor.isActive('bulletList') }"
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
        title="Liste à puces"
      >
        <IconList size="18" />
      </button>
      <button 
        type="button"
        @click="editor.chain().focus().toggleOrderedList().run()" 
        :class="{ 'is-active': editor.isActive('orderedList') }"
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
        title="Liste numérotée"
      >
        <IconListNumbers size="18" />
      </button>

      <div class="w-px h-6 bg-slate-300 mx-1 self-center"></div>
      
       <button 
        type="button"
        @click="editor.chain().focus().undo().run()" 
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors ml-auto"
        title="Annuler"
      >
        <IconArrowBackUp size="18" />
      </button>
       <button 
        type="button"
        @click="editor.chain().focus().redo().run()" 
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
        title="Rétablir"
      >
        <IconArrowForwardUp size="18" />
      </button>

    </div>
    <editor-content :editor="editor" class="p-4 prose prose-emerald max-w-none min-h-[150px] outline-none" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { IconBold, IconItalic, IconStrikethrough, IconList, IconListNumbers, IconArrowBackUp, IconArrowForwardUp } from '@tabler/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
  ],
  editorProps: {
      attributes: {
          class: 'outline-none h-full min-h-[150px]'
      }
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (newValue) => {
  // Only update content if it's different to avoid cursor jumping
  const isSame = editor.value?.getHTML() === newValue
  if (!isSame && editor.value) {
    editor.value.commands.setContent(newValue, false)
  }
})

onBeforeUnmount(() => {
    if(editor.value) editor.value.destroy()
})
</script>

<style scoped>
.is-active {
  background-color: #cbd5e1; /* slate-300 */
  color: #0f172a; /* slate-900 */
}
</style>
