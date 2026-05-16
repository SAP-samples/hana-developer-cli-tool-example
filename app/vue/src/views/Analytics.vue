<script setup lang="ts">
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'
import { ref } from 'vue'

const activeTab = ref('explore')
</script>

<template>
  <div class="analytics-view">
    <ui5-tabcontainer @tab-select="(e: any) => activeTab = e.detail.tab.dataset.key">
      <ui5-tab data-key="explore" text="Explore" selected></ui5-tab>
      <ui5-tab data-key="sql" text="SQL"></ui5-tab>
      <ui5-tab data-key="dashboard" text="Dashboard"></ui5-tab>
    </ui5-tabcontainer>
    <div class="tab-content">
      <p>Active tab: {{ activeTab }}</p>
    </div>
  </div>
</template>

<style scoped>
.analytics-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
}
.tab-content {
  flex: 1;
  margin-top: 1rem;
}
</style>
