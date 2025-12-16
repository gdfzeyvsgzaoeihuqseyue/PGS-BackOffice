<template>
  <div
    class="rich-text-editor border rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-500 transition-shadow">

    <!-- Toolbar: Barre d'outils contenant les boutons d'action -->
    <div v-if="editor" class="toolbar bg-slate-50 border-b p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">

      <!-- Groupe : Formatage de texte (Gras, Italique, Barré, Souligné) -->
      <div class="flex items-center gap-1">
        <!-- Gras -->
        <button type="button" @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Gras">
          <IconBold size="18" />
        </button>
        <!-- Italique -->
        <button type="button" @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Italique">
          <IconItalic size="18" />
        </button>
        <!-- Souligné -->
        <button type="button" @click="editor.chain().focus().toggleUnderline().run()"
          :class="{ 'is-active': editor.isActive('underline') }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Souligné">
          <IconUnderline size="18" />
        </button>
        <!-- Barré -->
        <button type="button" @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Barré">
          <IconStrikethrough size="18" />
        </button>
        <!-- Code (Inline) -->
        <button type="button" @click="editor.chain().focus().toggleCode().run()"
          :class="{ 'is-active': editor.isActive('code') }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Code (en ligne)">
          <IconCode size="18" />
        </button>
      </div>

      <div class="w-px h-6 bg-slate-300 mx-1 self-center"></div>

      <!-- Groupe : Couleurs (Fond bloc, Texte, Surlignage) + Taille -->
      <div class="flex items-center gap-1">
        <!-- Taille de police -->
        <div class="flex items-center mx-1 relative group" title="Taille de police">
          <IconTypography size="18" class="text-slate-600 mr-1" />
          <select @change="editor.chain().focus().setFontSize($event.target.value).run()"
            class="border border-slate-300 rounded text-xs p-1 bg-white text-slate-700 outline-none hover:border-emerald-500 focus:border-emerald-500 w-16">
            <option value="" selected>Auto</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="30px">30px</option>
          </select>
        </div>

        <div class="w-px h-4 bg-slate-300 mx-1 self-center"></div>

        <!-- Arrière-plan Bloc (Custom Div) -->
        <label class="cursor-pointer p-1.5 rounded hover:bg-slate-200 flex items-center justify-center relative group"
          title="Arrière-plan Bloc (Card)">
          <IconPalette size="18" class="text-slate-600" />
          <input type="color" @input="updateBlockBackground($event.target.value)"
            class="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0" />
          <div class="absolute bottom-0 right-0 min-w-[8px] h-2 rounded-full border border-white"
            :style="{ backgroundColor: getBlockBackgroundColor() }"></div>
        </label>

        <!-- Couleur du texte -->
        <label class="cursor-pointer p-1.5 rounded hover:bg-slate-200 flex items-center justify-center relative group"
          title="Couleur du texte">
          <IconLetterCaseLower size="18" class="text-slate-600" />
          <input type="color" @input="editor.chain().focus().setColor($event.target.value).run()"
            :value="editor.getAttributes('textStyle').color || '#000000'"
            class="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0" />
          <div class="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
            :style="{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }"></div>
        </label>

        <!-- Surlignage -->
        <label class="cursor-pointer p-1.5 rounded hover:bg-slate-200 flex items-center justify-center relative group"
          title="Surlignage (Fond)">
          <IconHighlight size="18" class="text-slate-600" />
          <input type="color" @input="editor.chain().focus().toggleHighlight({ color: $event.target.value }).run()"
            :value="editor.getAttributes('highlight').color || '#ffffff'"
            class="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0" />
          <div class="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
            :style="{ backgroundColor: editor.getAttributes('highlight').color || 'transparent' }"></div>
        </label>
      </div>

      <div class="w-px h-6 bg-slate-300 mx-1 self-center"></div>

      <!-- Groupe : Titres (H1 - H4) -->
      <div class="flex items-center gap-1">
        <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors font-black text-sm" title="Titre H1">
          <IconH1 size="18" />
        </button>
        <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors font-bold text-sm" title="Titre H2">
          <IconH2 size="18" />
        </button>
        <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors font-semibold text-sm"
          title="Titre H3">
          <IconH3 size="18" />
        </button>
      </div>

      <div class="w-px h-6 bg-slate-300 mx-1 self-center"></div>

      <!-- Groupe : Alignement -->
      <div class="flex items-center gap-1">
        <button type="button" @click="editor.chain().focus().setTextAlign('left').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Aligner à gauche">
          <IconAlignLeft size="18" />
        </button>
        <button type="button" @click="editor.chain().focus().setTextAlign('center').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Centrer">
          <IconAlignCenter size="18" />
        </button>
        <button type="button" @click="editor.chain().focus().setTextAlign('right').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Aligner à droite">
          <IconAlignRight size="18" />
        </button>
        <button type="button" @click="editor.chain().focus().setTextAlign('justify').run()"
          :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Justifier">
          <IconAlignJustified size="18" />
        </button>
      </div>

      <div class="w-px h-6 bg-slate-300 mx-1 self-center"></div>

      <!-- Groupe : Listes -->
      <button type="button" @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Liste à puces">
        <IconList size="18" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Liste numérotée">
        <IconListNumbers size="18" />
      </button>

      <div class="w-px h-6 bg-slate-300 mx-1 self-center"></div>

      <!-- Groupe : Eléments Riche (Lien, Image, Tableau, Citation, CodeBlock, HR) -->
      <div class="flex items-center gap-1">
        <!-- Lien -->
        <button type="button" @click="setLink" :class="{ 'is-active': editor.isActive('link') }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Insérer un lien">
          <IconLink size="18" />
        </button>

        <!-- Image -->
        <button type="button" @click="addImage"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Insérer une image">
          <IconPhoto size="18" />
        </button>

        <!-- Tableau -->
        <button type="button"
          @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Insérer un tableau (3x3)">
          <IconTable size="18" />
        </button>

        <!-- Citation -->
        <button type="button" @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editor.isActive('blockquote') }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Citation">
          <IconQuote size="18" />
        </button>

        <!-- Bloc de code -->
        <button type="button" @click="editor.chain().focus().toggleCodeBlock().run()"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Bloc de code">
          <IconCode size="18" />
        </button>

        <!-- Ligne de séparation -->
        <button type="button" @click="editor.chain().focus().setHorizontalRule().run()"
          class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Ligne de séparation">
          <IconSeparator size="18" />
        </button>
      </div>

      <div class="w-px h-6 bg-slate-300 mx-1 self-center"></div>

      <!-- Groupe : Historique (Annuler, Rétablir) -->
      <button type="button" @click="editor.chain().focus().undo().run()"
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors ml-auto" title="Annuler">
        <IconArrowBackUp size="18" />
      </button>
      <button type="button" @click="editor.chain().focus().redo().run()"
        class="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors" title="Rétablir">
        <IconArrowForwardUp size="18" />
      </button>

    </div>

    <!-- Zone de contenu de l'éditeur -->
    <editor-content :editor="editor" class="p-4 prose prose-emerald max-w-none min-h-[150px] outline-none" />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { Node, Extension, mergeAttributes } from '@tiptap/core'

import StarterKit from '@tiptap/starter-kit' // Kit de démarrage (Gras, Italique, Titres, Listes, CodeBlock, etc.)
import { TextStyle } from '@tiptap/extension-text-style' // Permet d'appliquer des styles de texte (pour la couleur)
import { Color } from '@tiptap/extension-color' // Extension couleur de texte
import Highlight from '@tiptap/extension-highlight' // Surlignage
import Underline from '@tiptap/extension-underline' // Soulignement
import TextAlign from '@tiptap/extension-text-align' // Alignement du texte
import Image from '@tiptap/extension-image' // Images
import Link from '@tiptap/extension-link' // Liens hypertexte

// Extensions pour les tableaux
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

// --- Imports des icônes ---
import {
  IconBold, IconItalic, IconStrikethrough, IconUnderline,
  IconList, IconListNumbers, IconArrowBackUp, IconArrowForwardUp,
  IconPalette, IconHighlight, IconLetterCaseLower,
  IconCode, IconQuote, IconSeparator, IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignJustified,
  IconLink, IconPhoto, IconTable, IconTypography,
  IconH1, IconH2, IconH3
} from '@tabler/icons-vue'

// --- Props ---
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

// --- Emits ---
const emit = defineEmits(['update:modelValue'])

/**
 * Met à jour ou applique une couleur de fond à un bloc (wrap dans une div stylisée).
 * @param {string} color - Code couleur Hex
 */
const updateBlockBackground = (color) => {
  if (!editor.value) return

  // Vérifie si la sélection est déjà dans une 'div'
  if (editor.value.isActive('div')) {
    editor.value.chain().focus().updateAttributes('div', { style: `background-color: ${color}; padding: 1rem; border-radius: 0.5rem;` }).run()
  } else {
    // Sinon, enveloppe la sélection dans une 'div'
    editor.value.chain().focus().wrapIn('div', { style: `background-color: ${color}; padding: 1rem; border-radius: 0.5rem;` }).run()
  }
}

/**
 * Récupère la couleur de fond du bloc actuel.
 * @returns {string} - Code couleur Hex ou 'transparent'
 */
const getBlockBackgroundColor = () => {
  if (!editor.value) return 'transparent'
  const attrs = editor.value.getAttributes('div')
  if (!attrs.style) return 'transparent'

  // Regex simple pour extraire la couleur de background-color
  const match = attrs.style.match(/background-color:\s*([^;]+)/)
  return match ? match[1] : 'transparent'
}

/**
 * Demande une URL et ajoute un lien sur le texte sélectionné
 */
const setLink = () => {
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  // annulé
  if (url === null) {
    return
  }

  // vidé
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  // update
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

/**
 * Demande une URL et insère une image
 */
const addImage = () => {
  const url = window.prompt('URL de l\'image')

  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}

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
  content: 'block+', // Contient d'autres blocs
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
    StarterKit, // Inclut les essentiels (p, h1-h6, listes, etc.)
    TextStyle, // Support des styles de span
    Color, // Support des couleurs de texte
    Highlight.configure({ multicolor: true }), // Surlignage multicolore
    Underline, // Soulignement
    TextAlign.configure({
      types: ['heading', 'paragraph'], // Alignement pour titres et paragraphes
    }),
    Image, // Support des images
    Link.configure({
      openOnClick: false, // Empêche l'ouverture au clic dans l'éditeur
    }),
    Table.configure({
      resizable: true, // Tableaux redimensionnables
    }),
    TableRow,
    TableHeader,
    TableCell,
    DivNode, // Notre noeud Div personnalisé
    StyleAttribute, // Notre attribut Style personnalisé
    FontSize // Extension personnalisée pour la taille de police
  ],
  editorProps: {
    attributes: {
      class: 'outline-none h-full min-h-[150px]' // Classes Tailwind pour la zone de saisie
    }
  },
  onUpdate: ({ editor }) => {
    // Emet la valeur HTML à chaque changement
    emit('update:modelValue', editor.getHTML())
  },
})

// --- Watchers ---
watch(() => props.modelValue, (newValue) => {
  // Met à jour le contenu de l'éditeur si la prop change depuis l'extérieur
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
/* Styles globaux pour l'éditeur (ProseMirror) */

/* Bouton actif dans la barre d'outils */
.rich-text-editor .is-active {
  background-color: #cbd5e1;
  /* slate-300 */
  color: #0f172a;
  /* slate-900 */
}

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
