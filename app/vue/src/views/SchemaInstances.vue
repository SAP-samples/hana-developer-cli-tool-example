<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'
</script>

<template>
  <DynamicTableView
    title="Schema Instances"
    endpoint="schemaInstances-ui"
    :filters="[]"
  />
</template>
