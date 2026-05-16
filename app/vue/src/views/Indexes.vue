<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'

const filters = [
  { key: 'schema', label: 'Schema', default: '**CURRENT_SCHEMA**', suggestEndpoint: 'schemas-ui', suggestField: 'SCHEMA_NAME' },
  { key: 'index', label: 'Index filter', default: '*', suggestEndpoint: 'indexes-ui', suggestField: 'INDEX_NAME' }
]
</script>

<template>
  <DynamicTableView
    title="Database Indexes"
    endpoint="indexes-ui"
    :filters="filters"
  />
</template>
