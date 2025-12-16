<template>
  <div
    class="rich-text-editor border rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-500 transition-shadow">

    <RichTextEditorToolbar :editor="editor" />

    <!-- Zone de contenu de l'éditeur -->
    <editor-content :editor="editor" class="p-4 prose prose-emerald max-w-none min-h-[150px] outline-none" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { Node, Extension, mergeAttributes } from '@tiptap/core'

import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import RichTextEditorToolbar from './RichTextEditorToolbar.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

// --- Emits ---
const emit = defineEmits(['update:modelValue'])


// --- Extensions Personnalisées ---

/**
 * FontSize Extension
 * Permet de définir la taille de la police via un style inline ou un attribut.
 */
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})

/**
 * DivNode: Noeud personnalisé pour supporter les conteneurs DIV génériques
 * Permet de styliser des blocs de contenu.
 */
const DivNode = Node.create({
  name: 'div',
  group: 'block',
  content: 'block+',
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {}
          return { style: attributes.style }
        },
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0]
  },
})

/**
 * StyleAttribute: Extension pour permettre l'attribut 'style' sur les titres et paragraphes.
 * Utile pour préserver certains styles inline lors du copier-coller ou de l'édition.
 */
const StyleAttribute = Extension.create({
  name: 'styleAttribute',
  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph'],
        attributes: {
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes.style) return {}
              return { style: attributes.style }
            },
          },
        },
      },
    ]
  },
})

// --- Initialisation de l'Editeur ---
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Image,
    Link.configure({
      openOnClick: false,
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    DivNode,
    StyleAttribute,
    FontSize
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

// --- Watchers ---
watch(() => props.modelValue, (newValue) => {
  const isSame = editor.value?.getHTML() === newValue
  if (!isSame && editor.value) {
    editor.value.commands.setContent(newValue, false)
  }
})

// --- Lifecycle ---
onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy()
})
</script>

<style>
/* Styles pour les titres */
.ProseMirror h1 {
  font-size: 2em;
  font-weight: 800;
  margin-top: 0.8em;
  margin-bottom: 0.4em;
  line-height: 1.2;
}

.ProseMirror h2 {
  font-size: 1.5em;
  font-weight: 700;
  margin-top: 0.8em;
  margin-bottom: 0.4em;
  line-height: 1.3;
}

.ProseMirror h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 0.6em;
  margin-bottom: 0.4em;
  line-height: 1.4;
}

.ProseMirror h4 {
  font-size: 1em;
  font-weight: 600;
  margin-top: 0.6em;
  margin-bottom: 0.4em;
  line-height: 1.5;
}

/* Styles pour les listes */
.ProseMirror ul {
  list-style-type: disc;
  padding-left: 1.5em;
  margin: 1em 0;
}

.ProseMirror ol {
  list-style-type: decimal;
  padding-left: 1.5em;
  margin: 1em 0;
}

.ProseMirror li {
  margin-bottom: 0.25em;
}

/* Styles pour les liens */
.ProseMirror a {
  color: #059669;
  /* emerald-600 */
  text-decoration: underline;
  cursor: pointer;
}

.ProseMirror a:hover {
  color: #047857;
  /* emerald-700 */
}

/* Styles pour les citations (blockquotes) */
.ProseMirror blockquote {
  border-left: 4px solid #cbd5e1;
  /* slate-300 */
  padding-left: 1em;
  margin: 1em 0;
  font-style: italic;
  color: #475569;
  /* slate-600 */
  background: #f8fafc;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  padding-right: 0.5em;
}

/* Styles pour les blocs de code */
.ProseMirror pre {
  background: #1e293b;
  color: #f8fafc;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  margin: 1rem 0;
}

.ProseMirror code {
  color: inherit;
  padding: 0;
  background: none;
  font-size: 0.8rem;
}

/* Styles des tableaux dans l'éditeur */
.ProseMirror table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 0;
  overflow: hidden;
}

.ProseMirror td,
.ProseMirror th {
  min-width: 1em;
  border: 1px solid #ced4da;
  padding: 3px 5px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
}

.ProseMirror th {
  font-weight: bold;
  text-align: left;
  background-color: #f1f3f5;
}

.ProseMirror .selectedCell:after {
  z-index: 2;
  position: absolute;
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(200, 200, 255, 0.4);
  pointer-events: none;
}

.ProseMirror .column-resize-handle {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: -2px;
  width: 4px;
  background-color: #adf;
  pointer-events: none;
}
</style>
