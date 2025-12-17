<template>
  <div>
    <h1 class="text-2xl font-bold text-secondary-800 mb-2">Tableau de bord</h1>
    <p class="text-secondary-500 mb-8">Vue d'ensemble de l'activité du backoffice.</p>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

      <!-- Utilisateurs -->
      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-secondary-100 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <IconUsers size="80" class="text-primary-500 transform translate-x-4 -translate-y-4" />
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <div class="text-secondary-500 text-xs font-bold uppercase tracking-wider">Utilisateurs</div>
          <div class="p-2 bg-primary-50 rounded-lg text-primary-600">
            <IconUsers size="20" />
          </div>
        </div>
        <div class="text-3xl font-bold text-secondary-800 relative z-10">{{ userStore.total || '--' }}</div>
        <div class="mt-2 text-xs text-secondary-400 relative z-10">Inscrits total</div>
      </div>

      <!-- Apprenants -->
      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-secondary-100 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <IconSchool size="80" class="text-accent-500 transform translate-x-4 -translate-y-4" />
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <div class="text-secondary-500 text-xs font-bold uppercase tracking-wider">Apprenants</div>
          <div class="p-2 bg-accent-50 rounded-lg text-accent-600">
            <IconSchool size="20" />
          </div>
        </div>
        <div class="text-3xl font-bold text-secondary-800 relative z-10">{{ learnerStore.total || '--' }}</div>
        <div class="mt-2 text-xs text-secondary-400 relative z-10">Actifs sur la plateforme</div>
      </div>

      <!-- Articles -->
      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-secondary-100 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <IconArticle size="80" class="text-purple-500 transform translate-x-4 -translate-y-4" />
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <div class="text-secondary-500 text-xs font-bold uppercase tracking-wider">Articles Blog</div>
          <div class="p-2 bg-purple-50 rounded-lg text-purple-600">
            <IconArticle size="20" />
          </div>
        </div>
        <div class="text-3xl font-bold text-secondary-800 relative z-10">{{ blogStore.articles.length || '--' }}</div>
        <div class="mt-2 text-xs text-secondary-400 relative z-10">Publiés</div>
      </div>

      <!-- Auteurs -->
      <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-secondary-100 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <IconPencil size="80" class="text-orange-500 transform translate-x-4 -translate-y-4" />
        </div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <div class="text-secondary-500 text-xs font-bold uppercase tracking-wider">Auteurs</div>
          <div class="p-2 bg-orange-50 rounded-lg text-orange-600">
            <IconPencil size="20" />
          </div>
        </div>
        <div class="text-3xl font-bold text-secondary-800 relative z-10">{{ blogStore.authors.length || '--' }}</div>
        <div class="mt-2 text-xs text-secondary-400 relative z-10">Contributeurs</div>
      </div>
    </div>

    <!-- Recent Activity / Quick Actions Placeholder -->
    <div class="bg-white rounded-2xl shadow-sm border border-secondary-200 p-8 text-center">
      <div class="max-w-md mx-auto">
        <h3 class="text-lg font-bold text-secondary-800 mb-2">Bienvenue sur votre espace d'administration</h3>
        <p class="text-secondary-500 mb-6">Sélectionnez un module dans la barre latérale pour commencer à gérer votre
          application.</p>
        <div class="flex justify-center gap-4">
          <NuxtLink to="/me/blog/articles"
            class="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-bold hover:bg-primary-100 transition-colors">
            Gérer le Blog
          </NuxtLink>
          <NuxtLink to="/me/manage/users"
            class="px-4 py-2 bg-secondary-50 text-secondary-700 rounded-lg text-sm font-bold hover:bg-secondary-100 transition-colors">
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
})

const userStore = useUserStore()
const learnerStore = useLearnerStore()
const blogStore = useBlogStore()

onMounted(async () => {
  await Promise.allSettled([
    userStore.fetchUsers(),
    learnerStore.fetchLearners(),
    blogStore.fetchArticles(),
    blogStore.fetchAuthors()
  ])
})

useHead({
  title: "tableau de bord"
})
</script>
