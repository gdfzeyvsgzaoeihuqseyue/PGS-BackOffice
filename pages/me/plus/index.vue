<template>
  <GroupOverview v-if="group" :group="group" />
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})

const { getGroupBySlug } = useNavigation()
const group = getGroupBySlug('plus')

useHead({
  title: group?.label || 'Plus'
})
</script>
