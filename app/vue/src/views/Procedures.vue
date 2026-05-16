<script setup lang="ts">
import { useRouter } from 'vue-router'
import DynamicTableView from '../components/DynamicTableView.vue'

const router = useRouter()

const filters = [
  { key: 'schema', label: 'Schema', default: '**CURRENT_SCHEMA**', suggestEndpoint: 'schemas-ui', suggestField: 'SCHEMA_NAME' },
  { key: 'procedure', label: 'Procedure filter', default: '*', suggestEndpoint: 'procedures-ui', suggestField: 'PROCEDURE_NAME' }
]

function onRowClick(row: any) {
  router.push({
    name: 'callProcedure',
    query: { procedure: row.PROCEDURE_NAME, schema: row.SCHEMA_NAME }
  })
}
</script>

<template>
  <DynamicTableView
    title="Database Procedures"
    endpoint="procedures-ui"
    :filters="filters"
    @row-click="onRowClick"
  />
</template>
