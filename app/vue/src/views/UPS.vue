<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'
</script>

<template>
  <DynamicTableView
    title="User-Provided Services"
    endpoint="ups-ui"
    :filters="[]"
  />
</template>
