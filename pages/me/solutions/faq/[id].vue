<template>
  <AppLoader v-if="loading && !faq" />
  <AppError v-else-if="error" :message="error" />
  <div v-else>
    <div class="flex items-center justify-between mb-8 fade-in-up">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/solutions/faq"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <IconArrowLeft size="20" />
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-500">
            <IconHelp size="24" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-800">
              FAQ #{{ faq?.id.substring(0, 8) }}...
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold">
                {{ faq?.topic?.name || 'Sujet inconnu' }}
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
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 fade-in-up max-w-2xl mx-auto">
      <h3 class="font-bold text-xl text-slate-800 mb-4">{{ faq?.question }}</h3>

      <div class="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-6 rounded-lg mb-6">
        <!-- Assuming answer allows HTML, but simple text for now -->
        {{ faq?.answer }}
      </div>

      <div class="flex items-center justify-center gap-8 py-4 border-t border-b border-slate-100 mb-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-emerald-600">{{ faq?.isUseful }}</div>
          <div class="text-xs uppercase font-bold text-slate-400">Utile</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-red-500">{{ faq?.isUseless }}</div>
          <div class="text-xs uppercase font-bold text-slate-400">Inutile</div>
        </div>
      </div>

      <div class="inline-block px-3 py-1 rounded-full text-sm font-bold mx-auto mb-6"
        :class="faq?.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
        {{ faq?.status === 'active' ? 'Actif' : 'Inactif' }}
      </div>

      <div class="text-center">
        <button @click="resetVotes" class="text-sm text-orange-500 font-bold hover:underline">Réinitialiser les
          votes</button>
      </div>

      <div class="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Créé le</span>
          <span class="text-sm font-mono text-slate-600">{{ faq?.createdAt ? new
            Date(faq.createdAt).toLocaleDateString() : '-' }}</span>
        </div>
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Mis à jour le</span>
          <span class="text-sm font-mono text-slate-600">{{ faq?.updatedAt ? new
            Date(faq.updatedAt).toLocaleDateString() : '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManageFaqModal :is-open="isModalOpen" :faq="faq" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { IconArrowLeft, IconPencil, IconHelp } from '@tabler/icons-vue'
import { useFaqStore } from '~/stores/faq'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const faqStore = useFaqStore()

const { currentFaq: faq, loading, error } = storeToRefs(faqStore)

const id = route.params.id
const isNew = id === 'new'
// const faq = ref(null) // REMOVED
const isModalOpen = ref(false)

onMounted(async () => {
  if (!isNew) {
    await faqStore.fetchFaq(id)
  } else {
    faqStore.$patch({ currentFaq: null })
    isModalOpen.value = true
  }
})

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  if (isNew && !faq.value) router.back()
  else isModalOpen.value = false
}

const resetVotes = async () => {
  if (confirm('Voulez-vous vraiment remettre les compteurs à zéro ?')) {
    await faqStore.resetVotes(id)
    await faqStore.fetchFaq(id)
  }
}

useHead({
  title: computed(() => isNew ? 'Nouvelle FAQ' : `Modifier FAQ`)
})

const handleSaved = async () => {
  if (isNew) {
    router.push('/me/solutions/faq')
  } else {
    await faqStore.fetchFaq(id)
    closeModal()
  }
}
</script>
