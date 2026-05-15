<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'
</script>

<template>
  <DynamicTableView
    title="Data Types"
    endpoint="dataTypes-ui"
    :filters="[]"
  />
</template>
