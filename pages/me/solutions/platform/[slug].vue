<template>
  <AppLoader v-if="loading && !platform" />
  <AppError v-else-if="error" :message="error" />
  <div v-else>
    <!-- Header / View Mode -->
    <div class="flex items-center justify-between mb-8 fade-in-up">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/solutions/platform"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <IconArrowLeft size="20" />
        </NuxtLink>
        <div class="flex items-center gap-4">
          <img v-if="platform?.logo" :src="platform.logo"
            class="w-12 h-12 rounded-lg object-contain bg-slate-50 border border-slate-200" />
          <div>
            <h2 class="text-2xl font-bold text-slate-800">
              {{ platform?.name || 'Plateforme' }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="platform?.category"
                class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold">{{ platform.category }}</span>
              <span class="text-xs text-slate-400 font-mono">{{ platform?.slug }}</span>
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

    <!-- Content View -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in-up delay-100">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 pb-2 border-b">Description & Contenu</h3>
          <div class="prose max-w-none mb-6">
            <p class="text-slate-600 italic">{{ platform?.description }}</p>
          </div>
          <div v-if="platform?.content" class="prose max-w-none pt-4 border-t" v-html="platform.content"></div>
          <div v-else class="text-slate-400 text-center py-8 italic">Aucun contenu détaillé.</div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 pb-2 border-b">Fonctionnalités</h3>
          <div v-if="parsedFeatures.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="(feat, idx) in parsedFeatures" :key="idx"
              class="flex items-start gap-2 p-3 rounded bg-slate-50 text-sm text-slate-700">
              <IconCheck size="16" class="text-emerald-500 mt-0.5 shrink-0" />
              <span>{{ feat }}</span>
            </div>
          </div>
          <div v-else class="text-slate-400 text-center py-4 italic">Aucune fonctionnalité listée.</div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 pb-2 border-b">Visuels</h3>
          <div class="space-y-4">
            <div v-if="platform?.logo">
              <span class="block text-xs font-bold text-slate-400 uppercase mb-1">Logo Mobile</span>
              <img :src="platform.logo"
                class="h-12 w-auto object-contain p-2 bg-slate-50 rounded border border-slate-100" />
            </div>
            <div v-if="platform?.logoDesk">
              <span class="block text-xs font-bold text-slate-400 uppercase mb-1">Logo Bureau</span>
              <img :src="platform.logoDesk"
                class="h-12 w-auto object-contain p-2 bg-slate-50 rounded border border-slate-100" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 pb-2 border-b">Détails</h3>
          <div class="space-y-4">
            <div>
              <span class="block text-xs font-bold text-slate-400 uppercase">Statut</span>
              <span class="inline-flex mt-1 items-center px-2 py-1 rounded text-xs font-bold"
                :class="platform?.disabled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'">
                {{ platform?.disabled ? 'Désactivé' : 'Actif' }}
              </span>
            </div>
            <div>
              <span class="block text-xs font-bold text-slate-400 uppercase">Authentification</span>
              <div v-if="platform?.allowAuth" class="mt-1">
                <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <IconLock size="16" class="text-emerald-500" />
                  <span>Autorisé ({{ platform.authType }})</span>
                </div>
              </div>
              <div v-else class="mt-1 text-sm text-slate-500">Non autorisé</div>
            </div>
            <div v-if="platform?.ctaText">
              <span class="block text-xs font-bold text-slate-400 uppercase">Call to Action</span>
              <a :href="platform.ctaLink" target="_blank"
                class="mt-2 block w-full text-center py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded text-sm font-bold text-slate-700 transition-colors truncate">
                {{ platform.ctaText }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Generic Modal for Edit -->
    <ManagePlatformModal :is-open="isModalOpen" :platform="platform" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { IconArrowLeft, IconTrash, IconPlus, IconPencil, IconCheck, IconLock } from '@tabler/icons-vue'
import { usePlatformStore } from '~/stores/platform'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const platformStore = usePlatformStore()
// Use storeToRefs for reactivity on the platform object
const { currentPlatform: platform, loading, error } = storeToRefs(platformStore)

const slug = route.params.slug
const isNew = slug === 'new'
const isModalOpen = ref(false)

onMounted(async () => {
  if (!isNew) {
    await platformStore.fetchPlatform(slug)
  } else {
    // If new, ensure currentPlatform is null in store or just don't fetch
    // ideally the store action clears it, but strictly we can rely on it being null if we didn't fetch
    // However, if we visited another platform before, currentPlatform might be set!
    // We should probably reset it.
    platformStore.$patch({ currentPlatform: null })
    isModalOpen.value = true
  }
})

useHead({
  title: computed(() => isNew ? 'Nouvelle Plateforme' : `Modifier ${platform.value?.name || 'Plateforme'}`)
})

// Parsed features for View Mode
const parsedFeatures = computed(() => {
  if (!platform.value?.features) return []
  if (Array.isArray(platform.value.features)) return platform.value.features
  try {
    const p = JSON.parse(platform.value.features)
    return Array.isArray(p) ? p : []
  } catch (e) { return [] }
})

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  if (isNew && !platform.value) router.back()
  else isModalOpen.value = false
}

const handleSaved = async () => {
  if (isNew) {
    router.push('/me/solutions/platform')
  } else {
    await platformStore.fetchPlatform(platform.value?.slug || slug)
    closeModal()
  }
}
</script>
