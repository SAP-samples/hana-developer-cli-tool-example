<script setup lang="ts">
import { useRouter } from 'vue-router'
import DynamicTableView from '../components/DynamicTableView.vue'

const router = useRouter()

const filters = [
  { key: 'schema', label: 'Schema', default: '**CURRENT_SCHEMA**', suggestEndpoint: 'schemas-ui', suggestField: 'SCHEMA_NAME' },
  { key: 'function', label: 'Function filter', default: '*', suggestEndpoint: 'functions-ui', suggestField: 'FUNCTION_NAME' }
]

function onRowClick(row: any) {
  router.push({
    name: 'inspectFunction',
    query: { function: row.FUNCTION_NAME, schema: row.SCHEMA_NAME }
  })
}
</script>

<template>
  <DynamicTableView
    title="Database Functions"
    endpoint="functions-ui"
    :filters="filters"
    link-column="FUNCTION_NAME"
    @row-click="onRowClick"
  />
</template>
