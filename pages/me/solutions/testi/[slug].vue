<template>
  <AppLoader v-if="loading && !testimony" />
  <AppError v-else-if="error" :message="error" />
  <div v-else>
    <div class="flex items-center justify-between mb-8 fade-in-up">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/solutions/testi"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <IconArrowLeft size="20" />
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-500">
            <IconMessageQuote size="24" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-800">
              {{ testimony?.author || 'Témoignage' }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="testimony?.platform"
                class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold">
                {{ testimony.platform.name || 'ID: ' + testimony.platform }}
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
      <div class="relative w-24 h-24 mx-auto mb-6">
        <img v-if="testimony?.avatar" :src="testimony.avatar"
          class="w-full h-full rounded-full object-cover border-4 border-slate-50 shadow" />
        <div v-else
          class="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-4xl text-slate-300 font-bold shadow-inner">
          {{ testimony?.author?.charAt(0) }}
        </div>
        <div v-if="testimony?.isFeatured"
          class="absolute -right-2 -bottom-2 bg-orange-500 text-white p-2 rounded-full shadow border-2 border-white">
          <IconStarFilled size="16" />
        </div>
      </div>

      <div class="flex justify-center text-yellow-400 mb-4">
        <IconStarFilled size="20" v-for="n in 5" :key="n"
          :class="n <= (testimony?.note || 0) ? 'text-yellow-400' : 'text-slate-200'" />
      </div>

      <blockquote class="text-xl italic text-slate-700 leading-relaxed mb-6">
        "{{ testimony?.content }}"
      </blockquote>

      <div class="text-slate-900 font-bold mb-1">{{ testimony?.author }}</div>
      <div class="text-slate-500">{{ testimony?.role }} <span v-if="testimony?.company">chez {{ testimony.company
          }}</span></div>

      <div class="mt-6 flex justify-center">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
          :class="testimony?.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
          <span class="w-1.5 h-1.5 rounded-full"
            :class="testimony?.isPublished ? 'bg-emerald-500' : 'bg-slate-400'"></span>
          {{ testimony?.isPublished ? 'Publié' : 'Brouillon' }}
        </span>
      </div>

      <div class="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Créé le</span>
          <span class="text-sm font-mono text-slate-600">{{ testimony?.createdAt ? new
            Date(testimony.createdAt).toLocaleDateString() : '-' }}</span>
        </div>
        <div>
          <span class="block text-xs uppercase text-slate-400 font-bold mb-1">Mis à jour le</span>
          <span class="text-sm font-mono text-slate-600">{{ testimony?.updatedAt ? new
            Date(testimony.updatedAt).toLocaleDateString() : '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManageTestimonyModal :is-open="isModalOpen" :testimony="testimony" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { IconArrowLeft, IconPencil, IconMessageQuote, IconStarFilled, IconStar } from '@tabler/icons-vue'
import { useTestimonyStore } from '~/stores/testimony'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const testimonyStore = useTestimonyStore()

const { loading, error } = storeToRefs(testimonyStore)

const id = route.params.slug // ID or 'new'
const isNew = id === 'new'
const testimony = ref(null)
const isModalOpen = ref(false)

onMounted(async () => {
  if (!isNew) {
    try {
      const data = await testimonyStore.fetchTestimony(id)
      testimony.value = data
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
  if (isNew && !testimony.value) router.back()
  else isModalOpen.value = false
}

useHead({
  title: computed(() => isNew ? 'Nouveau Témoignage' : `Modifier ${testimony.value?.author || 'Témoignage'}`)
})

const handleSaved = async () => {
  if (isNew) {
    router.push('/me/solutions/testi')
  } else {
    testimony.value = await testimonyStore.fetchTestimony(id)
    closeModal()
  }
}
</script>
