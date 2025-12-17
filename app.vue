<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppToast />
  </div>
</template>

<script setup lang="ts">

import { useSharedFiles } from '~/stores/sharedFiles';

const { toasts } = useToast()

const runtimeConfig = useRuntimeConfig();
const sharedFilesUrl = runtimeConfig.public.pgsSharedFiles;
const sharedFiles = useSharedFiles();
const { data: customData } = await useAsyncData('customData', () => sharedFiles.getCustomData());

onMounted(async () => {
  if (!customData.value) {
    await refreshNuxtData('customData');
  }
});

const heroImagePath = `${sharedFilesUrl}/SuitOps_Landing/Hero/index.png`;
const baseUrl = computed(() => customData.value?.pgs?.url);

useHead({
  titleTemplate: '%s | PGS BACKOFFICE',
  meta: [
    {
      key: 'description',
      name: 'description',
      content: 'Gérer PGS depuis le panel d\'administration'
    },

    // Open Graph (Facebook, LinkedIn)
    { property: 'og:title', content: 'Gérer PGS depuis le panel d\'administration' },
    { property: 'og:description', content: 'Un espace pour gérer tout dans PRO GESTION SOFT' },
    { property: 'og:image', content: heroImagePath },
    { property: 'og:url', content: baseUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'fr_FR' },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Gérer PGS depuis le panel d\'administration' },
    { name: 'twitter:description', content: 'Un espace pour gérer tout dans PRO GESTION SOFT' },
    { name: 'twitter:image', content: heroImagePath },
  ]
});
</script>
