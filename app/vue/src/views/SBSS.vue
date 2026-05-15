<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'
</script>

<template>
  <DynamicTableView
    title="SBSS Instances"
    endpoint="sbss-ui"
    :filters="[]"
  />
</template>
