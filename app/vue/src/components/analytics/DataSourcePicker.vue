<script setup lang="ts">
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/SuggestionItem.js'
import '@ui5/webcomponents/dist/Select.js'
import '@ui5/webcomponents/dist/Option.js'
import { ref, watch } from 'vue'
import { useSuggestions } from '../../composables/useSuggestions'
import { useCurrentSchema } from '../../composables/useCurrentSchema'

const emit = defineEmits<{
  select: [schema: string, object: string, objectType: 'table' | 'view']
}>()

const { resolvedSchema } = useCurrentSchema()
const schema = ref('')
const objectName = ref('')
const objectType = ref<'table' | 'view'>('table')

const schemaSuggestions = useSuggestions('schemas-ui', 'SCHEMA_NAME')
const tableSuggestions = useSuggestions('tables-ui', 'TABLE_NAME')
const viewSuggestions = useSuggestions('views-ui', 'VIEW_NAME')

schemaSuggestions.load()

watch(resolvedSchema, (val) => {
  if (val && !schema.value) schema.value = val
}, { immediate: true })

watch([schema, objectType], () => {
  objectName.value = ''
  if (schema.value) {
    if (objectType.value === 'table') {
      tableSuggestions.load({ schema: schema.value })
    } else {
      viewSuggestions.load({ schema: schema.value })
    }
  }
})

function onObjectSelect(e: any) {
  const selected = e.detail?.item?.textContent || objectName.value
  objectName.value = selected
  if (selected) {
    emit('select', schema.value, selected, objectType.value)
  }
}
</script>

<template>
  <div class="data-source-picker">
    <div class="picker-row">
      <ui5-input
        class="schema-input"
        placeholder="Schema"
        :value="schema"
        show-suggestions
        @input="(e: any) => schema = e.target.value"
        @suggestion-item-select="(e: any) => schema = e.detail?.item?.textContent || schema"
      >
        <ui5-suggestion-item
          v-for="s in schemaSuggestions.items.value"
          :key="s"
          :text="s"
        ></ui5-suggestion-item>
      </ui5-input>
      <ui5-select class="type-select" @change="(e: any) => objectType = e.detail.selectedOption.dataset.value">
        <ui5-option data-value="table" selected>Table</ui5-option>
        <ui5-option data-value="view">View</ui5-option>
      </ui5-select>
    </div>
    <ui5-input
      class="object-input"
      :placeholder="`Search ${objectType}s...`"
      :value="objectName"
      show-suggestions
      @input="(e: any) => objectName = e.target.value"
      @suggestion-item-select="onObjectSelect"
    >
      <ui5-suggestion-item
        v-for="s in (objectType === 'table' ? tableSuggestions.items.value : viewSuggestions.items.value)"
        :key="s"
        :text="s"
      ></ui5-suggestion-item>
    </ui5-input>
  </div>
</template>

<style scoped>
.data-source-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.picker-row {
  display: flex;
  gap: 0.5rem;
}
.schema-input { flex: 1; }
.type-select { width: 6rem; }
.object-input { width: 100%; }
</style>
