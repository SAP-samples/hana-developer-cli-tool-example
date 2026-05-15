<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'
</script>

<template>
  <DynamicTableView
    title="HDI Containers"
    endpoint="containers-ui"
    :filters="[]"
  />
</template>
