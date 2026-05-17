import { ref, computed, type Ref } from 'vue'
import type { FilterConfig } from './useChartConfig'

export interface CrossFilter {
  sourceTileId: string
  filter: FilterConfig
}

export function useCrossFilter() {
  const crossFilters: Ref<CrossFilter[]> = ref([])

  function addCrossFilter(sourceTileId: string, column: string, value: string) {
    crossFilters.value = crossFilters.value.filter(cf => cf.sourceTileId !== sourceTileId)
    crossFilters.value.push({
      sourceTileId,
      filter: { column, operator: '=', value }
    })
  }

  function clearCrossFilters() {
    crossFilters.value = []
  }

  function getFiltersForTile(tileId: string): FilterConfig[] {
    return crossFilters.value
      .filter(cf => cf.sourceTileId !== tileId)
      .map(cf => cf.filter)
  }

  const hasCrossFilters = computed(() => crossFilters.value.length > 0)

  return { crossFilters, addCrossFilter, clearCrossFilters, getFiltersForTile, hasCrossFilters }
}
