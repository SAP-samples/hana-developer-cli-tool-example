<script setup lang="ts">
import '@ui5/webcomponents/dist/Label.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'

import type { CalcViewModel } from '../../../services/calcview/types'

const props = defineProps<{
  model: CalcViewModel
}>()
</script>

<template>
  <div class="view-properties">
    <div class="property-row">
      <ui5-label>Name</ui5-label>
      <ui5-input :value="model.id" readonly />
    </div>
    <div class="property-row">
      <ui5-label>Description</ui5-label>
      <ui5-input :value="model.description" />
    </div>
    <div class="property-row">
      <ui5-label>Data Category</ui5-label>
      <ui5-select>
        <ui5-option :selected="model.dataCategory === 'CUBE'">CUBE</ui5-option>
        <ui5-option :selected="model.dataCategory === 'DIMENSION'">DIMENSION</ui5-option>
        <ui5-option :selected="model.dataCategory === 'DEFAULT'">DEFAULT</ui5-option>
      </ui5-select>
    </div>
    <div class="property-row">
      <ui5-label>Privilege Type</ui5-label>
      <ui5-input :value="model.applyPrivilegeType" />
    </div>
  </div>
</template>

<style scoped>
.view-properties {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
