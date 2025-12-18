<template>
  <AppLoader v-if="loading" />
  <AppError v-else-if="error" :message="error" @retry="activityStore.fetchSystemLog(route.params.id)" />
  <div v-else-if="log" class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <NuxtLink to="/me/activity/syst" class="hover:text-slate-800 transition-colors flex items-center gap-1">
          <IconArrowLeft size="16" />
          Logs Système
        </NuxtLink>
        <span class="text-slate-300">/</span>
        <span class="font-mono text-slate-400">#{{ log.id || log._id }}</span>
      </div>

      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold text-slate-800">Détail du Log</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border" :class="{
              'bg-emerald-50 text-emerald-700 border-emerald-200': log.status === 'success',
              'bg-red-50 text-red-700 border-red-200': log.status === 'failed',
              'bg-amber-50 text-amber-700 border-amber-200': log.status === 'pending',
              'bg-slate-50 text-slate-700 border-slate-200': !['success', 'failed', 'pending'].includes(log.status)
            }">
              {{ log.status || 'STATUS' }}
            </span>
          </div>
          <p class="text-slate-500 font-medium">{{ new Date(log.createdAt).toLocaleString(undefined, {
            dateStyle:
              'full', timeStyle: 'medium' }) }}</p>
        </div>

        <button @click="downloadJson"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-all shadow-sm font-medium">
          <IconBraces size="18" />
          <span>Exporter JSON</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column (Main) -->
      <div class="lg:col-span-8 space-y-6">

        <!-- Action Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <IconActivity class="text-blue-600" size="20" />
            <h2 class="font-bold text-slate-800">Activité & Cible</h2>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Action Exécutée</span>
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <IconClick size="24" />
                </div>
                <div>
                  <div class="font-mono font-bold text-slate-700 text-lg">{{ log.action }}</div>
                  <div class="text-xs text-slate-400">Identifiant d'action</div>
                </div>
              </div>
            </div>

            <div class="border-l border-slate-100 pl-8 md:block hidden"></div>
            <!-- Mobile separator overlap fix structure could vary but grid handles it ok usually -->

            <div>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Entité Ciblée</span>
              <div class="flex items-start gap-3">
                <div class="p-2 rounded-lg" :class="{
                  'bg-indigo-50 text-indigo-600': log.targetType === 'user',
                  'bg-teal-50 text-teal-600': log.targetType === 'learner',
                  'bg-purple-50 text-purple-600': log.targetType === 'admin',
                  'bg-slate-100 text-slate-500': !['user', 'learner', 'admin'].includes(log.targetType)
                }">
                  <IconTarget size="24" />
                </div>
                <div>
                  <div class="font-bold text-slate-700 capitalize text-lg">{{ log.targetType }}</div>
                  <div v-if="log.targetId"
                    class="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                    ID: {{ log.targetId }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Technical Data -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <IconCode class="text-slate-600" size="20" />
              <h2 class="font-bold text-slate-800">Données Techniques</h2>
            </div>
          </div>
          <div class="relative group">
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="p-1 px-2 bg-slate-800 text-white text-xs rounded shadow hover:bg-slate-700"
                @click="copyToClipboard(JSON.stringify(log.details || {}, null, 2))">
                Copier
              </button>
            </div>
            <pre
              class="bg-slate-900 text-slate-200 p-6 text-sm font-mono overflow-x-auto leading-relaxed">{{ JSON.stringify(log.details || {}, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Right Column (Sidebar) -->
      <div class="lg:col-span-4 space-y-6">

        <!-- Actor Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <IconUser size="16" />
            Initiateur
          </h3>

          <div v-if="log.admin" class="flex items-start gap-4">
            <div
              class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-lg border-2 border-white shadow-sm shrink-0">
              {{ log.admin.firstName?.[0] || 'A' }}
            </div>
            <div class="min-w-0">
              <div class="font-bold text-slate-800 truncate">{{ log.admin.firstName }} {{ log.admin.lastName }}</div>
              <div class="text-xs text-slate-500 truncate mb-2">{{ log.admin.email }}</div>
              <span
                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600 uppercase tracking-wide">
                {{ log.admin.role }}
              </span>
            </div>
          </div>
          <div v-else class="flex items-center gap-3 text-slate-500 italic p-2 bg-slate-50 rounded-lg">
            <IconRobot size="20" />
            <span>Système Automatique</span>
          </div>
        </div>

        <!-- System Context Card -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <IconServer size="16" />
            Contexte Système
          </h3>

          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <IconWifi class="text-slate-400 mt-0.5" size="18" />
              <div>
                <span class="block text-xs text-slate-400 mb-0.5">Adresse IP</span>
                <span
                  class="font-mono text-sm font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {{ log.ipAddress || 'Non définie' }}
                </span>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <IconBrowser class="text-slate-400 mt-0.5" size="18" />
              <div class="min-w-0 flex-1">
                <span class="block text-xs text-slate-400 mb-0.5">User Agent</span>
                <p
                  class="text-xs text-slate-600 break-words leading-snug bg-slate-50 p-2 rounded border border-slate-100">
                  {{ log.userAgent || 'Non défini' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ID Card -->
        <div class="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center">
          <span class="text-xs text-slate-400 uppercase font-bold block mb-1">Log ID</span>
          <code class="text-xs text-slate-500 select-all">{{ log.id || log._id }}</code>
        </div>

      </div>
    </div>
  </div>
  <div v-else class="min-h-[400px] flex flex-col items-center justify-center text-slate-400">
    <IconFileShredder size="48" class="mb-4 opacity-50" />
    <p>Aucun log trouvé.</p>
  </div>
</template>

<script setup>
import {
  IconArrowLeft, IconBraces, IconActivity, IconTarget, IconCode,
  IconUser, IconRobot, IconServer, IconWifi, IconBrowser,
  IconClick, IconFileShredder
} from '@tabler/icons-vue'
import { useActivityStore } from '~/stores/activity'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Log Système | Détail'
})

const route = useRoute()
const activityStore = useActivityStore()
const { currentLog: log, loading, error } = storeToRefs(activityStore)

onMounted(() => {
  if (route.params.id) {
    activityStore.fetchSystemLog(route.params.id)
  }
})

const downloadJson = () => {
  if (!log.value) return
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(log.value, null, 2))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute("href", dataStr)
  downloadAnchorNode.setAttribute("download", `log_syst_${log.value.id}.json`)
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  // Simple check for notification could go here
}
</script>
