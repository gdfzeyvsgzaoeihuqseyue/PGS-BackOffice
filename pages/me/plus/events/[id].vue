<template>
  <AppLoader v-if="loading && !event" />
  <AppError v-else-if="error" :message="error" />
  <div v-else>
    <div class="flex items-center justify-between mb-8 fade-in-up">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me/plus/events"
          class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
          <IconArrowLeft size="20" />
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-emerald-50 flex items-center justify-center text-emerald-500">
            <IconCalendarEvent size="24" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-800">
              <span v-if="event?.id">{{ event.title }}</span>
              <span v-else>Nouvel événement</span>
            </h2>
            <div class="flex items-center gap-2 mt-1" v-if="event?.type">
              <span :class="[
                'px-2 py-0.5 rounded text-xs font-bold',
                event.type === 'event' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              ]">
                {{ event.type === 'event' ? 'Événement' : 'Webinaire' }}
              </span>
              <span :class="[
                'px-2 py-0.5 rounded text-xs font-bold',
                formatClass(event.format)
              ]">
                {{ formatLabel(event.format) }}
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
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in-up">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Description -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <IconFileDescription size="20" class="text-slate-400" />
            Description
          </h3>
          <div class="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-4 rounded-lg">
            {{ event?.description }}
          </div>
        </div>

        <!-- Agenda (for events) -->
        <div v-if="event?.type === 'event' && event?.agenda?.length"
          class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <IconListCheck size="20" class="text-slate-400" />
            Agenda
          </h3>
          <div class="space-y-3">
            <div v-for="(item, index) in event.agenda" :key="index"
              class="flex gap-4 p-4 bg-slate-50 rounded-lg border-l-4 border-emerald-500">
              <div
                class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {{ index + 1 }}
              </div>
              <div>
                <div class="font-medium text-slate-800">{{ typeof item === 'string' ? item : item.title }}</div>
                <div v-if="typeof item === 'object' && item.description" class="text-sm text-slate-500 mt-1">{{
                  item.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Date & Time -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <IconCalendar size="20" class="text-slate-400" />
            Date & Heure
          </h3>
          <div class="space-y-4">
            <div class="flex items-center gap-3 text-slate-600">
              <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <IconCalendar size="20" />
              </div>
              <div>
                <div class="text-xs uppercase text-slate-400 font-bold">Date</div>
                <div class="font-medium">{{ formatDate(event?.date) }}</div>
              </div>
            </div>
            <div class="flex items-center gap-3 text-slate-600">
              <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                <IconClock size="20" />
              </div>
              <div>
                <div class="text-xs uppercase text-slate-400 font-bold">Heure</div>
                <div class="font-medium">{{ event?.time || '-' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Location & Link -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <IconMapPin size="20" class="text-slate-400" />
            Lieu & Lien
          </h3>
          <div class="space-y-4">
            <div v-if="event?.location" class="flex items-start gap-3 text-slate-600">
              <div class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                <IconMapPin size="20" />
              </div>
              <div>
                <div class="text-xs uppercase text-slate-400 font-bold">Lieu</div>
                <div class="font-medium">{{ event.location }}</div>
              </div>
            </div>
            <div v-if="event?.link" class="flex items-start gap-3 text-slate-600">
              <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                <IconLink size="20" />
              </div>
              <div>
                <div class="text-xs uppercase text-slate-400 font-bold">Lien</div>
                <a :href="event.link" target="_blank" class="font-medium text-emerald-600 hover:underline break-all">{{
                  event.link }}</a>
              </div>
            </div>
            <div v-if="!event?.location && !event?.link" class="text-slate-400 italic text-sm">
              Aucun lieu ou lien spécifié
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <IconClick size="20" class="text-slate-400" />
            Appel à l'action
          </h3>
          <a v-if="event?.ctaLink" :href="event.ctaLink" target="_blank"
            class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full justify-center">
            {{ event?.ctaText || 'S\'inscrire' }}
            <IconExternalLink size="16" />
          </a>
          <div v-else class="text-slate-400 italic text-sm">Aucun CTA défini</div>
        </div>

        <!-- Metadata -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <IconInfoCircle size="20" class="text-slate-400" />
            Informations
          </h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-400">Créé le</span>
              <span class="font-mono text-slate-600">{{ event?.createdAt ? new
                Date(event.createdAt).toLocaleDateString() : '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Modifié le</span>
              <span class="font-mono text-slate-600">{{ event?.updatedAt ? new
                Date(event.updatedAt).toLocaleDateString() : '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManageEventModal :is-open="isModalOpen" :event="event" @close="closeModal" @saved="handleSaved" />
  </div>
</template>

<script setup>
import {
  IconArrowLeft, IconPencil, IconCalendarEvent, IconFileDescription,
  IconListCheck, IconCalendar, IconClock, IconMapPin, IconLink,
  IconClick, IconExternalLink, IconInfoCircle
} from '@tabler/icons-vue'
import { useEventStore } from '~/stores/event'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()

const { currentEvent: event, loading, error } = storeToRefs(eventStore)

const id = route.params.id
const isNew = id === 'new'
const isModalOpen = ref(false)

onMounted(async () => {
  if (!isNew) {
    await eventStore.fetchEvent(id)
  } else {
    eventStore.$patch({
      currentEvent: null
    })
    isModalOpen.value = true
  }
})

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  if (isNew && !event.value) router.back()
  else isModalOpen.value = false
}

useHead({
  title: computed(() => isNew ? 'Nouvel événement' : `Modifier événement`)
})

const handleSaved = async () => {
  if (isNew) {
    router.push('/me/plus/events')
  } else {
    await eventStore.fetchEvent(id)
    closeModal()
  }
}

// Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const formatLabel = (format) => {
  const labels = {
    'online': 'En ligne',
    'présential': 'Présentiel',
    'hybride': 'Hybride'
  }
  return labels[format] || format
}

const formatClass = (format) => {
  const classes = {
    'online': 'bg-green-100 text-green-700',
    'présential': 'bg-orange-100 text-orange-700',
    'hybride': 'bg-cyan-100 text-cyan-700'
  }
  return classes[format] || 'bg-slate-100 text-slate-600'
}
</script>
