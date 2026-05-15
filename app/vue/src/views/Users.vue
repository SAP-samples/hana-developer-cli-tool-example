<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'

const filters = [
  { key: 'schema', label: 'Schema', default: '**CURRENT_SCHEMA**', suggestEndpoint: 'schemas-ui', suggestField: 'SCHEMA_NAME' },
  { key: 'user', label: 'User filter', default: '*' }
]
</script>

<template>
  <DynamicTableView
    title="Database Users"
    endpoint="users-ui"
    :filters="filters"
  />
</template>
