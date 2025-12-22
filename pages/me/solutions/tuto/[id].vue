<template>
  <AppLoader v-if="loading && !tuto" />
  <AppError v-else-if="error" :message="error" />
  <div v-else>
    <div class="flex items-center justify-between mb-8 fade-in-up">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/solutions/tuto"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <IconArrowLeft size="20" />
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-500">
            <IconVideo size="24" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-800">
              {{ tuto?.title || 'Tutoriel' }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="tuto?.platform" class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold">
                {{ tuto.platform.name || 'ID: ' + tuto.platform }}
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
      <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
        <IconVideo size="40" />
      </div>

      <h3 class="font-bold text-xl text-slate-800 mb-2">{{ tuto?.title }}</h3>
      <p class="text-slate-500 mb-6">{{ tuto?.description }}</p>

      <div class="flex flex-col items-center gap-4">
        <div v-if="tuto?.time" class="flex items-center gap-2 text-slate-600 font-medium">
          <IconClock size="20" />
          {{ tuto.time }}
        </div>

        <a v-if="tuto?.link" :href="tuto.link" target="_blank"
          class="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
          <IconExternalLink size="20" />
          Accéder au tutoriel
        </a>
      </div>

      <div class="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Créé le</span>
          <span class="text-sm font-mono text-slate-600">{{ tuto?.createdAt ? new
            Date(tuto.createdAt).toLocaleDateString() : '-' }}</span>
        </div>
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Mis à jour le</span>
          <span class="text-sm font-mono text-slate-600">{{ tuto?.updatedAt ? new
            Date(tuto.updatedAt).toLocaleDateString() : '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManageTutoModal :is-open="isModalOpen" :tuto="tuto" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { IconArrowLeft, IconPencil, IconVideo, IconExternalLink, IconClock } from '@tabler/icons-vue'
import { useTutoStore } from '~/stores/tuto'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const tutoStore = useTutoStore()

const { currentTuto: tuto, loading, error } = storeToRefs(tutoStore)

const id = route.params.id // Using 'id' param as per user request
const isNew = id === 'new'
// const tuto = ref(null) // REMOVED
const isModalOpen = ref(false)

onMounted(async () => {
  if (!isNew) {
    await tutoStore.fetchTuto(id)
  } else {
    tutoStore.$patch({ currentTuto: null })
    isModalOpen.value = true
  }
})

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  if (isNew && !tuto.value) router.back()
  else isModalOpen.value = false
}

useHead({
  title: computed(() => isNew ? 'Nouveau Tutoriel' : `Modifier ${tuto.value?.title || 'Tutoriel'}`)
})

const handleSaved = async () => {
  if (isNew) {
    router.push('/me/solutions/tuto')
  } else {
    await tutoStore.fetchTuto(id)
    closeModal()
  }
}
</script>
