import { ref, type Ref } from 'vue'

export interface TilePosition {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export function useDashboardGrid() {
  const tiles: Ref<TilePosition[]> = ref([])

  function addTile(id: string): TilePosition {
    const nextY = tiles.value.length > 0
      ? Math.max(...tiles.value.map(t => t.y + t.h))
      : 0
    const tile: TilePosition = { id, x: 0, y: nextY, w: 6, h: 1 }
    tiles.value.push(tile)
    return tile
  }

  function removeTile(id: string) {
    tiles.value = tiles.value.filter(t => t.id !== id)
  }

  function resizeTile(id: string, w: number, h: number) {
    const tile = tiles.value.find(t => t.id === id)
    if (tile) {
      tile.w = Math.max(3, Math.min(12, w))
      tile.h = Math.max(1, h)
    }
  }

  function moveTile(id: string, x: number, y: number) {
    const tile = tiles.value.find(t => t.id === id)
    if (tile) {
      tile.x = Math.max(0, Math.min(12 - tile.w, x))
      tile.y = Math.max(0, y)
    }
  }

  function setTiles(positions: TilePosition[]) {
    tiles.value = positions
  }

  return { tiles, addTile, removeTile, resizeTile, moveTile, setTiles }
}
