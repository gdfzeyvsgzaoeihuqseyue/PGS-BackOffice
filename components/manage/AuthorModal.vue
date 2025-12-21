<template>
  <BaseModal :is-open="isOpen" :title="author ? 'Modifier Auteur' : 'Nouvel Auteur'" @close="close">
    <form @submit.prevent="save" class="space-y-4">
      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Nom</label>
        <input v-model="form.name" type="text" required class="form-input" />
      </div>

      <!-- Slug removed -->

      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Avatar URL</label>
        <input v-model="form.avatar" type="url" class="form-input" placeholder="https://..." />
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Rôle</label>
        <input v-model="form.role" type="text" class="form-input" placeholder="Rédacteur" />
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-700 mb-1">Biographie</label>
        <textarea v-model="form.bio" rows="3" class="form-input"></textarea>
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
  author: Object
})

const emit = defineEmits(['close', 'saved'])
const { add: notify } = useToast()
const blogStore = useBlogStore()

const form = reactive({ name: '', avatar: '', role: 'Rédacteur', bio: '' })

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.author) {
      form.name = props.author.name
      form.avatar = props.author.avatar || ''
      form.role = props.author.role || 'Rédacteur'
      form.bio = props.author.bio || ''
    } else {
      form.name = ''
      form.avatar = ''
      form.role = 'Rédacteur'
      form.bio = ''
    }
  }
})

const slugify = (text) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

const save = async () => {
  try {
    const payload = { ...form }
    if (!props.author) payload.slug = slugify(form.name)

    if (props.author) {
      await blogStore.updateAuthor(props.author.id, payload)
    } else {
      await blogStore.addAuthor(payload)
    }
    notify(props.author ? 'Auteur mis à jour' : 'Auteur créé')
    emit('saved')
    close()
  } catch (e) {
    notify(e.message || 'Une erreur est survenue', 'error')
  }
}

const close = () => emit('close')
</script>
