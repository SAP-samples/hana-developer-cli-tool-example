<script setup lang="ts">
import '@ui5/webcomponents/dist/TabContainer.js'
import '@ui5/webcomponents/dist/Tab.js'
import { ref } from 'vue'
import ExploreTab from '../components/analytics/ExploreTab.vue'
import SqlTab from '../components/analytics/SqlTab.vue'
import DashboardTab from '../components/analytics/DashboardTab.vue'

const activeTab = ref('explore')

function onTabSelect(e: any) {
  const key = e.detail?.tab?.dataset?.key
  if (key) activeTab.value = key
}
</script>

<template>
  <div class="analytics-view">
    <ui5-tabcontainer @tab-select="onTabSelect">
      <ui5-tab data-key="explore" text="Explore" icon="chart-table-view" selected></ui5-tab>
      <ui5-tab data-key="sql" text="SQL" icon="syntax"></ui5-tab>
      <ui5-tab data-key="dashboard" text="Dashboard" icon="business-objects-experience"></ui5-tab>
    </ui5-tabcontainer>
    <div class="tab-content">
      <ExploreTab v-show="activeTab === 'explore'" />
      <SqlTab v-show="activeTab === 'sql'" />
      <DashboardTab v-show="activeTab === 'dashboard'" />
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
  overflow: hidden;
}
</style>
