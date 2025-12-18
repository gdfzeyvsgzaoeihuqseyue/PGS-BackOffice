<template>
  <GroupOverview v-if="group" :group="group" />
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})

const { getGroupBySlug } = useNavigation()
const group = getGroupBySlug('manage')

useHead({
  title: group?.label || 'Gestion'
})
</script>
