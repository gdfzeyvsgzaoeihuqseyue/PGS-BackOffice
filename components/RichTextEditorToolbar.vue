<template>
  <!-- Toolbar: Barre d'outils contenant les boutons d'action -->
  <div v-if="editor"
    class="toolbar bg-secondary-50 border-b border-secondary-200 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10 transition-shadow">

    <!-- Groupe : Formatage de texte (Gras, Italique, Barré, Souligné) -->
    <div class="flex items-center gap-1">
      <!-- Gras -->
      <button type="button" @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Gras">
        <IconBold size="18" />
      </button>
      <!-- Italique -->
      <button type="button" @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Italique">
        <IconItalic size="18" />
      </button>
      <!-- Souligné -->
      <button type="button" @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'is-active': editor.isActive('underline') }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Souligné">
        <IconUnderline size="18" />
      </button>
      <!-- Barré -->
      <button type="button" @click="editor.chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Barré">
        <IconStrikethrough size="18" />
      </button>
      <!-- Code (Inline) -->
      <button type="button" @click="editor.chain().focus().toggleCode().run()"
        :class="{ 'is-active': editor.isActive('code') }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Code (en ligne)">
        <IconCode size="18" />
      </button>
    </div>

    <div class="w-px h-6 bg-secondary-300 mx-1 self-center"></div>

    <!-- Groupe : Couleurs (Fond bloc, Texte, Surlignage) + Taille -->
    <div class="flex items-center gap-1">

      <!-- Taille de police -->
      <div class="flex items-center mx-1 relative group" title="Taille de police">
        <IconTypography size="18" class="text-secondary-600 mr-1" />
        <input list="font-sizes" type="text" placeholder="Auto" @change="setFontSize($event.target.value)"
          :value="getCurrentFontSize()"
          class="border border-secondary-300 rounded text-xs p-1 bg-white text-secondary-700 outline-none hover:border-primary-500 focus:border-primary-500 w-16 text-center" />
        <datalist id="font-sizes">
          <option value="12px"></option>
          <option value="14px"></option>
          <option value="16px"></option>
          <option value="18px"></option>
          <option value="20px"></option>
          <option value="24px"></option>
          <option value="30px"></option>
        </datalist>
      </div>

      <div class="w-px h-4 bg-secondary-300 mx-1 self-center"></div>

      <!-- Arrière-plan Bloc (Custom Div) -->
      <label class="cursor-pointer p-1.5 rounded hover:bg-secondary-200 flex items-center justify-center relative group"
        title="Arrière-plan Bloc (Card)">
        <IconPalette size="18" class="text-secondary-600" />
        <input type="color" @input="updateBlockBackground($event.target.value)"
          class="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0" />
        <div class="absolute bottom-0 right-0 min-w-[8px] h-2 rounded-full border border-white"
          :style="{ backgroundColor: getBlockBackgroundColor() }"></div>
      </label>

      <!-- Couleur du texte -->
      <label class="cursor-pointer p-1.5 rounded hover:bg-secondary-200 flex items-center justify-center relative group"
        title="Couleur du texte">
        <IconLetterCaseLower size="18" class="text-secondary-600" />
        <input type="color" @input="editor.chain().focus().setColor($event.target.value).run()"
          :value="editor.getAttributes('textStyle').color || '#000000'"
          class="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0" />
        <div class="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
          :style="{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }"></div>
      </label>

      <!-- Surlignage -->
      <label class="cursor-pointer p-1.5 rounded hover:bg-secondary-200 flex items-center justify-center relative group"
        title="Surlignage (Fond)">
        <IconHighlight size="18" class="text-secondary-600" />
        <input type="color" @input="editor.chain().focus().toggleHighlight({ color: $event.target.value }).run()"
          :value="editor.getAttributes('highlight').color || '#ffffff'"
          class="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0" />
        <div class="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
          :style="{ backgroundColor: editor.getAttributes('highlight').color || 'transparent' }"></div>
      </label>
    </div>

    <div class="w-px h-6 bg-secondary-300 mx-1 self-center"></div>

    <!-- Groupe : Titres (H1 - H4) -->
    <div class="flex items-center gap-1">
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors font-black text-sm"
        title="Titre H1">
        <IconH1 size="18" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors font-bold text-sm"
        title="Titre H2">
        <IconH2 size="18" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors font-semibold text-sm"
        title="Titre H3">
        <IconH3 size="18" />
      </button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors font-semibold text-sm"
        title="Titre H4">
        <IconH4 size="18" />
      </button>
    </div>

    <div class="w-px h-6 bg-secondary-300 mx-1 self-center"></div>

    <!-- Groupe : Alignement -->
    <div class="flex items-center gap-1">
      <button type="button" @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Aligner à gauche">
        <IconAlignLeft size="18" />
      </button>
      <button type="button" @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Centrer">
        <IconAlignCenter size="18" />
      </button>
      <button type="button" @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Aligner à droite">
        <IconAlignRight size="18" />
      </button>
      <button type="button" @click="editor.chain().focus().setTextAlign('justify').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Justifier">
        <IconAlignJustified size="18" />
      </button>
    </div>

    <div class="w-px h-6 bg-secondary-300 mx-1 self-center"></div>

    <!-- Groupe : Listes -->
    <button type="button" @click="editor.chain().focus().toggleBulletList().run()"
      :class="{ 'is-active': editor.isActive('bulletList') }"
      class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Liste à puces">
      <IconList size="18" />
    </button>
    <button type="button" @click="editor.chain().focus().toggleOrderedList().run()"
      :class="{ 'is-active': editor.isActive('orderedList') }"
      class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Liste numérotée">
      <IconListNumbers size="18" />
    </button>

    <div class="w-px h-6 bg-secondary-300 mx-1 self-center"></div>

    <!-- Groupe : Eléments Riche (Lien, Image, Tableau, Citation, CodeBlock, HR) -->
    <div class="flex items-center gap-1">
      <!-- Lien -->
      <button type="button" @click="setLink" :class="{ 'is-active': editor.isActive('link') }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Insérer un lien">
        <IconLink size="18" />
      </button>

      <!-- Image -->
      <button type="button" @click="addImage"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Insérer une image">
        <IconPhoto size="18" />
      </button>

      <!-- Tableau -->
      <button type="button" @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors"
        title="Insérer un tableau (3x3)">
        <IconTable size="18" />
      </button>

      <!-- Citation -->
      <button type="button" @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Citation">
        <IconQuote size="18" />
      </button>

      <!-- Bloc de code -->
      <button type="button" @click="editor.chain().focus().toggleCodeBlock().run()"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Bloc de code">
        <IconCode size="18" />
      </button>

      <!-- Ligne de séparation -->
      <button type="button" @click="editor.chain().focus().setHorizontalRule().run()"
        class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Ligne de séparation">
        <IconSeparator size="18" />
      </button>
    </div>

    <div class="w-px h-6 bg-secondary-300 mx-1 self-center"></div>

    <!-- Groupe : Historique (Annuler, Rétablir) -->
    <button type="button" @click="editor.chain().focus().undo().run()"
      class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors ml-auto" title="Annuler">
      <IconArrowBackUp size="18" />
    </button>
    <button type="button" @click="editor.chain().focus().redo().run()"
      class="p-1.5 rounded hover:bg-secondary-200 text-secondary-600 transition-colors" title="Rétablir">
      <IconArrowForwardUp size="18" />
    </button>

  </div>
</template>

<script setup>
import {
  IconBold, IconItalic, IconStrikethrough, IconUnderline,
  IconList, IconListNumbers, IconArrowBackUp, IconArrowForwardUp,
  IconPalette, IconHighlight, IconLetterCaseLower,
  IconCode, IconQuote, IconSeparator, IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignJustified,
  IconLink, IconPhoto, IconTable, IconTypography,
  IconH1, IconH2, IconH3,
  IconH4
} from '@tabler/icons-vue'

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
})

// --- Methods ---

/**
 * Met à jour ou applique une couleur de fond à un bloc (wrap dans une div stylisée).
 * @param {string} color - Code couleur Hex
 */
const updateBlockBackground = (color) => {
  if (!props.editor) return

  // Vérifie si la sélection est déjà dans une 'div'
  if (props.editor.isActive('div')) {
    props.editor.chain().focus().updateAttributes('div', { style: `background-color: ${color}; padding: 1rem; border-radius: 0.5rem;` }).run()
  } else {
    // Sinon, enveloppe la sélection dans une 'div'
    props.editor.chain().focus().wrapIn('div', { style: `background-color: ${color}; padding: 1rem; border-radius: 0.5rem;` }).run()
  }
}

/**
 * Récupère la couleur de fond du bloc actuel.
 * @returns {string} - Code couleur Hex ou 'transparent'
 */
const getBlockBackgroundColor = () => {
  if (!props.editor) return 'transparent'
  const attrs = props.editor.getAttributes('div')
  if (!attrs.style) return 'transparent'

  // Regex simple pour extraire la couleur de background-color
  const match = attrs.style.match(/background-color:\s*([^;]+)/)
  return match ? match[1] : 'transparent'
}

/**
 * Demande une URL et ajoute un lien sur le texte sélectionné
 */
const setLink = () => {
  const previousUrl = props.editor.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  // annulé
  if (url === null) {
    return
  }

  // vidé
  if (url === '') {
    props.editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  // update
  props.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

/**
 * Demande une URL et insère une image
 */
const addImage = () => {
  const url = window.prompt('URL de l\'image')

  if (url) {
    props.editor.chain().focus().setImage({ src: url }).run()
  }
}

/**
 * Définit la taille de font.
 * Ajoute 'px' si l'utilisateur entre juste un nombre.
 * Si vide, unset.
 */
const setFontSize = (value) => {
  if (!value) {
    props.editor.chain().focus().unsetFontSize().run()
    return
  }
  // Si l'utilisateur tape "15", on ajoute "px". S'il tape "1.5em", on garde.
  // Regex super simple: si seulement des chiffres, ajouter px
  if (/^\d+$/.test(value)) {
    value += 'px'
  }
  props.editor.chain().focus().setFontSize(value).run()
}

/**
 * Récupère la taille de font courante pour l'input
 */
const getCurrentFontSize = () => {
  return props.editor.getAttributes('textStyle').fontSize || ''
}

</script>

<style scoped>
.is-active {
  background-color: theme('colors.secondary.300');
  /* secondary-300 */
  color: theme('colors.secondary.900');
  /* secondary-900 */
}
</style>
