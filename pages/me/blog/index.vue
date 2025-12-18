<template>
  <GroupOverview v-if="group" :group="group" />
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})

const { getGroupBySlug } = useNavigation()
const group = getGroupBySlug('blog')

useHead({
  title: group?.label || 'Blog'
})
</script>
