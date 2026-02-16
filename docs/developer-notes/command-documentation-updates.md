# Command Documentation Updates Summary

## Overview

This document summarizes the updates made to the README.md documentation for HANA CLI commands to reflect the consistency improvements implemented in the codebase.

## Changes Made

### Commands with Updated **CURRENT_SCHEMA** Defaults

The following commands now document the default value of `**CURRENT_SCHEMA**` for their schema parameters:

1. **export** - Schema parameter default updated
2. **import** - NEW schema parameter added with `**CURRENT_SCHEMA**` default
3. **dataProfile** - Schema parameter default updated
4. **dataDiff** - Both schema1 and schema2 parameters updated with `**CURRENT_SCHEMA**` defaults
5. **dataValidator** - Schema parameter default updated
6. **duplicateDetection** - Schema parameter default updated
7. **dataLineage** - Schema parameter default updated
8. **erdDiagram** - Schema parameter default updated

### Commands with New Profile Parameter Documentation

The following commands now document the new `--profile` parameter (CDS Profile support):

**List/Query Commands:**

- **tables**
- **views**
- **indexes**
- **procedures**
- **functions**
- **sequences**
- **triggers**
- **objects**
- **columnStats**
- **spatialData**
- **partitions**
- **callProcedure**
- **tableGroups**
- **ftIndexes**
- **graphWorkspaces**
- **libraries**
- **roles**

### Commands with Both Updates

1. **export** - Schema default + profile parameter
2. **import** - Schema parameter (new) + profile parameter (existing)
3. **tables** - Profile parameter added (schema default already present)
4. **callProcedure** - Profile parameter added (schema default already present)

## Implementation Notes

### Parameter Formatting

All profile parameters follow the standard pattern in the README:

```text
--profile, --Profile  CDS Profile                                   [string]
```

Where `-p` short form conflicts with existing parameters (like `-p` for port in `cds` command or `-p` for procedure names in `procedures` command), the parameter is documented without a short form.

### Schema Parameter Default Format

The default `**CURRENT_SCHEMA**` is consistently documented as:

```text
[string] [default: "**CURRENT_SCHEMA**"]
```

## Alignment with Code Changes

These README updates align with the code modifications made to 30 command files:

- **10 files** received CURRENT_SCHEMA defaults for schema parameters
- **19 files** received new profile parameters with `['p']` alias
- **1 file** (import.js) received both schema parameter addition AND profile parameter support

## Affected Files

The following command implementations have corresponding README updates:

- `bin/export.js` - Schema + Profile
- `bin/import.js` - Schema + Profile
- `bin/dataProfile.js` - Schema default
- `bin/dataLineage.js` - Schema default
- `bin/dataDiff.js` - Schema defaults
- `bin/dataValidator.js` - Schema default
- `bin/duplicateDetection.js` - Schema default
- `bin/erdDiagram.js` - Schema default
- `bin/tables.js` - Profile
- `bin/views.js` - Profile
- `bin/indexes.js` - Profile
- `bin/procedures.js` - Profile
- `bin/functions.js` - Profile
- `bin/sequences.js` - Profile
- `bin/triggers.js` - Profile
- `bin/objects.js` - Profile
- `bin/columnStats.js` - Profile
- `bin/spatialData.js` - Profile
- `bin/partitions.js` - Profile
- `bin/callProcedure.js` - Profile
- `bin/tableGroups.js` - Profile
- `bin/ftIndexes.js` - Profile
- `bin/graphWorkspaces.js` - Profile
- `bin/libraries.js` - Profile
- `bin/roles.js` - Profile

## Quality Assurance

All command documentation updates in README.md have been verified to:

- Match the actual command code implementations
- Follow consistent formatting conventions
- Include proper parameter descriptions and type information
- Maintain consistency with existing documentation style
- Use proper default value notation where applicable

## Related Documentation

For comprehensive details about these changes, see:

- [CONSISTENCY_REVIEW_COMPLETE.md](CONSISTENCY_REVIEW_COMPLETE.md) - Full analysis and QA notes
- [COMMAND_CONSISTENCY_ANALYSIS.md](COMMAND_CONSISTENCY_ANALYSIS.md) - Detailed audit findings
- [COMMAND_CONSISTENCY_FIXES.md](COMMAND_CONSISTENCY_FIXES.md) - Implementation details
