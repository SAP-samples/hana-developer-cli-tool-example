<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'

const filters = [
  { key: 'schema', label: 'Schema', default: '**CURRENT_SCHEMA**', suggestEndpoint: 'schemas-ui', suggestField: 'SCHEMA_NAME' }
]
</script>

<template>
  <DynamicTableView
    title="Database Schemas"
    endpoint="schemas-ui"
    :filters="filters"
  />
</template>
