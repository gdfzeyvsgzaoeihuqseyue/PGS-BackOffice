<template>
  <BaseModal :is-open="isOpen" :title="category ? 'Modifier Catégorie' : 'Nouvelle Catégorie'" @close="close">
    <form @submit.prevent="save" class="space-y-4">
      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Nom</label>
        <input v-model="form.name" type="text" required class="form-input" />
      </div>

      <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
        <button type="button" @click="close"
          class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
        <button type="submit"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm font-medium">Enregistrer</button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { useBlogStore } from '~/stores/blog'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  isOpen: Boolean,
  category: Object
})

const emit = defineEmits(['close', 'saved'])
const { add: notify } = useToast()
const blogStore = useBlogStore()

const form = reactive({ name: '' })

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.category) {
      form.name = props.category.name
    } else {
      form.name = ''
    }
  }
})

const slugify = (text) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

const save = async () => {
  try {
    const payload = { ...form }
    if (!props.category) payload.slug = slugify(form.name)

    if (props.category) {
      await blogStore.updateCategory(props.category.id, payload)
    } else {
      await blogStore.addCategory(payload)
    }
    notify(props.category ? 'Catégorie mise à jour' : 'Catégorie créée')
    emit('saved')
    close()
  } catch (e) {
    notify(e.message || 'Une erreur est survenue', 'error')
  }
}

const close = () => emit('close')
</script>
