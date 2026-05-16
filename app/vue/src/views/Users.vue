<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'

const filters = [
  { key: 'user', label: 'User', default: '*', wide: true, suggestEndpoint: 'users-ui', suggestField: 'USER_NAME' }
]
</script>

<template>
  <DynamicTableView
    title="Database Users"
    endpoint="users-ui"
    :filters="filters"
  />
</template>
