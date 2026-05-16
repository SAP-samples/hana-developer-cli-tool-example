<script setup lang="ts">
import DynamicTableView from '../components/DynamicTableView.vue'
</script>

<template>
  <DynamicTableView
    title="BTP Subscriptions"
    endpoint="btpSubs-ui"
    :filters="[]"
    :show-limit="false"
    link-column="SubscriptionUrl"
  />
</template>
