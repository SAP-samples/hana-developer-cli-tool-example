# HANA CLI Command Consistency Analysis Report

## Executive Summary

This analysis reviews all commands in the `./bin` folder for:

1. **Default Value Consistency** - ensuring standard defaults are used across similar commands
2. **Current Schema Support** - verifying `**CURRENT_SCHEMA**` defaults are available where appropriate
3. **Profile Parameter Coverage** - ensuring profile parameter is available for commands that support database connections

## Key Findings

### 1. CURRENT_SCHEMA Default Issues

#### Commands MISSING **CURRENT_SCHEMA** default (but should have it)

| Command | Parameter | Current | Recommended |
| --------- | ----------- | --------- | ------------- |
| dataLineage.js | schema | (no default) | `'**CURRENT_SCHEMA**'` |
| dataDiff.js | schema1, schema2 | (no default) | `'**CURRENT_SCHEMA**'` |
| dataProfile.js | schema | (no default) | `'**CURRENT_SCHEMA**'` |
| dataValidator.js | schema | (no default) | `'**CURRENT_SCHEMA**'` |
| duplicateDetection.js | schema | (no default) | `'**CURRENT_SCHEMA**'` |
| erdDiagram.js | schema | (no default) | `'**CURRENT_SCHEMA**'` |
| export.js | schema | (no default) | `'**CURRENT_SCHEMA**'` |
| import.js | schema | (NO PARAMETER) | Add schema parameter with `'**CURRENT_SCHEMA**'` |
| referentialCheck.js | schema | (no default) | `'**CURRENT_SCHEMA**'` |
| schemaClone.js | sourceSchema, targetSchema | (no default) | `'**CURRENT_SCHEMA**'` |
| tableCopy.js | sourceSchema, targetSchema | ✓ Already has defaults | N/A |

#### Commands WITH **CURRENT_SCHEMA** default (correct)

- backup.js
- callProcedure.js
- calcViewAnalyzer.js
- cds.js
- columnStats.js
- compareData.js (both schemas)
- compareSchema.js (both schemas)
- ftIndexes.js
- functions.js
- graphWorkspaces.js
- indexes.js
- libraries.js
- objects.js
- partitions.js
- procedures.js
- roles.js
- sequences.js
- spatialData.js
- synonyms.js
- tables.js
- tableGroups.js
- tableHotspots.js
- tableCopy.js (both schemas) ✓
- triggers.js
- views.js

### 2. Profile Parameter Coverage

#### Commands WITH profile parameter (correct)

- compareData.js
- compareSchema.js
- dataDiff.js
- dataMask.js
- dataProfile.js
- dataSync.js
- dataValidator.js
- dataLineage.js
- dependencies.js
- duplicateDetection.js
- erdDiagram.js
- export.js
- generateDocs.js
- generateTestData.js
- import.js
- querySimple.js
- referentialCheck.js
- replicationStatus.js
- schemaClone.js
- sdiTasks.js
- tableCopy.js
- tables.js

#### Commands POTENTIALLY MISSING profile parameter (schema-related commands)

| Command | Has Profile? | Recommendation |
| --------- | ------------- | --- |
| views.js | ✗ | Add profile parameter |
| indexes.js | ✗ | Add profile parameter |
| functions.js | ✗ | Add profile parameter |
| procedures.js | ✗ | Add profile parameter |
| triggers.js | ✗ | Add profile parameter |
| sequences.js | ✗ | Add profile parameter |
| libraries.js | ✗ | Add profile parameter |
| roles.js | ✗ | Add profile parameter |
| objects.js | ✗ | Add profile parameter |
| partitions.js | ✗ | Add profile parameter |
| columnStats.js | ✗ | Add profile parameter |
| spatialData.js | ✗ | Add profile parameter |
| ftIndexes.js | ✗ | Add profile parameter |
| graphWorkspaces.js | ✗ | Add profile parameter |
| tableHotspots.js | ✗ | Add profile parameter |
| tableGroups.js | ✗ | Add profile parameter |
| calcViewAnalyzer.js | ✗ | Add profile parameter |
| callProcedure.js | ✗ | Add profile parameter |
| cds.js | ✗ | Add profile parameter |

### 3. Default Limit Values

Consistent default limit: **200** is used across most commands

- **100**: calcViewAnalyzer.js (special case - calc views)
- **200**: Standard for list commands, but varies for analysis commands
- **1000**: import.js (batchSize)
- **10000**: dataDiff.js, dataValidator.js, duplicateDetection.js, referentialCheck.js

### 4. Profile Parameter Consistency

All profile parameters use:

```javascript
profile: {
  alias: ['p'],
  type: 'string',
  desc: baseLite.bundle.getText("profile")
}
```

This pattern is consistent. ✓

## Recommended Actions

### Priority 1: Add CURRENT_SCHEMA defaults (Critical)

These commands should have schema parameters with **CURRENT_SCHEMA** defaults:

1. **dataLineage.js** - Add default: `'**CURRENT_SCHEMA**'` to schema
2. **dataDiff.js** - Add defaults: `'**CURRENT_SCHEMA**'` to schema1 and schema2
3. **dataProfile.js** - Add default: `'**CURRENT_SCHEMA**'` to schema
4. **dataValidator.js** - Add default: `'**CURRENT_SCHEMA**'` to schema
5. **duplicateDetection.js** - Add default: `'**CURRENT_SCHEMA**'` to schema
6. **erdDiagram.js** - Add default: `'**CURRENT_SCHEMA**'` to schema
7. **export.js** - Add default: `'**CURRENT_SCHEMA**'` to schema
8. **referentialCheck.js** - Add default: `'**CURRENT_SCHEMA**'` to schema
9. **schemaClone.js** - Add defaults: `'**CURRENT_SCHEMA**'` to sourceSchema and targetSchema
10. **import.js** - **CRITICAL**: Add schema parameter with default `'**CURRENT_SCHEMA**'`

### Priority 2: Add profile parameters to list commands

These commands support database connections and should have profile parameters:

1. views.js
2. indexes.js
3. functions.js
4. procedures.js
5. triggers.js
6. sequences.js
7. libraries.js
8. roles.js
9. objects.js
10. partitions.js
11. columnStats.js
12. spatialData.js
13. ftIndexes.js
14. graphWorkspaces.js
15. tableHotspots.js
16. tableGroups.js
17. calcViewAnalyzer.js
18. callProcedure.js
19. cds.js
