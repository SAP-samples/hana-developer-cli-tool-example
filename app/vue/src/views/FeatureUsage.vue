<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'
</script>

<template>
  <DynamicTableView
    title="Feature Usage"
    endpoint="featureUsage-ui"
    :filters="[]"
  />
</template>
