<template>
  <div>
    <AppLoader v-if="loading" />
    <AppError v-else-if="error" :message="error" @retry="refresh" />
    <div v-else>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in-up">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Événements</h2>
          <p class="text-slate-500 mt-1">Gérer les événements et webinaires</p>
        </div>

        <div class="flex items-center gap-4">
          <div class="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
            Total: <span class="font-bold text-slate-800">{{ pagination.total }}</span>
          </div>
          <button @click="openModal(null)"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
            <IconPlus size="20" />
            <span>Nouvel événement</span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center"
        v-if="!events.length && !eventStore.loading">
        <div class="p-12 text-slate-500">Aucun événement trouvé.</div>
      </div>

      <!-- Data List -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
              <tr>
                <th class="px-6 py-4">Titre</th>
                <th class="px-6 py-4">Type</th>
                <th class="px-6 py-4">Format</th>
                <th class="px-6 py-4">Date</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="evt in events" :key="evt.id" class="hover:bg-slate-50/50">
                <td class="px-6 py-4 font-medium text-slate-800">
                  <NuxtLink :to="`/me/plus/events/${evt.id}`" class="hover:text-emerald-600 transition-colors block">
                    {{ evt.title }}
                  </NuxtLink>
                  <div class="text-xs text-slate-500 truncate max-w-[300px] mt-1">{{ evt.description }}</div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-bold',
                    evt.type === 'event' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                  ]">
                    {{ evt.type === 'event' ? 'Événement' : 'Webinaire' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-bold',
                    formatClass(evt.format)
                  ]">
                    {{ formatLabel(evt.format) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">
                  <div class="flex items-center gap-2">
                    <IconCalendar size="16" class="text-slate-400" />
                    <span>{{ formatDate(evt.date) }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <IconClock size="14" />
                    <span>{{ evt.time }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right flex justify-end gap-2">
                  <button @click="openModal(evt)" class="p-1 text-slate-400 hover:text-blue-500">
                    <IconPencil size="18" />
                  </button>
                  <button @click="remove(evt.id)" class="p-1 text-slate-400 hover:text-red-500">
                    <IconTrash size="18" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50"
          v-if="pagination.totalPages > 1">
          <div class="text-sm text-slate-500">
            Page <span class="font-bold text-slate-800">{{ pagination.page }}</span> sur <span
              class="font-bold text-slate-800">{{ pagination.totalPages }}</span>
          </div>
          <div class="flex gap-2">
            <button @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1"
              class="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Précédent
            </button>
            <button @click="changePage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages"
              class="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Edit -->
    <ManageEventModal :is-open="isModalOpen" :event="editingEvent" @close="closeModal" @saved="refresh" />
  </div>
</template>

<script setup>
import { IconPlus, IconPencil, IconTrash, IconCalendar, IconClock } from '@tabler/icons-vue'
import { useEventStore } from '~/stores/event'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Solutions - Événements'
})

const eventStore = useEventStore()
const { events, loading, error, pagination } = storeToRefs(eventStore)

const refresh = () => {
  eventStore.fetchEvents(pagination.value.page)
}

const changePage = (page) => {
  if (page > 0 && page <= pagination.value.totalPages) {
    eventStore.fetchEvents(page)
  }
}

refresh()

const remove = async (id) => {
  if (confirm('Supprimer cet événement ?')) {
    await eventStore.deleteEvent(id)
  }
}

// Modal Logic
const isModalOpen = ref(false)
const editingEvent = ref(null)

const openModal = (evt) => {
  editingEvent.value = evt
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingEvent.value = null
}

// Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
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
    'online': 'bg-green-50 text-green-700',
    'présential': 'bg-orange-50 text-orange-700',
    'hybride': 'bg-cyan-50 text-cyan-700'
  }
  return classes[format] || 'bg-slate-100 text-slate-600'
}
</script>
