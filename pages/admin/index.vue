<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-800 mb-2">Tableau de bord</h1>
    <p class="text-slate-500 mb-8">Vue d'ensemble de l'activité du backoffice.</p>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

      <!-- Utilisateurs -->
      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <IconUsers size="80" class="text-emerald-500 transform translate-x-4 -translate-y-4" />
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <div class="text-slate-500 text-xs font-bold uppercase tracking-wider">Utilisateurs</div>
          <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <IconUsers size="20" />
          </div>
        </div>
        <div class="text-3xl font-bold text-slate-800 relative z-10">{{ userStore.total || '--' }}</div>
        <div class="mt-2 text-xs text-slate-400 relative z-10">Inscrits total</div>
      </div>

      <!-- Apprenants -->
      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <IconSchool size="80" class="text-cyan-500 transform translate-x-4 -translate-y-4" />
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <div class="text-slate-500 text-xs font-bold uppercase tracking-wider">Apprenants</div>
          <div class="p-2 bg-cyan-50 rounded-lg text-cyan-600">
            <IconSchool size="20" />
          </div>
        </div>
        <div class="text-3xl font-bold text-slate-800 relative z-10">{{ learnerStore.total || '--' }}</div>
        <div class="mt-2 text-xs text-slate-400 relative z-10">Actifs sur la plateforme</div>
      </div>

      <!-- Articles -->
      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <IconArticle size="80" class="text-purple-500 transform translate-x-4 -translate-y-4" />
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <div class="text-slate-500 text-xs font-bold uppercase tracking-wider">Articles Blog</div>
          <div class="p-2 bg-purple-50 rounded-lg text-purple-600">
            <IconArticle size="20" />
          </div>
        </div>
        <div class="text-3xl font-bold text-slate-800 relative z-10">{{ blogStore.articles.length || '--' }}</div>
        <div class="mt-2 text-xs text-slate-400 relative z-10">Publiés</div>
      </div>

      <!-- Auteurs -->
      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <IconPencil size="80" class="text-orange-500 transform translate-x-4 -translate-y-4" />
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <div class="text-slate-500 text-xs font-bold uppercase tracking-wider">Auteurs</div>
          <div class="p-2 bg-orange-50 rounded-lg text-orange-600">
            <IconPencil size="20" />
          </div>
        </div>
        <div class="text-3xl font-bold text-slate-800 relative z-10">{{ blogStore.authors.length || '--' }}</div>
        <div class="mt-2 text-xs text-slate-400 relative z-10">Contributeurs</div>
      </div>
    </div>

    <!-- Recent Activity / Quick Actions Placeholder -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
      <div class="max-w-md mx-auto">
        <h3 class="text-lg font-bold text-slate-800 mb-2">Bienvenue sur votre espace d'administration</h3>
        <p class="text-slate-500 mb-6">Sélectionnez un module dans la barre latérale pour commencer à gérer votre
          application.</p>
        <div class="flex justify-center gap-4">
          <NuxtLink to="/admin/blog/articles"
            class="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors">
            Gérer le Blog
          </NuxtLink>
          <NuxtLink to="/admin/manage/users"
            class="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
            Gérer les Utilisateurs
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IconUsers, IconSchool, IconArticle, IconPencil } from '@tabler/icons-vue'
import { useUserStore } from '~/stores/user'
import { useLearnerStore } from '~/stores/learner'
import { useBlogStore } from '~/stores/blog'

definePageMeta({
  layout: 'admin',
  title: 'Dashboard'
})

const userStore = useUserStore()
const learnerStore = useLearnerStore()
const blogStore = useBlogStore()

// Trigger fetches to populate stats if not already done
// We use Promise.allSettled to avoid one failure stopping others
onMounted(async () => {
  await Promise.allSettled([
    userStore.fetchUsers(),
    learnerStore.fetchLearners(),
    blogStore.fetchArticles(), // Will also give us array lengths
    blogStore.fetchAuthors()
  ])
})
</script>
