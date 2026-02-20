# Command Consistency Analysis

Analysis of command parameter inconsistencies and standardization efforts.

## Key Findings

### Current Schema Default Issues

**Commands Needing `'**CURRENT_SCHEMA**'` Default:**

- dataLineage, dataDiff, dataProfile, dataValidator
- duplicateDetection, erdDiagram, export  
- referentialCheck, schemaClone, tableCopy

**Commands Already Correct:**

- backup, callProcedure, tables, views, functions
- procedures, roles, indexes, triggers, sequences

### Profile Parameter Coverage

**Commands WITH profile parameter (23):**

- compareData, compareSchema, dataDiff, dataMask
- dataProfile, dataSync, dataValidator, dataLineage
- dependencies, duplicateDetection, erdDiagram, export
- generateDocs, generateTestData, import, querySimple
- referentialCheck, replicationStatus, schemaClone
- sdiTasks, tableCopy, tables

**Commands NEEDING profile parameter (19):**

- views, indexes, functions, procedures, triggers
- sequences, libraries, roles, objects, partitions
- columnStats, spatialData, ftIndexes, graphWorkspaces
- tableHotspots, tableGroups, calcViewAnalyzer
- callProcedure, cds

### Default Limit Values

- **100**: calcViewAnalyzer (special case)
- **200**: Standard list commands
- **1000**: import.js (batchSize)
- **10000**: dataDiff, dataValidator, duplicateDetection, referentialCheck

## Standardization Results

### Implemented ✅

- batchSize parameter standardized to 1000 default
- Batch size range: 1-10,000 with validation
- profile parameter consistent across data operation commands
- Quiet mode (`--quiet`/`-q`) for scripting
- Debug mode (`--debug`) for troubleshooting

### Recommended

- Adopt `'**CURRENT_SCHEMA**'` as default across all schema parameters
- Add profile parameter to all schema-browsing commands
- Use consistent output format options (json, table, csv, excel)
- Implement consistent error handling patterns

## Testing

All changes validated with:

- Unit tests for parameter validation
- Integration tests with actual databases
- Error handling for invalid parameter combinations

## See Also

- [Parameter Standards Guide](./parameter-standards.md)
- [Testing Coverage](./testing-guide.md)
