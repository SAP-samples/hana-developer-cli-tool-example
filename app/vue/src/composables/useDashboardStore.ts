import { ref, type Ref } from 'vue'
import type { TilePosition } from './useDashboardGrid'
import type { ChartConfig } from './useChartConfig'

export interface DashboardTile {
  id: string
  position: TilePosition
  config: ChartConfig
}

export interface DashboardDefinition {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  globalFilters: { column: string; operator: string; value: string }[]
  tiles: DashboardTile[]
}

const STORAGE_KEY = 'hana-cli-dashboards'

export function useDashboardStore() {
  const dashboards: Ref<DashboardDefinition[]> = ref([])
  const activeDashboard: Ref<DashboardDefinition | null> = ref(null)

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      dashboards.value = raw ? JSON.parse(raw) : []
    } catch {
      dashboards.value = []
    }
  }

  function saveAll() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards.value))
  }

  function create(name: string): DashboardDefinition {
    const dashboard: DashboardDefinition = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      globalFilters: [],
      tiles: []
    }
    dashboards.value.push(dashboard)
    activeDashboard.value = dashboard
    saveAll()
    return dashboard
  }

  function save() {
    if (activeDashboard.value) {
      activeDashboard.value.updatedAt = new Date().toISOString()
      const idx = dashboards.value.findIndex(d => d.id === activeDashboard.value!.id)
      if (idx >= 0) dashboards.value[idx] = activeDashboard.value
      saveAll()
    }
  }

  function remove(id: string) {
    dashboards.value = dashboards.value.filter(d => d.id !== id)
    if (activeDashboard.value?.id === id) activeDashboard.value = null
    saveAll()
  }

  function exportDashboard(dashboard: DashboardDefinition): string {
    return JSON.stringify(dashboard, null, 2)
  }

  function importDashboard(json: string): DashboardDefinition | null {
    try {
      const dashboard = JSON.parse(json) as DashboardDefinition
      dashboard.id = crypto.randomUUID()
      dashboard.updatedAt = new Date().toISOString()
      dashboards.value.push(dashboard)
      saveAll()
      return dashboard
    } catch {
      return null
    }
  }

  function setActive(id: string) {
    activeDashboard.value = dashboards.value.find(d => d.id === id) || null
  }

  loadAll()

  return { dashboards, activeDashboard, create, save, remove, exportDashboard, importDashboard, setActive, loadAll }
}
