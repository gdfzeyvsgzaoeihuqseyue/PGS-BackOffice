<template>
  <div>
    <AppLoader v-if="loading" />
    <AppError v-else-if="error" :message="error" @retry="refresh" />
    <div v-else-if="stats" class="fade-in-up">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <NuxtLink to="/me/solutions/services" class="text-slate-400 hover:text-slate-600 transition-colors">
              <IconArrowLeft size="20" />
            </NuxtLink>
            <h2 class="text-2xl font-bold text-slate-800">Statistiques Services</h2>
          </div>
          <p class="text-slate-500 mt-1 ml-7">Vue d'ensemble de l'utilisation et de la santé des services</p>
        </div>
        <button @click="refresh"
          class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
          <IconRefresh size="18" /> Actualiser
        </button>
      </div>

      <!-- Health Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Utilization -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <div class="text-slate-500 text-xs font-bold uppercase mb-1">Taux d'utilisation Services</div>
            <div class="text-3xl font-bold text-slate-800">{{ stats.healthIndicators.servicesUtilization }}%</div>
            <div class="text-xs text-slate-400 mt-1">Services actifs / Total services</div>
          </div>
          <div class="h-16 w-16 rounded-full flex items-center justify-center font-bold text-lg border-4"
            :class="getHealthColor(stats.healthIndicators.servicesUtilization)">
            {{ stats.healthIndicators.servicesUtilization }}%
          </div>
        </div>

        <!-- Access Rate -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <div class="text-slate-500 text-xs font-bold uppercase mb-1">Taux d'accès Actifs</div>
            <div class="text-3xl font-bold text-slate-800">{{ stats.healthIndicators.accessRate }}%</div>
            <div class="text-xs text-slate-400 mt-1">Utilisateurs actifs / Total users</div>
          </div>
          <div class="h-16 w-16 rounded-full flex items-center justify-center font-bold text-lg border-4"
            :class="getHealthColor(stats.healthIndicators.accessRate)">
            {{ stats.healthIndicators.accessRate }}%
          </div>
        </div>

        <!-- Unused -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <div class="text-slate-500 text-xs font-bold uppercase mb-1">Services Non Utilisés</div>
            <div class="text-3xl font-bold text-slate-800">{{ stats.healthIndicators.unusedServicesPercentage }}%</div>
            <div class="text-xs text-slate-400 mt-1">Services sans aucun accès</div>
          </div>
          <div class="h-16 w-16 rounded-full flex items-center justify-center font-bold text-lg border-4"
            :class="getReverseHealthColor(stats.healthIndicators.unusedServicesPercentage)">
            {{ stats.healthIndicators.unusedServicesPercentage }}%
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Services -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <IconServer size="20" />
            </div>
            <h3 class="font-bold text-slate-700">Services</h3>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-slate-500 text-sm">Total</span>
              <span class="font-bold text-slate-800">{{ stats.overview.services.total }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500 text-sm">Actifs</span>
              <span class="font-bold text-emerald-600">{{ stats.overview.services.active }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500 text-sm">Inactifs</span>
              <span class="font-bold text-red-500">{{ stats.overview.services.inactive }}</span>
            </div>
          </div>
        </div>

        <!-- Users -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <IconUsers size="20" />
            </div>
            <h3 class="font-bold text-slate-700">Utilisateurs</h3>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-slate-500 text-sm">Total</span>
              <span class="font-bold text-slate-800">{{ stats.overview.access.users.total }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500 text-sm">Actifs</span>
              <span class="font-bold text-emerald-600">{{ stats.overview.access.users.active }}</span>
            </div>
          </div>
        </div>

        <!-- Learners -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <IconUserEdit size="20" />
            </div>
            <h3 class="font-bold text-slate-700">Apprenants</h3>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-slate-500 text-sm">Total</span>
              <span class="font-bold text-slate-800">{{ stats.overview.access.learners.total }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500 text-sm">Actifs</span>
              <span class="font-bold text-emerald-600">{{ stats.overview.access.learners.active }}</span>
            </div>
          </div>
        </div>

        <!-- Global Access -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <IconActivity size="20" />
            </div>
            <h3 class="font-bold text-slate-700">Accès Global</h3>
          </div>
          <div class="mb-2">
            <div class="text-3xl font-bold text-slate-800">{{ stats.overview.access.combined.total }}</div>
            <div class="text-xs text-slate-400">Total accès enregistrés</div>
          </div>
          <div class="pt-3 border-t border-slate-100">
            <div class="text-xs text-slate-500 mb-1">Moyenne par service</div>
            <div class="font-bold text-slate-800 text-lg">{{ stats.overview.averages.accessPerService }}</div>
          </div>
        </div>
      </div>

      <!-- Detail Lists -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Services -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <IconTrendingUp size="18" class="text-emerald-500" />
              {{ stats.topServices.title }}
            </h3>
          </div>
          <div class="divide-y divide-slate-100">
            <div v-for="service in stats.topServices.data" :key="service.id"
              class="p-4 hover:bg-slate-50 transition-colors">
              <div class="flex items-start justify-between">
                <div>
                  <NuxtLink :to="`/me/solutions/services/${service.id}`"
                    class="font-bold text-slate-800 hover:text-emerald-600 transition-colors">
                    {{ service.name }}
                  </NuxtLink>
                  <a :href="service.domain" target="_blank"
                    class="text-xs text-blue-500 hover:underline block mt-0.5">{{ service.domain }}</a>
                </div>
                <div class="text-right">
                  <div class="text-xl font-bold text-slate-700">{{ service.totalAccess }}</div>
                  <div class="text-xs text-slate-400">accès</div>
                </div>
              </div>
              <div class="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span class="flex items-center gap-1">
                  <IconUsers size="12" /> {{ service.usersCount }} Users
                </span>
                <span class="flex items-center gap-1">
                  <IconUserEdit size="12" /> {{ service.learnersCount }} Learners
                </span>
              </div>
            </div>
            <div v-if="!stats.topServices.data.length" class="p-8 text-center text-slate-400 italic">
              Aucune donnée disponible
            </div>
          </div>
        </div>

        <!-- Least Used & Unused -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <IconAlertCircle size="18" class="text-amber-500" />
              Services peu ou pas utilisés
            </h3>
          </div>

          <!-- Unused Services List -->
          <div v-if="stats.unusedServices.count > 0" class="p-4 bg-red-50/50 border-b border-red-100">
            <div class="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
              <IconAlertTriangle size="16" />
              {{ stats.unusedServices.count }} Services sans aucun utilisateur
            </div>
            <div class="flex flex-wrap gap-2">
              <NuxtLink v-for="service in stats.unusedServices.data" :key="service.id"
                :to="`/me/solutions/services/${service.id}`"
                class="px-2 py-1 bg-white border border-red-100 text-red-600 text-xs rounded hover:bg-red-50 transition-colors">
                {{ service.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- Least Used List -->
          <div class="divide-y divide-slate-100">
            <div v-for="service in stats.leastUsedServices.data.filter(s => s.totalAccess > 0)" :key="service.id"
              class="p-4 hover:bg-slate-50 transition-colors">
              <div class="flex items-center justify-between">
                <NuxtLink :to="`/me/solutions/services/${service.id}`"
                  class="font-medium text-slate-700 hover:text-emerald-600 transition-colors">
                  {{ service.name }}
                </NuxtLink>
                <span class="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold">{{ service.totalAccess }}
                  accès</span>
              </div>
            </div>
            <div
              v-if="!stats.leastUsedServices.data.filter(s => s.totalAccess > 0).length && stats.unusedServices.count === 0"
              class="p-8 text-center text-slate-400 italic">
              Tous les services sont utilisés activement !
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { IconArrowLeft, IconRefresh, IconServer, IconUsers, IconUserEdit, IconActivity, IconTrendingUp, IconAlertCircle, IconAlertTriangle } from '@tabler/icons-vue'
import { useServiceStore } from '~/stores/service'

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Services - Statistiques'
})

const serviceStore = useServiceStore()
const { stats, loading, error } = storeToRefs(serviceStore)

const refresh = async () => {
  await serviceStore.fetchStats()
}

refresh()

// Helper for health colors
const getHealthColor = (percentage) => {
  if (percentage >= 80) return 'text-emerald-500 border-emerald-200 bg-emerald-50'
  if (percentage >= 50) return 'text-amber-500 border-amber-200 bg-amber-50'
  return 'text-red-500 border-red-200 bg-red-50'
}

const getReverseHealthColor = (percentage) => {
  if (percentage <= 20) return 'text-emerald-500 border-emerald-200 bg-emerald-50'
  if (percentage <= 50) return 'text-amber-500 border-amber-200 bg-amber-50'
  return 'text-red-500 border-red-200 bg-red-50'
}
</script>
