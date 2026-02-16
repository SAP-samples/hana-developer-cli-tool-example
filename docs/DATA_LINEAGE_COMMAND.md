# Data Lineage Command

## Overview

The `dataLineage` command traces data lineage and transformations across tables. It helps visualize data flow from source tables through transformations to target tables, supporting upstream, downstream, and bidirectional lineage analysis.

## Command Aliases

- `lineage`
- `dataFlow`
- `traceLineage`

## Usage

```bash
hana-cli dataLineage [options]
hana-cli lineage --table SALES_ORDERS --direction upstream
```

## Options

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--table` | `-t` | string | required | Name of the table to trace lineage for |
| `--schema` | `-s` | string | optional | Schema name (uses current if omitted) |
| `--direction` | `-d` | string | upstream | Direction: `upstream`, `downstream`, `bidirectional` |
| `--depth` | `-dp` | number | 5 | Maximum lineage depth to trace |
| `--includeTransformations` | `-t` | boolean | true | Include views, procedures, and transformations |
| `--output` | `-o` | string | optional | Output file path for the report |
| `--format` | `-f` | string | summary | Format: `json`, `csv`, `graphml`, `summary` |
| `--timeout` | `-to` | number | 3600 | Operation timeout in seconds |
| `--profile` | `-p` | string | optional | Connection profile to use |

## Lineage Directions

- **upstream** (default) - Trace source tables and data origins
- **downstream** - Trace dependent tables that use this table
- **bidirectional** - Trace both upstream sources and downstream dependents

## Examples

### Upstream lineage (data sources)

```bash
hana-cli dataLineage --table SALES_ORDERS \
  --direction upstream \
  --depth 3
```

### Downstream lineage (data consumers)

```bash
hana-cli dataLineage --table SALES_ORDERS \
  --direction downstream \
  --depth 5
```

### Bidirectional with GraphML export

```bash
hana-cli dataLineage --table SALES_ORDERS \
  --direction bidirectional \
  --format graphml \
  --output lineage.graphml
```

### Detailed JSON lineage including transformations

```bash
hana-cli dataLineage --table CUSTOMER_ANALYTICS \
  --direction upstream \
  --includeTransformations true \
  --format json \
  --output customer-lineage.json
```

## Output Formats

### Summary (default)

```bash
Data Lineage Report
===================

Root Table: SALES_ORDERS
Direction: upstream
Depth: 5

Source Tables: 3
Target Tables: 2
Transformations: 4

Nodes:
  SALES_ORDERS (Level 0)
  ORDERS (Level 1)
  CUSTOMERS (Level 1)
  PRODUCTS (Level 1)
  PRODUCT_CATEGORIES (Level 2)
  ... and 5 more nodes

Transformations:
  VIEW: V_SALES_SUMMARY
  VIEW: V_ORDER_DETAILS
  ... and 2 more transformations
```

### JSON

```json
{
  "rootTable": "SALES_ORDERS",
  "direction": "upstream",
  "depth": 5,
  "sourceCount": 3,
  "targetCount": 2,
  "transformationCount": 4,
  "nodes": [
    {
      "id": "SALES.SALES_ORDERS",
      "name": "SALES_ORDERS",
      "schema": "SALES",
      "type": "table",
      "level": 0
    },
    {
      "id": "SALES.ORDERS",
      "name": "ORDERS",
      "schema": "SALES",
      "type": "table",
      "level": 1
    }
  ],
  "edges": [
    {
      "source": "SALES.ORDERS",
      "target": "SALES.SALES_ORDERS",
      "type": "data_flow",
      "label": "join"
    }
  ],
  "transformations": [
    {
      "source": "ORDERS",
      "transformation": "V_SALES_SUMMARY",
      "type": "VIEW",
      "definition": "SELECT order_id, SUM(amount)..."
    }
  ]
}
```

### GraphML (for visualization tools)

GraphML is an XML format that can be imported into graph visualization tools like yEd, Gephi, or Cytoscape.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <graph edgedefault="directed">
    <node id="SALES.SALES_ORDERS" label="SALES_ORDERS"/>
    <node id="SALES.ORDERS" label="ORDERS"/>
    <edge source="SALES.ORDERS" target="SALES.SALES_ORDERS" label="data_flow"/>
  </graph>
</graphml>
```

### CSV

```csv
Source,Target,Type,Label
"SALES.ORDERS","SALES.SALES_ORDERS","data_flow","join"
"SALES.CUSTOMERS","SALES.ORDERS","data_flow","reference"
"SALES.PRODUCTS","SALES.ORDERS","data_flow","reference"
```

## Understanding Lineage

### Nodes

Represent database objects (tables, views, transformations) at different levels of the lineage graph.

### Edges

Represent data flow relationships between nodes.

### Transformations

Views, stored procedures, functions, or other objects that transform data from source to target.

### Levels

- Level 0: Your root table
- Level 1: Direct dependencies
- Level 2+: Indirect dependencies based on specified depth

## Use Cases

### Impact Analysis

Understand what tables and dashboards will be affected by changes to a source table.

```bash
# Find all downstream consumers of a table
hana-cli dataLineage --table CUSTOMER_MASTER \
  --direction downstream \
  --depth 10 \
  --format json \
  --output impact-analysis.json
```

### Data Quality Audits

Trace data from source systems to identify where quality issues originate.

```bash
# Trace data from raw tables to final analytical views
hana-cli dataLineage --table RAW_CUSTOMER_DATA \
  --direction downstream \
  --includeTransformations true
```

### Compliance and Audit Trail

Document data transformations and flows for compliance purposes.

```bash
# Export complete lineage for sensitive data
hana-cli dataLineage --table CUSTOMER_PII \
  --direction bidirectional \
  --format graphml \
  --output compliance-lineage.graphml
```

## Return Codes

- `0` - Lineage trace completed successfully
- `1` - Trace failed or database connection issue

## Performance Tips

1. Limit `--depth` for large, interconnected schemas
2. Use `--includeTransformations false` if transformations aren't needed
3. Export to file for large lineage graphs
4. Use GraphML format for visualization in external tools

## Visualizing Lineage

### With GraphML

```bash
# Generate GraphML
hana-cli dataLineage --table SALES_ORDERS \
  --direction bidirectional \
  --format graphml \
  --output sales-lineage.graphml

# Open in visualization tool (e.g., Cytoscape, Gephi)
```

### With JSON

```bash
# Generate JSON
hana-cli dataLineage --table SALES_ORDERS \
  --format json \
  --output sales-lineage.json

# Create custom visualization using your preferred tool
```

## Advanced Scenarios

### Multi-Schema Tracing

```bash
hana-cli dataLineage --table SALES_ORDERS \
  --schema OPERATIONAL \
  --direction upstream
```

### Deep Lineage for Complex ETL

```bash
hana-cli dataLineage --table FINAL_ANALYTICS_TABLE \
  --direction upstream \
  --depth 20 \
  --includeTransformations true \
  --format json \
  --output deep-lineage.json
```

## Related Commands

- `dataValidator` - Validate data against business rules
- `referentialCheck` - Verify referential integrity
- `duplicateDetection` - Find duplicate records
- `dataProfile` - Generate statistical profiles
- `dependencies` - Show object dependencies
