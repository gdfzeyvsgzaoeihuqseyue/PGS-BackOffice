<template>
  <AppLoader v-if="loading && !topic" />
  <AppError v-else-if="error" :message="error" />
  <div v-else>
    <div class="flex items-center justify-between mb-8 fade-in-up">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/solutions/topic"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <IconArrowLeft size="20" />
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-500">
            <IconBookmarkQuestion size="24" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-800">
              {{ topic?.name || 'Sujet FAQ' }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="topic?.platform" class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold">
                {{ topic.platform.name || 'ID: ' + topic.platform }}
              </span>
              <span class="text-xs font-mono text-slate-400">{{ topic?.slug }}</span>
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
      <h3 class="font-bold text-xl text-slate-800 mb-2">{{ topic?.name }}</h3>
      <p class="text-slate-500 mb-6">{{ topic?.description }}</p>

      <div class="inline-block px-3 py-1 rounded-full text-sm font-bold"
        :class="topic?.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
        {{ topic?.status === 'active' ? 'Actif' : 'Inactif' }}
      </div>

      <div class="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Créé le</span>
          <span class="text-sm font-mono text-slate-600">{{ topic?.createdAt ? new
            Date(topic.createdAt).toLocaleDateString() : '-' }}</span>
        </div>
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Mis à jour le</span>
          <span class="text-sm font-mono text-slate-600">{{ topic?.updatedAt ? new
            Date(topic.updatedAt).toLocaleDateString() : '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManageTopicModal :is-open="isModalOpen" :topic="topic" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { IconArrowLeft, IconPencil, IconBookmarkQuestion } from '@tabler/icons-vue'
import { useFaqTopicStore } from '~/stores/faq-topic'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const topicStore = useFaqTopicStore()

const { loading, error } = storeToRefs(topicStore)

// The file is named [slug].vue, so the param is 'slug'.
// However, typically we use ID to fetch one.
// If the user navigates here with an ID or Slug, we try to fetch it.
const identifier = route.params.slug
const isNew = identifier === 'new'
const topic = ref(null)
const isModalOpen = ref(false)

onMounted(async () => {
  if (!isNew) {
    try {
      const data = await topicStore.fetchTopic(identifier)
      topic.value = data
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
  if (isNew && !topic.value) router.back()
  else isModalOpen.value = false
}

useHead({
  title: computed(() => isNew ? 'Nouveau Sujet' : `Modifier ${topic.value?.name || 'Sujet'}`)
})

const handleSaved = async () => {
  if (isNew) {
    router.push('/me/solutions/topic')
  } else {
    topic.value = await topicStore.fetchTopic(identifier)
    closeModal()
  }
}
</script>
