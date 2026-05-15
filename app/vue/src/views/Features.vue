<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'
</script>

<template>
  <DynamicTableView
    title="Database Features"
    endpoint="features-ui"
    :filters="[]"
  />
</template>
