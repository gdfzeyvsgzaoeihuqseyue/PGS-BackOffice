<template>
  <AppLoader v-if="loading && !wiki" />
  <AppError v-else-if="error" :message="error" />
  <div v-else>
    <div class="flex items-center justify-between mb-8 fade-in-up">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/solutions/wiki"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <IconArrowLeft size="20" />
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-500">
            <IconWorld size="24" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-800">
              {{ wiki?.name || 'Wiki' }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                {{ wiki?.slug }}
              </span>
              <span v-if="wiki?.platform" class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold">
                {{ wiki.platform.name || 'ID: ' + wiki.platform }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button @click="openModal"
        class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
        <IconPencil size="18" />
        <span>Modifier</span>
      </button>
    </div>

    <!-- View Content -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center fade-in-up max-w-2xl mx-auto">
      <h3 class="font-bold text-xl text-slate-800 mb-2">{{ wiki?.name }}</h3>
      <p class="text-slate-500 mb-6">{{ wiki?.description }}</p>

      <a v-if="wiki?.url" :href="wiki.url" target="_blank"
        class="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
        <IconExternalLink size="20" />
        Accéder à la ressource
      </a>

      <div v-if="wiki?.additionalInfo" class="mt-8 bg-slate-50 p-4 rounded-lg text-left">
        <h4 class="text-sm font-bold text-slate-700 mb-2">Informations supplémentaires</h4>
        <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ wiki.additionalInfo }}</p>
      </div>

      <div class="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Créé le</span>
          <span class="text-sm font-mono text-slate-600">{{ wiki?.createdAt ? new
            Date(wiki.createdAt).toLocaleDateString() : '-' }}</span>
        </div>
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Mis à jour le</span>
          <span class="text-sm font-mono text-slate-600">{{ wiki?.updatedAt ? new
            Date(wiki.updatedAt).toLocaleDateString() : '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManageWikiModal :is-open="isModalOpen" :wiki="wiki" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { IconArrowLeft, IconPencil, IconWorld, IconExternalLink } from '@tabler/icons-vue'
import { useWikiStore } from '~/stores/wiki'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const wikiStore = useWikiStore()

const { loading, error } = storeToRefs(wikiStore)

const id = route.params.id
const isNew = id === 'new'
const wiki = ref(null)
const isModalOpen = ref(false)

onMounted(async () => {
  if (!isNew) {
    try {
      const data = await wikiStore.fetchWiki(id)
      wiki.value = data
    } catch (e) {
      // Error handled by store
    }
  } else {
    isModalOpen.value = true
  }
})

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  if (isNew && !wiki.value) router.back()
  else isModalOpen.value = false
}

useHead({
  title: computed(() => isNew ? 'Nouveau Wiki' : `Modifier ${wiki.value?.name || 'Wiki'}`)
})

const handleSaved = async () => {
  if (isNew) {
    router.push('/me/solutions/wiki')
  } else {
    wiki.value = await wikiStore.fetchWiki(id)
    closeModal()
  }
}
</script>
