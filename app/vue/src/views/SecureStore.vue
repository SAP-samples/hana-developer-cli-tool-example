<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'
</script>

<template>
  <DynamicTableView
    title="Secure Store Instances"
    endpoint="securestore-ui"
    :filters="[]"
  />
</template>
