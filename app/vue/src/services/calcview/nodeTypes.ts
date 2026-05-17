import type { NodeType } from './types'

export interface NodeTypeDefinition {
  type: NodeType
  label: string
  icon: string
  themeVariable: string
  maxInputs: number
  canBeLeaf: boolean
}

export const NODE_TYPE_DEFINITIONS: Record<NodeType, NodeTypeDefinition> = {
  join: {
    type: 'join',
    label: 'Join',
    icon: '⊕',
    themeVariable: '--sapChart_OrderedColor_1',
    maxInputs: 2,
    canBeLeaf: false
  },
  nonEquiJoin: {
    type: 'nonEquiJoin',
    label: 'Non Equi Join',
    icon: '⊗',
    themeVariable: '--sapChart_OrderedColor_2',
    maxInputs: 2,
    canBeLeaf: false
  },
  union: {
    type: 'union',
    label: 'Union',
    icon: '⊎',
    themeVariable: '--sapChart_OrderedColor_3',
    maxInputs: Infinity,
    canBeLeaf: false
  },
  minus: {
    type: 'minus',
    label: 'Minus',
    icon: '⊖',
    themeVariable: '--sapChart_OrderedColor_4',
    maxInputs: 2,
    canBeLeaf: false
  },
  intersect: {
    type: 'intersect',
    label: 'Intersect',
    icon: '⊓',
    themeVariable: '--sapChart_OrderedColor_5',
    maxInputs: 2,
    canBeLeaf: false
  },
  projection: {
    type: 'projection',
    label: 'Projection',
    icon: '▦',
    themeVariable: '--sapChart_OrderedColor_6',
    maxInputs: 1,
    canBeLeaf: true
  },
  aggregation: {
    type: 'aggregation',
    label: 'Aggregation',
    icon: 'Σ',
    themeVariable: '--sapChart_OrderedColor_7',
    maxInputs: 1,
    canBeLeaf: true
  },
  rank: {
    type: 'rank',
    label: 'Rank',
    icon: '⧗',
    themeVariable: '--sapChart_OrderedColor_8',
    maxInputs: 1,
    canBeLeaf: false
  },
  tableFunction: {
    type: 'tableFunction',
    label: 'Table Function',
    icon: 'ƒ',
    themeVariable: '--sapChart_OrderedColor_9',
    maxInputs: 0,
    canBeLeaf: true
  },
  hierarchyFunction: {
    type: 'hierarchyFunction',
    label: 'Hierarchy Function',
    icon: '⊹',
    themeVariable: '--sapChart_OrderedColor_10',
    maxInputs: 1,
    canBeLeaf: false
  }
}

export const SEMANTICS_THEME_VARIABLE = '--sapAccentColor6'
