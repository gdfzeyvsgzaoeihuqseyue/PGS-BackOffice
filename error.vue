<template>
  <div class="h-screen bg-secondary-50 flex items-center justify-center p-4">
    <!-- 403 Forbidden Specific -->
    <AppError v-if="error?.statusCode === 403" title="Accès refusé" :message="error?.message || 'Accès non autorisé'"
      :retry="false" />

    <!-- 404 Not Found -->
    <div v-else-if="error?.statusCode === 404" class="max-w-lg w-full text-center">
      <h1 class="text-9xl font-bold text-primary-200">404</h1>
      <h2 class="text-2xl font-bold text-secondary-800 mt-4">Page introuvable</h2>
      <p class="text-secondary-500 mt-2 mb-8">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <button @click="handleClear" class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
        Retour à l'accueil
      </button>
    </div>

    <!-- Generic Error -->
    <AppError v-else :message="error?.message || 'Une erreur inattendue est survenue'" :retry="true"
      @retry="handleClear" />
  </div>
</template>

<script setup lang="ts">
const error = useError()

const handleClear = () => {
  clearError({ redirect: '/' })
}
</script>
