<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'
</script>

<template>
  <DynamicTableView
    title="Certificates"
    endpoint="certificates-ui"
    :filters="[]"
  />
</template>
