<script setup lang="ts">
import { useRouter } from 'vue-router'
import DynamicTableView from '../components/DynamicTableView.vue'

const router = useRouter()

const filters = [
  { key: 'schema', label: 'Schema', default: '**CURRENT_SCHEMA**', suggestEndpoint: 'schemas-ui', suggestField: 'SCHEMA_NAME' },
  { key: 'view', label: 'View filter (e.g. MY_*)', default: '*', suggestEndpoint: 'views-ui', suggestField: 'VIEW_NAME' }
]

function onRowClick(row: any) {
  router.push({
    name: 'inspectView',
    query: { view: row.VIEW_NAME, schema: row.SCHEMA_NAME }
  })
}
</script>

<template>
  <DynamicTableView
    title="Database Views"
    endpoint="views-ui"
    :filters="filters"
    link-column="VIEW_NAME"
    @row-click="onRowClick"
  />
</template>
