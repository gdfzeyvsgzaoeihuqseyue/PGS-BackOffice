<template>
  <GroupOverview v-if="group" :group="group" />
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})

const { getGroupBySlug } = useNavigation()
const group = getGroupBySlug('solutions')

useHead({
  title: group?.label || 'Solutions'
})
</script>
