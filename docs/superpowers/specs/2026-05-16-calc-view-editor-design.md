# Graphical Calculation View Editor — Design Specification

**Date:** 2026-05-16
**Status:** Approved
**Author:** Claude + Thomas Jung

## Overview

A graphical editor for SAP HANA Calculation Views integrated into the hana-cli Vue web UI. Replicates the core UX of the SAP Business Application Studio (BAS) Calculation View editor — a DAG-based node canvas with bottom-to-top data flow, node palette, context-sensitive properties panel, and full XML serialization/deserialization for `.hdbcalculationview` files.

## Goals

- Full feature parity with the BAS Graphical Calculation View editor
- Dual-mode: browse/edit design-time project files AND deployed HANA runtime views
- Multi-tab editing with dirty state tracking
- CRUD lifecycle: create new views, open existing, edit, save/export
- Seamless integration with hana-cli's existing Vue web UI and REST API

## Non-Goals (Out of Scope)

- Direct write-back to HANA runtime (export-only for runtime views)
- Real-time collaboration / multi-user editing
- HDI deployment triggering (save produces XML; deploy is separate)
- Lineage tracing (requires separate design with runtime integration)
- Performance analysis integration (requires separate design with runtime integration)

---

## Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Canvas | **Vue Flow** (@vue-flow/core) | Node graph rendering, zoom/pan, drag & drop |
| Auto-layout | **elkjs** | Hierarchical bottom-to-top DAG layout algorithm |
| Expression editor | **Monaco Editor** (vue-monaco-editor, already in project) | SQL expression editing with autocomplete |
| XML parsing | **fast-xml-parser** | Parse .hdbcalculationview XML to JS objects |
| XML serialization | **fast-xml-parser** (builder) | Serialize model back to XML with round-trip fidelity |
| UI components | **UI5 Web Components** (already in project) | Buttons, dialogs, inputs, tabs |
| Panel resizing | **splitpanes** (already in project) | Resizable left/center/right panels |
| State management | **Vue 3 Composition API** (reactive + composables) | Reactive model, undo/redo stack |

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  .hdbcalculationview (XML file / HANA runtime query)         │
└───────────────────────────────┬──────────────────────────────┘
                                │ parse (fast-xml-parser)
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  CalcViewModel (reactive TypeScript model)                    │
│  ┌─────────────┐ ┌────────────┐ ┌───────────────────────┐  │
│  │ dataSources │ │ calcViews  │ │ logicalModel          │  │
│  │ (table refs)│ │ (nodes)    │ │ (output cols/measures)│  │
│  └─────────────┘ └────────────┘ └───────────────────────┘  │
│  ┌─────────────┐ ┌────────────┐ ┌───────────────────────┐  │
│  │ variables   │ │ mappings   │ │ layout (positions)    │  │
│  └─────────────┘ └────────────┘ └───────────────────────┘  │
└───────────────────────────────┬──────────────────────────────┘
                                │ transform (model → Vue Flow)
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Vue Flow Rendering State                                    │
│  ┌──────────┐  ┌───────┐  ┌─────────────────────────────┐  │
│  │  nodes[] │  │edges[]│  │ custom node Vue components   │  │
│  └──────────┘  └───────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Single source of truth** — The `CalcViewModel` is the reactive model. Vue Flow is a rendering view of it. Changes in the properties panel or canvas both mutate the model, which triggers Vue Flow re-render.

2. **Command-pattern undo/redo** — Each mutation creates a reversible command (add node, move node, change join type, map column, etc.). The undo stack operates on commands, not on Vue Flow state.

3. **XML round-trip fidelity** — The parser preserves all XML elements, including ones we don't render in the editor. When serializing back, we reconstruct from the model but preserve unknown elements to avoid data loss on save.

4. **Node type registry** — Each node type is registered with:
   - A Vue component for canvas rendering
   - A properties panel component
   - A schema describing configurable properties
   - A serializer/deserializer for its XML fragment

---

## UI Layout

### Three-Panel Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Tab: SALES_CUBE.hdbcalc...] [Tab: PRODUCT_DIM.hdbcalc...] [+ New]  │
├──────────────────────────────────────────────────────────────────────┤
│ [Undo][Redo] | [Auto Layout][Expand][Collapse] | [Remove][Dup] | [Save][XML] │
├────────────┬────────────────────────────────────┬────────────────────┤
│            │                                    │                    │
│  Node      │         Canvas (Vue Flow)          │   Properties       │
│  Palette   │                                    │   Panel            │
│            │    ┌──────────┐                    │                    │
│  [Join]    │    │Semantics │ (top)              │  [Node Name]       │
│  [Union]   │    └────┬─────┘                    │  [Tabs: Mapping |  │
│  [Proj]    │         │                          │   CalcCols|Filter] │
│  [Agg]     │    ┌────┴─────┐                    │                    │
│  [Rank]    │    │  Join_1  │                    │  [Column mapping   │
│  [...]     │    └──┬───┬───┘                    │   drag & drop]     │
│            │       │   │                        │                    │
│            │  ┌────┘   └────┐                   │                    │
│            │  │Proj_A│ │Proj_B│                  │                    │
│            │                                    │                    │
│            │  [Minimap]        [Zoom: - 100% +] │                    │
├────────────┴────────────────────────────────────┴────────────────────┤
│ [Status bar: file path | modified | node count | zoom level]          │
└──────────────────────────────────────────────────────────────────────┘
```

- **Left panel (180px, resizable):** Draggable node palette — drag onto canvas to add nodes
- **Center:** Vue Flow canvas — DAG with bottom-to-top flow, dot-grid background, minimap, zoom controls
- **Right panel (320px, resizable):** Context-sensitive properties panel — tabs change based on selected node type
- **Tab bar (top):** Multiple open Calculation Views
- **Toolbar:** Undo/Redo, layout controls, save, toggle XML source view (Monaco)

### Navigation Integration

New top-level "Modeling" group in the sidebar navigation, containing:
- **Calculation Views** — Browse/list page (the Modeling Home)
- Opens to the full editor when a view is selected

---

## Node Types

### Visual Design

Each node type has a unique accent color derived from SAP Fiori theme CSS variables (`--sapChart_OrderedColor_N`), ensuring automatic adaptation to Horizon Light, Horizon Dark, and future themes.

| Node Type | Theme Variable | Icon | Max Inputs |
|-----------|---------------|------|------------|
| Semantics | `--sapAccentColor6` | ◈ | 1 (always top) |
| Join | `--sapChart_OrderedColor_1` | ⊕ | 2 (left/right) |
| Non Equi Join | `--sapChart_OrderedColor_2` | ⊗ | 2 |
| Union | `--sapChart_OrderedColor_3` | ⊎ | N (variable) |
| Minus | `--sapChart_OrderedColor_4` | ⊖ | 2 |
| Intersect | `--sapChart_OrderedColor_5` | ⊓ | 2 |
| Projection | `--sapChart_OrderedColor_6` | ▦ | 1 |
| Aggregation | `--sapChart_OrderedColor_7` | Σ | 1 |
| Rank | `--sapChart_OrderedColor_8` | ⧗ | 1 |
| Table Function | `--sapChart_OrderedColor_9` | ƒ | 0 (leaf) |
| Hierarchy Function | `--sapChart_OrderedColor_10` | ⊹ | 1 |

### Node Visual States

- **Default:** Rounded rectangle, accent-colored border, icon + name + subtitle + column count
- **Selected:** Glow shadow (`--sapContent_FocusColor`), enlarged handles
- **Collapsed:** Reduced height, icon + name only
- **Hover:** Slight border brightening

### Connection Handles

- **Bottom handles** = inputs (from child nodes below)
- **Top handle** = output (to parent node above)
- Handle count matches the node type's max inputs
- Semantics node has no top handle (it's the root)

---

## Properties Panel

### Tab Configuration by Node Type

| Node Type | Tabs |
|-----------|------|
| Projection | Mapping, Calculated Columns, Filter, Parameters |
| Aggregation | Mapping, Calculated Columns, Filter, Parameters |
| Join / Non Equi Join | Mapping (with Join Condition section), Calculated Columns, Filter, Parameters |
| Union | Mapping (column-to-column grid), Constant Values, Parameters |
| Minus / Intersect | Mapping, Parameters |
| Rank | Mapping, Rank Configuration, Parameters |
| Table Function | Function Configuration, Parameters |
| Hierarchy Function | Hierarchy Configuration, Parameters |
| Semantics | View Properties, Columns, Hierarchies, Parameters, Variables |

### Column Mapping (Mapping Tab)

Three-column layout within the properties panel:

1. **Left data source(s):** List of available columns from input node(s)
2. **Right data source(s):** (For Join/Union — second input)
3. **Output Columns:** Columns mapped to this node's output

**Interactions:**
- Drag column from data source → drop onto Output Columns area
- Already-mapped columns show strikethrough + "→ mapped" indicator
- Multi-select: Shift+click or Ctrl+click for bulk drag
- Double-click data source header = "Map All" shortcut
- Right-click column for context menu (rename, remove, set as key)

### Join Condition Builder

- Visual chip-based display: `[LEFT.COL] = [RIGHT.COL]`
- Add condition by: dragging left column onto right column, or clicking "+ Add Condition"
- Support for compound conditions (AND)
- Delete condition with × button

### Calculated Column Editor

- Column list as selectable chips + "+ New" button
- Embedded Monaco editor for SQL expressions
- SQL autocomplete with available input column names
- Properties grid: data type, aggregation type, label, hidden flag

### Filter Expression

- Monaco editor with SQL WHERE clause syntax
- Autocomplete from available columns
- Visual builder option for simple conditions (column, operator, value)

### Semantics Node — Columns Tab

Matches BAS layout:
- Table with columns: Type (attribute/measure), Name, Label, Aggregation Type, Variable, Label Column, Data Masking, Hidden, Data Type, Semantics, Conversion Function, Related Attributes
- Toolbar: Mark as Attribute, Mark as Measure, Assign Semantics, Generate Labels, Propagate, Extract Semantics, Sort Result Set

---

## File Management

### Modeling Home (Browse Page)

**Mode toggle:** "Project Files" | "HANA Runtime"

**Project Files mode:**
- Scans configured project directory recursively for `.hdbcalculationview` files
- Displays: file name, data category (CUBE/DIMENSION), node count, file path, last modified
- Breadcrumb navigation for project directory
- Search/filter by name

**HANA Runtime mode:**
- Queries connected HANA instance for deployed Calculation Views
- **Primary (HANA Cloud / HDI):** Uses `SYS.CALCULATION_SCENARIOS` system view for listing; reads XML via HDI container design-time artifact tables (`_SYS_DI` APIs or container schema metadata)
- **Legacy (on-prem / XS Classic):** Falls back to `_SYS_BI.BIMC_ALL_CUBES` for listing and `_SYS_REPO.ACTIVE_OBJECT` for XML extraction
- Detection: Attempts `SYS.CALCULATION_SCENARIOS` first; if unavailable, falls back to legacy path
- Opens as read-only; "Export As" to save locally

### Create New Calculation View

Dialog with:
- **Name:** Identifier for the view
- **Data Category:** CUBE or DIMENSION
- **Description:** Free-text description
- **Initial Node:** Projection / Aggregation / Join / None
- **Save Location:** Directory browser within project

Creates a valid minimal `.hdbcalculationview` XML skeleton and opens it in the editor.

### Multi-Tab Support

- Multiple Calculation Views open simultaneously in tabs
- Tab shows: file name + dirty indicator (dot)
- Close tab prompts if unsaved changes
- Tab context menu: Close, Close Others, Close All, Copy Path

### Save Behavior

- **Project files:** Save in-place (Ctrl+S), or "Save As" to new path
- **Runtime views:** "Export As" only — saves XML to local file
- **Auto-save:** Optional, configurable interval (disabled by default)
- **Dirty state:** Tracked via command stack (dirty = pointer !== savedPointer)
- **"Save As" behavior:** Updates the current tab's file path and calls `markSaved()` on its undo stack. Does NOT open a new tab — the current tab becomes associated with the new path.

---

## Data Source Picker

Modal dialog triggered by clicking "+" on a node or "Add Data Source" in properties.

### Two Tabs

**Project Tab:**
- Lists local `.hdbtable`, `.hdbview`, `.hdbcalculationview` files from project directory
- Parsed to show column info where possible
- Tree view matching project directory structure

**Database Tab:**
- Queries connected HANA instance via hana-cli REST API (`/hana/tables`, `/hana/views`)
- Filters: schema dropdown, type filter (Tables/Views/Calc Views), search text
- Shows: type badge, object name, schema, column count
- Uses existing hana-cli commands under the hood

### Selection Flow

1. User searches/browses for an object
2. Clicks to select (highlighted)
3. Clicks "Add" to confirm
4. Node's data source list updates, columns become available for mapping

---

## XML Format

### Namespace & Root

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore"
    id="VIEW_NAME" applyPrivilegeType="NONE" dataCategory="CUBE">
```

### Key Sections Parsed

| XML Element | Model Property | Description |
|-------------|---------------|-------------|
| `<descriptions>` | `description` | View description |
| `<localVariables>` | `localVariables[]` | Input parameters |
| `<variableMappings>` | `variableMappings[]` | Parameter mappings between nodes |
| `<dataSources>` | `dataSources[]` | Referenced tables/views |
| `<calculationViews>` | `calculationViews[]` | Node graph |
| `<logicalModel>` | `logicalModel` | Output columns, measures, hierarchies |
| `<layout><shapes>` | `layout` | Node positions for graphical editor |

### Round-Trip Strategy

- Parse entire XML into AST, preserving element order and unknown attributes
- Map known elements to typed model properties
- On serialize: reconstruct from model, inserting unknown elements at their original positions
- This ensures no data loss when saving a view that uses features not yet supported in the editor

---

## Core TypeScript Interfaces

```typescript
// Primary model
interface CalcViewModel {
  id: string
  description: string
  dataCategory: 'CUBE' | 'DIMENSION' | 'DEFAULT'
  applyPrivilegeType: string
  dataSources: DataSource[]
  calculationViews: CalcViewNode[]
  logicalModel: LogicalModel
  localVariables: Variable[]
  variableMappings: VariableMapping[]
  layout: LayoutInfo
  _unknownElements: unknown[]  // preserved for round-trip
}

// Node in the graph
interface CalcViewNode {
  id: string                    // matches NodeShape.modelObjectName for position lookup
  type: NodeType
  inputs: NodeInput[]
  outputColumns: Column[]
  calculatedColumns: CalculatedColumn[]
  filterExpression?: string
  // Join and Non Equi Join both use joinConfig. Non Equi Join enables all operators;
  // regular Join restricts to '=' only (enforced by UI, not type system).
  joinConfig?: JoinConfig
  rankConfig?: RankConfig
  unionConfig?: UnionConfig
  tableFunctionConfig?: TableFunctionConfig
  hierarchyFunctionConfig?: HierarchyFunctionConfig
}

type NodeType = 'join' | 'nonEquiJoin' | 'projection' | 'aggregation'
  | 'union' | 'minus' | 'intersect' | 'rank'
  | 'tableFunction' | 'hierarchyFunction'

// Join-specific configuration
interface JoinConfig {
  joinType: 'inner' | 'leftOuter' | 'rightOuter' | 'fullOuter' | 'textJoin' | 'referential'
  cardinality: '1..1' | '1..N' | 'N..1' | 'N..M'
  conditions: JoinCondition[]
}

interface JoinCondition {
  leftColumn: string
  rightColumn: string
  operator: '=' | '<' | '>' | '<=' | '>=' | '!='
}

// Table Function configuration
interface TableFunctionConfig {
  schemaName: string
  functionName: string
  parameterMappings: { paramName: string; value: string }[]
}

// Hierarchy Function configuration
interface HierarchyFunctionConfig {
  hierarchyType: 'leveled' | 'parentChild'
  sourceNode: string            // reference to input node providing hierarchy data
  parentColumn?: string
  childColumn?: string
  levels?: { name: string; column: string }[]
}

// Data source reference
interface DataSource {
  id: string
  type: 'table' | 'view' | 'calculationView'
  schemaName?: string
  objectName: string
  columns: ColumnInfo[]
}

// Column definition
interface Column {
  id: string
  name: string
  dataType: string
  length?: number
  precision?: number
  scale?: number
  isKey?: boolean
  semanticType?: 'attribute' | 'measure'
  aggregationType?: string
  label?: string
  hidden?: boolean
}

// Calculated column
interface CalculatedColumn {
  id: string
  name: string
  dataType: string
  expression: string
  aggregationType?: string
  label?: string
}

// Logical model (output)
interface LogicalModel {
  attributes: Column[]
  calculatedAttributes: CalculatedColumn[]
  baseMeasures: Column[]
  calculatedMeasures: CalculatedColumn[]
  restrictedMeasures: RestrictedMeasure[]
  hierarchies: Hierarchy[]
}

// Layout for graphical positions
interface LayoutInfo {
  shapes: NodeShape[]
}

// Position key: modelObjectName === CalcViewNode.id (canonical relationship)
// MoveNodeCommand mutates LayoutInfo.shapes[n].upperLeftCorner
interface NodeShape {
  modelObjectName: string       // matches CalcViewNode.id
  modelObjectNameSpace: string
  expanded: boolean
  upperLeftCorner: { x: number; y: number }
}

// Input parameter / variable
interface Variable {
  id: string
  name: string
  dataType: string
  defaultValue?: string
  selectionType?: 'single' | 'interval' | 'range'
  mandatory?: boolean
  description?: string
}

// Parameter mapping between nodes
interface VariableMapping {
  sourceVariable: string        // variable ID in child node
  targetVariable: string        // variable ID in parent node / view
  nodeId: string                // which node owns this mapping
}

// Restricted measure
interface RestrictedMeasure {
  id: string
  name: string
  baseMeasure: string           // reference to a baseMeasure column ID
  restriction: RestrictionFilter[]
  label?: string
}

interface RestrictionFilter {
  attributeName: string
  operator: '=' | 'IN' | 'BETWEEN'
  values: string[]
}

// Hierarchy definition
interface Hierarchy {
  id: string
  name: string
  type: 'leveled' | 'parentChild'
  levels?: HierarchyLevel[]     // for leveled
  parentColumn?: string         // for parent-child
  childColumn?: string          // for parent-child
}

interface HierarchyLevel {
  name: string
  column: string
  ordinal: number
}
```

---

## Component Structure

All `calcview/` components are **locally imported** where used (not globally registered). This avoids namespace collisions with existing components (e.g., the analytics `DataSourcePicker`) and enables tree-shaking.

```
src/
├── views/
│   ├── CalcViewBrowser.vue          # Modeling Home (browse/open)
│   └── CalcViewEditor.vue           # Full editor shell (tabs + panels)
├── components/
│   └── calcview/
│       ├── canvas/
│       │   ├── CalcViewCanvas.vue   # Vue Flow wrapper
│       │   ├── nodes/
│       │   │   ├── SemanticsNode.vue
│       │   │   ├── JoinNode.vue          # Shared by 'join' and 'nonEquiJoin' types (same visual, different config)
│       │   │   ├── ProjectionNode.vue
│       │   │   ├── AggregationNode.vue
│       │   │   ├── UnionNode.vue
│       │   │   ├── MinusNode.vue
│       │   │   ├── IntersectNode.vue
│       │   │   ├── RankNode.vue
│       │   │   ├── TableFunctionNode.vue
│       │   │   └── HierarchyFunctionNode.vue
│       │   ├── edges/
│       │   │   └── DataFlowEdge.vue
│       │   └── NodePalette.vue
│       ├── properties/
│       │   ├── PropertiesPanel.vue       # Shell with tab router
│       │   ├── MappingTab.vue            # Column mapping (3-column DnD)
│       │   ├── CalculatedColumnsTab.vue  # Expression editor
│       │   ├── FilterTab.vue             # Filter expression
│       │   ├── ParametersTab.vue         # Input parameters
│       │   ├── JoinConditionSection.vue  # Join condition builder (used by both Join and Non Equi Join)
│       │   ├── RankConfigTab.vue         # Rank settings
│       │   ├── UnionMappingTab.vue       # Union column matching
│       │   ├── SemanticsColumnsTab.vue   # Semantics output columns
│       │   ├── ViewPropertiesTab.vue     # View-level properties
│       │   └── HierarchiesTab.vue        # Hierarchy definitions
│       ├── dialogs/
│       │   ├── CalcViewDataSourcePicker.vue  # Add data source dialog (locally imported, not globally registered)
│       │   ├── CreateViewDialog.vue      # New view creation
│       │   └── ExportDialog.vue          # Export/Save As
│       ├── toolbar/
│       │   └── EditorToolbar.vue
│       └── tabs/
│           └── EditorTabBar.vue
├── composables/
│   └── calcview/
│       ├── useCalcViewModel.ts           # Reactive model management
│       ├── useCalcViewParser.ts          # XML → model
│       ├── useCalcViewSerializer.ts      # Model → XML
│       ├── useCalcViewLayout.ts          # elkjs auto-layout
│       ├── useCalcViewUndoRedo.ts        # Command stack + per-tab dirty state (dirty = pointer !== saved pointer)
│       ├── useCalcViewTabs.ts            # Multi-tab state (each tab has its own undo stack)
│       ├── useNodeRegistry.ts            # Node type registry
│       └── useDataSourcePicker.ts        # Data source search/selection
└── services/
    └── calcview/
        ├── xmlParser.ts                  # fast-xml-parser configuration
        ├── xmlSerializer.ts              # XML builder with round-trip
        ├── nodeTypes.ts                  # Node type definitions & metadata
        └── calcViewApi.ts                # REST API calls for file/HANA operations
```

---

## Backend API Endpoints (New Routes)

Added to hana-cli's Express REST API under the existing `/hana/` prefix convention (new route module: `routes/calcView.js`):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/hana/calcview/project/list?path=` | List .hdbcalculationview files in project directory |
| GET | `/hana/calcview/project/read?file=` | Read file content (XML string) |
| POST | `/hana/calcview/project/write` | Write XML content to file |
| GET | `/hana/calcview/runtime/list` | List deployed calc views from HANA |
| GET | `/hana/calcview/runtime/read?name=&schema=` | Read deployed view XML definition |
| GET | `/hana/calcview/datasources/columns?type=&schema=&name=` | Get column metadata for a data source |

**Note:** The Data Source Picker's "Database" tab reuses existing `/hana/tables` and `/hana/views` endpoints for searching objects. Only the column-detail endpoint is new.

### Security: Path Validation

All project file endpoints (`/hana/calcview/project/*`) MUST validate that the resolved file path is within the configured project root directory. Path traversal attacks (e.g., `?file=../../etc/passwd`) are rejected with 403. Implementation:
- Resolve the `file` parameter to an absolute path
- Verify it starts with the configured project root
- Reject symlinks that escape the project root

---

## Undo/Redo System

### Command Pattern

Each tab maintains its own `UndoRedoStack` instance. Dirty state is derived directly from the undo stack: a tab is dirty when `pointer !== savedPointer` (where `savedPointer` is updated on each save). Undoing back to the saved state clears the dirty indicator.

```typescript
interface Command {
  type: string
  execute(): void
  undo(): void
  description: string  // for tooltip: "Add Join_1", "Map column AMOUNT"
}

interface UndoRedoStack {
  commands: Command[]
  pointer: number      // current position in stack
  savedPointer: number // position at last save (for dirty detection)
  push(cmd: Command): void
  undo(): void
  redo(): void
  markSaved(): void    // updates savedPointer to current pointer
  canUndo: ComputedRef<boolean>
  canRedo: ComputedRef<boolean>
  isDirty: ComputedRef<boolean>  // pointer !== savedPointer
}
```

### Command Types

- `AddNodeCommand` — adds a node to the graph
- `RemoveNodeCommand` — removes a node and its connections
- `MoveNodeCommand` — changes node position (mutates `LayoutInfo.shapes[n].upperLeftCorner`)
- `ConnectNodesCommand` — creates an edge between nodes
- `DisconnectNodesCommand` — removes an edge
- `MapColumnCommand` — maps a column to output
- `UnmapColumnCommand` — removes a column mapping
- `ChangePropertyCommand` — generic property change (join type, filter, etc.)
- `AddCalculatedColumnCommand` — adds a calculated column
- `BatchCommand` — groups multiple commands as one undo step

---

## Performance Considerations

- **Virtual rendering:** Vue Flow only renders visible nodes (important for complex views with 50+ nodes)
- **Lazy column loading:** Column metadata for data sources loaded on demand, not upfront
- **Debounced auto-layout:** elkjs layout runs debounced (300ms) after structural changes
- **XML parsing:** For large files (>500KB), parsing runs asynchronously using chunked microtasks (`requestIdleCallback` / `setTimeout(0)` batching) to avoid blocking the UI. A full web worker can be introduced as a future optimization if profiling shows the need.
- **Minimap:** Rendered separately, updated on requestAnimationFrame

---

## Testing Strategy

- **Unit tests:** XML parser/serializer round-trip tests with sample .hdbcalculationview files
- **Unit tests:** Command stack (undo/redo correctness)
- **Component tests:** Node rendering, properties panel tab switching
- **Integration tests:** Full flow — open file → edit → save → verify XML output
- **Snapshot tests:** Generated XML matches expected output for known inputs

---

## Phasing (Implementation Order)

### Phase 1: Foundation
- XML parser/serializer with round-trip tests
- CalcViewModel reactive model
- Basic Vue Flow canvas with Projection + Semantics nodes
- Node palette (drag to add)
- Basic properties panel (view properties only)

### Phase 2: Core Editing
- All 10 node types rendered
- Edge connections (add/remove)
- Column mapping (drag & drop)
- Join condition builder
- Undo/redo

### Phase 3: Advanced Features
- Calculated columns with Monaco expression editor
- Filter expressions
- Input parameters and variable mappings
- Auto-layout (elkjs)
- Multi-tab support

### Phase 4: File Management
- Modeling Home browse page
- Project file scanning
- HANA runtime view listing and XML extraction
- Data source picker (Project + Database tabs)
- Create new / Save / Export flows

### Phase 5: Full BAS Parity
- Semantics node full column table (all column properties)
- Hierarchies
- Currency/unit conversion
- Data masking
- Restricted measures

---

## Future Considerations (Separate Design Required)

These features require runtime HANA integration beyond static view modeling and will need their own design specs:

- **Lineage tracing** — Visualizing data lineage across multiple calculation views and base tables
- **Performance analysis integration** — Connecting to HANA's Plan Visualizer / statement hints

---

## Dependencies (New npm Packages)

| Package | Version | Purpose |
|---------|---------|---------|
| `@vue-flow/core` | ^1.x | Node graph canvas |
| `@vue-flow/minimap` | ^1.x | Minimap overlay |
| `@vue-flow/controls` | ^1.x | Zoom controls |
| `elkjs` | ^0.9.x | Hierarchical auto-layout |
| `fast-xml-parser` | ^4.x | XML parse/serialize |

All other dependencies (Monaco, splitpanes, UI5 Web Components) are already in the project.
