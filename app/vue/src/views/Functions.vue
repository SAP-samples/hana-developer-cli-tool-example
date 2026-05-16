<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'

const filters = [
  { key: 'schema', label: 'Schema', default: '**CURRENT_SCHEMA**', suggestEndpoint: 'schemas-ui', suggestField: 'SCHEMA_NAME' },
  { key: 'function', label: 'Function filter', default: '*', suggestEndpoint: 'functions-ui', suggestField: 'FUNCTION_NAME' }
]
</script>

<template>
  <DynamicTableView
    title="Database Functions"
    endpoint="functions-ui"
    :filters="filters"
  />
</template>
