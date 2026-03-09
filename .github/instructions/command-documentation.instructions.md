---
description: "Use when creating or updating CLI command documentation in docs/02-commands/. Generates comprehensive markdown files with Mermaid diagrams showing command flow, detailed parameter tables organized by category, syntax examples, and related commands."
applyTo: "docs/02-commands/**/*.md"
---

# CLI Command Documentation Guidelines

When documenting CLI commands for the hana-cli tool, follow this structured format to ensure consistency and completeness.

## Preservation Rule (Do Not Strip Existing Content)

When updating an existing documentation file, **preserve any additional description or educational content already present**.

Only replace or insert content **inside the specific section you are updating**, and do **not** delete other paragraphs, lists, or subsections that provide extra context. This is especially important for Description and Educational Context content that may span multiple paragraphs.

**Practical guidance:**
- Keep all existing descriptive paragraphs unless they directly contradict verified behavior.
- When re-generating sections, update the section body but leave any extra subheadings or explanatory text that belong to the command.
- Never remove sections like “What is …?”, “How is … Used?”, or other narrative blocks unless explicitly asked to delete them.

## Critical: Filename vs Command Name

**The filename is NOT the command name.**

- **Filename**: Uses kebab-case for organization (e.g., `column-stats.md`)
- **Command Name**: Uses camelCase as defined in code (e.g., `columnStats`)
- **Source of Truth**: Always the `export const command` in `bin/[commandName].js`

Example:
```
File:    docs/02-commands/analysis-tools/column-stats.md  ← kebab-case
Command: columnStats  ← camelCase (from bin/columnStats.js)
Help:    hana-cli columnStats [schema] [table]
```

Never assume the command name from the filename. Always verify in the command's source code.

## Document Structure

Every command documentation file must include these sections in order:

### 1. Header Section

```markdown
# commandName

> Command: `commandName`  
> Category: **Category Name**  
> Status: Production Ready | Early Access | Beta | Experimental

## Description

[Clear, concise description of what the command does]

[Optional: Extended explanation with context, use cases, and background information]
```

**Status Guidelines:**
- **Production Ready**: Stable, fully tested, recommended for production
- **Early Access**: Functional but may have minor issues  
- **Beta**: Testing phase, may change
- **Experimental**: New feature, use with caution

### 2. Syntax Section

```markdown
## Syntax

\`\`\`bash
hana-cli commandName [arg1] [arg2] [options]
\`\`\`

## Aliases

- `alias1`
- `alias2`
- `alias3`
```

### 3. Command Diagram Section

Create a Mermaid flowchart diagram showing the command's logic flow, decision points, and parameters.

**Diagram Guidelines:**

```markdown
## Command Diagram

\`\`\`mermaid
graph TD
    Start([hana-cli commandName]) --> Input{Input Parameters}
    Input -->|param1| Param1[Parameter 1<br/>Description]
    Input -->|param2| Param2[Parameter 2<br/>Description]
    
    Param1 --> Process[Processing Step]
    Param2 --> Process
    
    Process --> Options{Options}
    Options -->|--option1| Opt1[Option 1 Behavior<br/>Details]
    Options -->|--option2| Opt2[Option 2 Behavior<br/>Details]
    
    Opt1 --> Output[Generate Output]
    Opt2 --> Output
    
    Output --> Complete([Command Complete])
    
    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style Options fill:#f39c12
\`\`\`
```

**Visual Style Rules:**
- **Start node**: Use `([text])` with blue fill `#0092d1`
- **End node**: Use `([text])` with green fill `#2ecc71`
- **Decision nodes**: Use `{text}` with orange fill `#f39c12`
- **Process nodes**: Use `[text]` with default styling
- **Optional steps**: Use `[text]` with purple fill `#9b59b6`
- **Multi-line labels**: Use `<br/>` for line breaks within nodes

**Complexity Guidelines:**
- **Simple commands**: Focus on main flow with 5-10 nodes
- **Complex commands**: Show decision trees, filters, and transformations with 15-30 nodes
- Always show: start → inputs → processing → options → output → completion

### 4. Parameters Section

Organize parameters into subsections by type. Always include these standard sections:

```markdown
## Parameters

### Positional Arguments

| Parameter | Type   | Description                                    |
|-----------|--------|------------------------------------------------|
| `arg1`    | string | Description of the first positional argument  |
| `arg2`    | string | Description of the second positional argument |

### Options

| Option        | Alias     | Type    | Default  | Description                                      |
|---------------|-----------|---------|----------|--------------------------------------------------|
| `--option1`   | `--opt1`  | string  | -        | Description of option1                           |
| `--option2`   | `-o`      | boolean | `false`  | Description of option2                           |
| `--limit`     | `-l`      | number  | `100`    | Maximum number of results                        |

### Connection Parameters

| Option    | Alias | Type    | Default | Description                                          |
|-----------|-------|---------|---------|------------------------------------------------------|
| `--admin` | `-a`  | boolean | `false` | Connect via admin (default-env-admin.json)           |
| `--conn`  | -     | string  | -       | Connection filename to override default-env.json     |

### Troubleshooting

| Option              | Alias     | Type    | Default | Description                                                                                              |
|---------------------|-----------|---------|---------|----------------------------------------------------------------------------------------------------------|
| `--disableVerbose`  | `--quiet` | boolean | `false` | Disable verbose output - removes all extra output that is only helpful to human readable interface       |
| `--debug`           | `-d`      | boolean | `false` | Debug hana-cli itself by adding output of LOTS of intermediate details                                   |
```

**Parameter Table Guidelines:**
- Use backticks for option names and default values
- Show all aliases in the Alias column
- Use `-` for options without aliases or defaults
- Include type information: `string`, `boolean`, `number`, `array`
- Provide clear, actionable descriptions
- Add choices when applicable: "Choices: `option1`, `option2`, `option3`"

**Standard Parameter Categories:**
1. **Positional Arguments**: Required or optional arguments without `--` prefix
2. **Options**: Command-specific options and flags
3. **Connection Parameters**: Database connection options (admin, conn)
4. **Troubleshooting**: Debug, verbose, and logging options

Add additional categories as needed:
- **Filter Options**: For commands with filtering capabilities
- **Output Options**: For commands with multiple output formats
- **Performance Options**: For commands with caching or optimization flags
- **Action Options**: For commands that perform different actions based on a parameter

**Documenting Choices:**
When an option has predefined choices, always include them in the Description column:
```markdown
| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--format` | `-f` | string | `csv` | Output format. Choices: `csv`, `excel`, `json` |
| `--severity` | `-s` | string | `all` | Alert severity level. Choices: `all`, `CRITICAL`, `WARNING`, `INFO` |
```

Verify choices from the source code:
```javascript
format: {
  alias: ['f'],
  choices: ["csv", "excel", "json"],  // ← Document these exactly
  default: "csv",
  type: 'string'
}
```

### 5. Examples Section

```markdown
## Examples

### Basic Usage

\`\`\`bash
hana-cli command --option value
\`\`\`

Description of what this example does.

### Advanced Usage

\`\`\`bash
hana-cli command --schema MYSCHEMA --filter "%" --limit 50
\`\`\`

Description of the advanced example.

### Using with Wildcards

\`\`\`bash
hana-cli command --object "TABLE_%"
\`\`\`

Description showing wildcard usage.

### Interactive Mode

\`\`\`bash
hana-cli interactive --category [category-name]
\`\`\`

Show how the command integrates with interactive mode (when applicable).
```

**Example Guidelines:**
- Start with simplest use case
- Progress to more complex scenarios
- Include real-world examples
- Show common patterns (wildcards, filtering, etc.)
- Add 2-5 examples per command
- **Use actual examples from code**: Extract from the `.example()` calls in `bin/[commandName].js`
- Test every example before including it in documentation

### 6. Related Commands Section

```markdown
## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Category Name](..)
- [All Commands A-Z](../all-commands.md)
```

## Additional Content for Complex Commands

For commands requiring extensive explanation, add these optional sections between Description and Syntax:

### Educational Context

If the command deals with complex concepts:

```markdown
### What is [Concept]?

[Clear explanation of the underlying concept]

### How is [Concept] Used?

[Real-world usage scenarios]

### Real-World Example

[Practical example showing problem and solution]

### What Will [commandName] Tell You?

[List of insights and outputs the command provides]
```

See `calc-view-analyzer.md` for an excellent example of educational documentation.

## Advanced Documentation Patterns

These sections document advanced features and patterns found across commands. Include them when applicable to the command being documented.

### Special Default Values

Document special tokens and dynamic defaults that are resolved at runtime:

```markdown
### Special Default Values

| Token | Resolves To | Description |
|-------|-------------|-------------|
| `**CURRENT_SCHEMA**` | Current user's schema | Used as default for schema parameters |
| `*` | All matches | Wildcard for matching all items |
| `%` | SQL LIKE pattern | Used in SQL LIKE clauses for pattern matching |
```

**Common special defaults:**
- `**CURRENT_SCHEMA**` - Resolves to the connected user's current schema
- `*` - Matches all items (file-system style wildcard)
- `%` - SQL LIKE wildcard (matches zero or more characters)
- Empty string `''` - Explicitly represents empty values
- `-` - No default value (parameter is optional or interactive)

Verify from source code:
```javascript
schema: {
  type: 'string',
  default: '**CURRENT_SCHEMA**',  // ← Document this special token
  desc: baseLite.bundle.getText("schema")
}
```

### Wildcard Pattern Support

Document pattern matching capabilities with concrete examples:

```markdown
## Wildcard Patterns

This command supports wildcard patterns for matching multiple objects:

### Pattern Types

**Asterisk (`*`) - File-system style:**
- `TABLE_*` - Matches: TABLE_A, TABLE_B, TABLE_123
- `*_TEMP` - Matches: USER_TEMP, DATA_TEMP
- `T_*_2024` - Matches: T_SALES_2024, T_INVOICE_2024

**Percent (`%`) - SQL LIKE style:**
- `CUSTOMER%` - Matches: CUSTOMER, CUSTOMERS, CUSTOMER_DATA
- `%_LOG` - Matches: ERROR_LOG, ACCESS_LOG
- `F__T` - Two underscores match exactly 2 characters

### Examples

\`\`\`bash
# Match all tables starting with FACT_
hana-cli tables --table "FACT_*" --schema PRODUCTION

# SQL LIKE pattern matching
hana-cli columnStats --table "CUSTOMER%"

# Combine with other filters
hana-cli export --table "SALES_%" --where "YEAR = 2024"
\`\`\`
```

### Filter and Query Options

For commands that support data filtering, add a dedicated section:

```markdown
### Filter Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--where` | `-w` | string | - | SQL WHERE clause condition (without WHERE keyword) |
| `--orderby` | `-ob` | string | - | SQL ORDER BY clause (without ORDER BY keyword) |
| `--columns` | `-c` | string | - | Comma-separated list of columns to include |
| `--limit` | `-l` | number | `200` | Maximum number of rows to return |

**Usage Examples:**

\`\`\`bash
# Filter with WHERE clause
hana-cli export --table ORDERS --where "STATUS = 'PENDING'"

# Order results
hana-cli export --table CUSTOMERS --orderby "LAST_NAME ASC, FIRST_NAME ASC"

# Select specific columns
hana-cli export --table PRODUCTS --columns "ID,NAME,PRICE"

# Combine filters
hana-cli export --table SALES \\
  --where "AMOUNT > 1000" \\
  --orderby "AMOUNT DESC" \\
  --limit 100
\`\`\`
```

Verify these options exist in the command's builder before documenting them.

### Output Format Options

For commands with multiple output formats, document them clearly:

```markdown
### Output Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--format` | `-f` | string | `csv` | Output format. Choices: `csv`, `excel`, `json` |
| `--output` | `-o` | string | - | Output file path (omit for stdout) |
| `--delimiter` | `-d` | string | `,` | CSV delimiter character |
| `--includeHeaders` | `-ih` | boolean | `true` | Include column headers in output |
| `--nullValue` | `-nv` | string | `''` | String representation for NULL values |

**Format-Specific Behavior:**

**CSV Format (`--format csv`):**
- Delimiter configurable via `--delimiter`
- Headers controlled by `--includeHeaders`
- NULL values represented by `--nullValue` setting

**Excel Format (`--format excel`):**
- Creates .xlsx file with formatted columns
- Always includes headers
- NULL values shown as empty cells

**JSON Format (`--format json`):**
- Array of objects (one per row)
- NULL values are JSON `null`
- Column names become object keys
```

### Interactive Mode Integration

All commands support the interactive shell. Document this consistently:

```markdown
## Interactive Mode

This command can be run in interactive mode, which provides:
- Guided parameter prompts
- Command history
- Context-aware suggestions
- Preset management

### Launching Interactive Mode

\`\`\`bash
# General interactive shell
hana-cli interactive

# Filter to specific category
hana-cli interactive --category [category-name]

# Use saved preset
hana-cli interactive --preset mypreset
\`\`\`

### Interactive Prompts

When running this command in interactive mode, you'll be prompted for:

| Parameter | Required | Prompted | Notes |
|-----------|----------|----------|-------|
| `table` | Yes | Always | Must be provided |
| `schema` | No | Always | Defaults to current schema |
| `output` | No | Skipped | Optional parameter not prompted |
```

Verify from `inputPrompts` in source code:
```javascript
export let inputPrompts = {
  table: {
    description: baseLite.bundle.getText("table"),
    type: 'string',
    required: true  // ← Prompted and required
  },
  output: {
    description: baseLite.bundle.getText("output"),
    type: 'string',
    required: false,
    ask: () => false  // ← NOT prompted in interactive mode
  }
}
```

### Action-Based Commands

For commands that perform different actions based on a parameter:

```markdown
## Actions

This command supports multiple actions via the `--action` parameter:

| Action | Description | Additional Parameters |
|--------|-------------|-----------------------|
| `list` | List all items | `--limit` |
| `create` | Create new item | `--name`, `--group` |
| `delete` | Delete existing item | `--id` |
| `acknowledge` | Acknowledge alert | `--id` |

### Action Examples

\`\`\`bash
# List all alerts
hana-cli alerts --action list --severity CRITICAL

# Acknowledge specific alert
hana-cli alerts --acknowledge 12345

# Delete alert
hana-cli alerts --delete 12345
\`\`\`

**Note:** Some actions have dedicated options (e.g., `--acknowledge`) as shortcuts to `--action acknowledge`.
```

Verify from command handler code:
```javascript
export async function handler(argv) {
  // Look for action handling patterns:
  if (argv.acknowledge) {
    await acknowledgeAlert(argv.acknowledge)
    return
  }
  if (argv.delete) {
    await deleteAlert(argv.delete)
    return
  }
  // Standard action parameter
  if (argv.action === 'list') { ... }
}
```

### Environment Variables

Document environment variables that affect command behavior:

```markdown
## Environment Variables

The following environment variables affect this command's behavior:

| Variable | Purpose | Default | Commands Affected |
|----------|---------|---------|-------------------|
| `DEBUG` | Enable debug output globally | `false` | All commands |
| `VCAP_SERVICES` | Cloud Foundry service bindings | - | Connection commands |
| `EDITOR` | Default text editor | `code` | config command |
| `VISUAL` | Alternative text editor | - | config command |

### Usage

\`\`\`bash
# Enable debug mode via environment
DEBUG=hana-cli hana-cli columnStats

# Use specific editor
EDITOR=vim hana-cli config --edit
\`\`\`

**Note:** The `--debug` flag overrides the `DEBUG` environment variable.
```

### Technical Details

For transparency about what the command does internally:

```markdown
## Technical Details

### Database Queries

This command queries the following system views:

| View/Table | Purpose | Permissions Required |
|------------|---------|----------------------|
| `SYS.M_CS_COLUMNS` | Column store statistics | SELECT on system views |
| `SYS.M_TABLES` | Table metadata | SELECT on system views |

### SQL Query Structure

\`\`\`sql
SELECT * FROM SYS.M_CS_COLUMNS 
WHERE SCHEMA_NAME LIKE ? 
  AND TABLE_NAME LIKE ? 
ORDER BY SCHEMA_NAME, TABLE_NAME, COLUMN_NAME
LIMIT ?
\`\`\`

### Permissions Required

- **Basic**: SELECT privilege on system views
- **With `--admin`**: DBA or admin role required
- **Schema access**: SELECT on target schema tables
```

Extract query information from the command's handler function:
```javascript
let query = `SELECT * FROM SYS.M_CS_COLUMNS WHERE SCHEMA_NAME LIKE ? AND TABLE_NAME LIKE ?`
```

### Performance Considerations

Document performance implications and best practices:

```markdown
## Performance Considerations

### Query Performance

- **Large tables**: Use `--limit` to restrict result set size (default: 200)
- **Timeout**: Long queries can be constrained with `--timeout` (default: 3600 seconds)
- **Sample size**: Use `--sampleSize` for analysis of data subsets (default: 10000)
- **Wildcards**: Broad patterns (`%` or `*`) may scan many objects

### Optimization Tips

\`\`\`bash
# Limit results for faster response
hana-cli columnStats --limit 50

# Increase timeout for large analysis
hana-cli dataProfile --timeout 7200

# Use sampling for large tables
hana-cli dataProfile --sampleSize 50000
\`\`\`

### Resource Impact

- **Memory**: Analysis of large tables may use significant memory
- **CPU**: Statistical calculations can be CPU-intensive
- **I/O**: Full table scans required for some operations

**Recommendation:** Run resource-intensive operations during off-peak hours.
```

### Limits and Constraints

Document safety limits and validation rules:

```markdown
## Limits and Constraints

### Query Limits

| Limit Type | Default | Maximum | Configurable Via |
|------------|---------|---------|------------------|
| Result rows | 200 | 1,000,000 | `--limit` |
| Timeout | 3600s | - | `--timeout` |
| Sample size | 10,000 | - | `--sampleSize` |

### Validation Rules

- **SQL injection protection**: All parameters are validated and sanitized
- **Schema names**: Must follow HANA naming conventions
- **Table names**: Support wildcards but validate pattern syntax
- **Numeric limits**: Must be positive integers

### Error Conditions

\`\`\`bash
# Invalid limit (too high)
hana-cli export --limit 999999999
# Error: Limit exceeds maximum allowed value

# SQL injection attempt
hana-cli tables --schema "'; DROP TABLE --"
# Error: Invalid schema name format
\`\`\`
```

Verify limits from source code:
```javascript
const limit = base.validateLimit(prompts.limit)  // ← Has validation logic
maxRows: {
  type: 'number',
  default: 1000000,  // ← Document this maximum
  desc: baseLite.bundle.getText("exportMaxRows")
}
```

### Error Handling and Exit Codes

Document error behavior clearly:

```markdown
## Error Handling

### Exit Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `0` | Success | Command completed without errors |
| `1` | Error | Connection failed, invalid parameters, query error |

### Error Messages

**Connection Errors:**
\`\`\`
Error: Unable to connect to database
→ Check connection parameters in default-env.json
→ Verify database is running and accessible
\`\`\`

**Parameter Errors:**
\`\`\`
Error: Invalid schema name format
→ Schema names must follow HANA naming conventions
→ Check for special characters or SQL injection patterns
\`\`\`

**Query Errors:**
\`\`\`
Error: Insufficient privileges
→ User lacks SELECT privilege on system views
→ Use --admin flag for admin connection
\`\`\`

### Debug Mode

For detailed error information:

\`\`\`bash
hana-cli [command] --debug
\`\`\`

Debug mode provides:
- Full stack traces
- Intermediate query results
- Connection details
- Parameter validation steps
```

### Alias Documentation

Expand alias documentation to show all forms:

```markdown
## Aliases

This command has the following aliases:

| Alias | Type | Usage |
|-------|------|-------|
| `prof` | Short form | Quick typing |
| `profileData` | Descriptive | Self-documenting |
| `dataStats` | Alternative | Common terminology |

All aliases have identical functionality and parameters.

### Examples

\`\`\`bash
# All these commands are equivalent:
hana-cli dataProfile --table CUSTOMERS
hana-cli prof --table CUSTOMERS
hana-cli profileData --table CUSTOMERS
hana-cli dataStats --table CUSTOMERS
\`\`\`
```

Verify from source code:
```javascript
export const aliases = ['prof', 'profileData', 'dataStats']
```

**Important:** If `aliases` array is empty (`[]`), remove the entire Aliases section.

## Validation Requirements

**Every command documentation must be validated against the actual implementation.**

Do NOT infer, guess, or assume anything about command behavior, parameters, or aliases. 
Every detail must be verified using one or more of these sources:

### 1. Command Implementation Source Code

**Primary source:** `bin/[commandName].js`

Verify these elements directly from the code:

**Command Name & Aliases:**
```javascript
export const command = 'columnStats [schema] [table]'
export const aliases = []  // Empty array = no aliases
```
- ✓ Command name must match exactly (camelCase)
- ✓ Aliases array may be empty (remove Aliases section if so)
- ✓ Do NOT infer aliases from filename patterns or naming conventions

**Parameters, Types & Defaults:**
```javascript
export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  table: {
    alias: ['t'],
    type: 'string',
    default: "*",
    desc: baseLite.bundle.getText("table")
  },
  schema: {
    alias: ['s'],
    type: 'string',
    default: '**CURRENT_SCHEMA**',
    desc: baseLite.bundle.getText("schema")
  },
  // ... all options MUST be documented
}))
```

For each parameter, verify:
- ✓ Option name: From `table:`, `schema:` keys → becomes `--table`, `--schema`
- ✓ Aliases: From `alias: ['t']` → becomes `-t` or `--t` as applicable
- ✓ Type: From `type: 'string'|'number'|'boolean'` → must match table
- ✓ Default value: From `default: "*"` → document exactly as shown
- ✓ Description: From `baseLite.bundle.getText("table")` → verify translation key exists

### 2. Command Help Output

**Run the command to verify:**
```bash
cd /path/to/hana-developer-cli-tool-example
hana-cli [commandName] --help
# or
hana-cli [commandName] -h
```

Use the help output to verify:
- ✓ All options listed in documentation match help output
- ✓ Aliases shown in help match documentation
- ✓ Default values match what's shown
- ✓ Option descriptions are consistent with code

### 3. Related Commands & Category

**Verify from command implementation:**
```javascript
.epilog(buildDocEpilogue('columnStats', 'performance-monitoring', 
  ['tables', 'inspectTable', 'tableHotspots']))
```

The last parameter array lists related commands. Verify:
- ✓ Related commands are correctly identified from code
- ✓ Category slug in `buildDocEpilogue` is correct
- ✓ Links to related commands work and are relevant

### Validation Checklist

Before finalizing any command documentation:

**Header Section:**
- [ ] Command name matches exactly from `bin/[commandName].js`
- [ ] Category is verified from command context
- [ ] Status is accurate and matches actual command maturity

**Syntax Section:**
- [ ] Syntax matches `export const command = '...'` exactly
- [ ] Aliases list only commands from `export const aliases = [...]`
- [ ] If aliases array is empty, remove the Aliases section entirely
- [ ] No inferred or hypothetical aliases are included

**Parameters Section:**
- [ ] Every option in table comes from `builder` in source code
- [ ] Types match: `type: 'string'` → `string`, `type: 'number'` → `number`, etc.
- [ ] Aliases match exactly from `alias: ['t']` format
- [ ] Default values are exact matches from `default: value`
- [ ] Descriptions are verified and consistent with actual behavior
- [ ] No made-up parameters or options are included
- [ ] Parameter order follows: Positional Args → Options → Connection → Troubleshooting

**Examples Section:**
- [ ] All example commands are tested and work
- [ ] Examples can be run against actual command
- [ ] Terminal output in descriptions matches actual output
- [ ] No fictional or hypothetical examples

**Implementation-Specific Validations:**

For Connection Parameters specifically:
- [ ] `--admin` and `--conn` params are verified if command uses them
- [ ] These only appear in commands that actually connect to database
- [ ] Default values match what's in implementation

For Troubleshooting parameters:
- [ ] `--debug` is only listed if `--debug` exists in command code
- [ ] `--disableVerbose` or `--quiet` only if they're actual params
- [ ] Description of each troubleshooting option is accurate

**Advanced Pattern Validations:**

For commands with choices:
- [ ] All `choices` arrays from builder are documented in Description column
- [ ] Format: "Choices: `option1`, `option2`, `option3`"
- [ ] No undocumented choices are included

For commands with special defaults:
- [ ] Special tokens like `**CURRENT_SCHEMA**` are documented exactly
- [ ] Wildcard defaults (`*`, `%`) are explained in Special Default Values section
- [ ] Empty string `''` defaults are explicitly noted

For commands with output formats:
- [ ] All format choices are documented with behavior differences
- [ ] Format-specific options are grouped in Output Options section
- [ ] Examples show usage of each supported format

For commands with filters:
- [ ] `--where`, `--orderby`, `--columns` options verified from builder
- [ ] Filter Options section includes usage examples
- [ ] SQL clause syntax is documented (with/without keywords)

For commands with actions:
- [ ] All action types are verified from handler code
- [ ] Action-specific parameters are documented per action
- [ ] Shortcut options (e.g., `--acknowledge`) are cross-referenced

For commands with env variables:
- [ ] Environment variable usage is verified from source code
- [ ] Interaction between env vars and CLI flags is documented
- [ ] Precedence rules are clear (flag vs. env var)

For commands with interactive mode:
- [ ] `inputPrompts` object is consulted for required/optional params
- [ ] `ask: () => false` skipped prompts are documented
- [ ] Required vs. optional distinction matches code

For performance-sensitive commands:
- [ ] Default limits are verified from code
- [ ] Maximum values are documented from validation logic
- [ ] Timeout defaults are confirmed
- [ ] Sample size parameters are accurate

### Verification Tools

**Visual Verification:**
1. Run command help: `hana-cli [commandName] --help`
2. Test each example in documentation
3. Compare help output with documentation table
4. Test with invalid options to understand error messages

**Code Review:**
1. Open `bin/[commandName].js` side-by-side with documentation
2. Check each builder option is documented
3. Verify aliases array contents
4. Check related commands in `epilog()` function
5. Review i18n bundle keys for descriptions

### When Documentation Differs from Help

If your documentation contradicts the help text or code:
1. **The code is the source of truth** - update documentation to match
2. Never change code to match documentation
3. If help text has errors, fix both code AND documentation
4. Document any known discrepancies in a "Known Issues" section

## Common Mistakes to Avoid

❌ **DON'T**: Infer aliases from filename or naming conventions
```javascript
// DON'T do this:
// File: column-stats.md
// Guessed aliases: column-stats, col-stats, column-statistics
```
✅ **DO**: Check the actual aliases array in source code
```javascript
// bin/columnStats.js - Line 7
export const aliases = []  // ← No aliases, so remove Aliases section
```

---

❌ **DON'T**: Invent parameters that sound logical
```markdown
// DON'T include these without verifying they exist:
- `--format` (if not in builder options)
- `--output` (if not explicitly defined)
```
✅ **DO**: Document only what's in the builder
```javascript
// Check builder options in bin/[commandName].js
table: { alias: ['t'], type: 'string', ... }
schema: { alias: ['s'], type: 'string', ... }
// ↓ These become rows in the Parameters table
```

---

❌ **DON'T**: Copy-paste descriptions that might be inaccurate
```markdown
// DON'T assume descriptions from other commands
Option: --limit
Description: Maximum number of results to... return?
```
✅ **DO**: Verify descriptions from source code
```javascript
limit: {
  type: 'number',
  default: 200,
  desc: baseLite.bundle.getText("limit")  // ← Look up in i18n bundle
}
```

---

❌ **DON'T**: Skip validating examples
```bash
# DON'T just write examples without testing:
hana-cli columnStats --unknownOption value
```
✅ **DO**: Test every example
```bash
# Test in terminal first:
hana-cli columnStats --schema MYSCHEMA -t MY_TABLE
# Verify it works before adding to documentation
```

---

❌ **DON'T**: Document parameters you think might be useful
```markdown
// DON'T include:
- `--dryRun` (if it's not in the source code)
- `--force` (if command doesn't implement it)
```
✅ **DO**: Only document what's implemented
```javascript
// If builder doesn't have these options:
export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  table: { ... },
  schema: { ... }
  // ← Only document: table, schema, limit, profile (and connection/troubleshooting)
}))
```

---

❌ **DON'T**: Assume default values
```markdown
// DON'T guess:
Default: 100
Default: empty string
Default: current directory
```
✅ **DO**: Copy the exact default from code
```javascript
limit: {
  type: 'number',
  default: 200,  // ← Exact match: "200" not "100"
}
schema: {
  type: 'string',
  default: '**CURRENT_SCHEMA**',  // ← Exact string, including **
}
```

## Quality Checklist

Before completing command documentation, verify:

**Source Code Validation:**
- [ ] Opened `bin/[commandName].js` to review implementation
- [ ] Ran `hana-cli [commandName] --help` to verify help output
- [ ] Tested at least 2-3 examples from documentation

**Header & Description:**
- [ ] Command name matches exactly from source code (camelCase)
- [ ] Category matches actual command context
- [ ] Status accurately reflects command maturity
- [ ] Description is clear and explains what command does
- [ ] Optional educational context is accurate and helpful

**Syntax & Aliases:**
- [ ] Syntax matches `export const command` from source exactly
- [ ] Aliases section only includes items from `export const aliases = [...]`
- [ ] If aliases array is empty, Aliases section is removed
- [ ] Command name in syntax and diagram is consistent

**Parameters Section - MUST VERIFY AGAINST SOURCE:**
- [ ] Every option in documentation exists in builder options
- [ ] No fictional, inferred, or hypothetical parameters added
- [ ] Types exactly match source code: `'string'`, `'number'`, `'boolean'`
- [ ] Default values are exact copies from `default:` in code
- [ ] Aliases match exactly from `alias: [...]` array
- [ ] No aliases are invented or inferred
- [ ] Parameter organization follows standard categories
- [ ] Tables are properly formatted with no alignment errors

**Command Diagram:**
- [ ] Diagram shows actual command flow based on implementation
- [ ] All documented options/parameters appear in diagram
- [ ] Uses proper Mermaid styling (blue start, green end, orange decisions)
- [ ] Node shapes match their types (circles for start/end, diamonds for decisions)

**Examples:**
- [ ] All examples tested and confirmed working
- [ ] Examples use correct command name (camelCase)
- [ ] Syntax in examples matches help output
- [ ] At least 2-3 examples covering basic to advanced usage
- [ ] No fictional or hypothetical examples included

**Related Commands & Links:**
- [ ] Related commands section included
- [ ] Commands listed are verified from code's `epilog()` function
- [ ] All markdown links work and point to existing files
- [ ] Category link is correct

**Advanced Patterns (When Applicable):**
- [ ] Documented all `choices` arrays in parameter descriptions
- [ ] Special default values (`**CURRENT_SCHEMA**`, `*`, `%`) are explained
- [ ] Wildcard pattern support section added if command supports patterns
- [ ] Filter Options section added if command has `--where`, `--orderby`, `--columns`
- [ ] Output Options section added if command has `--format` with multiple choices
- [ ] Interactive Mode section added with verified `inputPrompts` behavior
- [ ] Action Options section added if command has action-based behavior
- [ ] Environment Variables section added if command uses env vars
- [ ] Technical Details section added to explain SQL queries/system views
- [ ] Performance Considerations section added for resource-intensive commands
- [ ] Limits and Constraints section added if command has validation limits
- [ ] Error Handling section added with common error scenarios

## Quick Reference: When to Include Advanced Sections

Use this guide to determine which optional advanced sections to include:

### Include "Special Default Values" Section When:
- Command has `default: '**CURRENT_SCHEMA**'` in builder
- Command uses wildcard defaults like `*` or `%`
- Schema or object parameters have dynamic resolution

### Include "Wildcard Pattern Support" Section When:
- Command accepts table/object patterns with `*` or `%`
- Builder uses `objectName()` helper for pattern matching
- Examples would benefit from showing pattern matching

### Include "Filter Options" Section When:
- Command has `--where`, `--orderby`, or `--columns` options
- SQL filtering is core to command functionality
- Examples show complex query filtering

### Include "Output Options" Section When:
- Command has `--format` with choices like `["csv", "excel", "json"]`
- Command supports `--delimiter`, `--includeHeaders`, `--nullValue`
- Different formats behave differently

### Include "Interactive Mode Integration" Section When:
- Command defines `inputPrompts` with complex behavior
- Some parameters have `ask: () => false` (skipped in interactive)
- Interactive behavior differs from CLI usage

### Include "Action-Based Commands" Section When:
- Handler checks for action-specific options (`if (argv.acknowledge)`)
- Command has `--action` parameter with multiple values
- Command performs fundamentally different operations based on input

### Include "Environment Variables" Section When:
- Code references `process.env.VCAP_SERVICES`
- Code references `process.env.DEBUG`, `process.env.EDITOR`, etc.
- Environment variables affect connection or behavior

### Include "Technical Details" Section When:
- Command queries specific system views (helps with troubleshooting)
- Understanding SQL queries aids in using the command
- Permissions requirements are non-obvious

### Include "Performance Considerations" Section When:
- Command has `--timeout`, `--sampleSize`, or performance-related options
- Command can be resource-intensive (CPU, memory, I/O)
- Large data operations benefit from optimization tips

### Include "Limits and Constraints" Section When:
- Code calls `validateLimit()` or similar validation
- Command has `maxRows`, `maxResults`, or similar limits
- SQL injection protection is relevant to document

### Include "Error Handling" Section When:
- Command has complex error scenarios
- Common errors need troubleshooting guidance
- Exit codes or error message patterns should be documented

## Example Command Documentation Workflow

1. **Identify the command**: Get filename and verify real command name from `bin/[commandName].js`
2. **Extract from source code**:
   - Command name and aliases
   - All builder options with types, defaults, aliases, choices
   - Related commands from `epilog()`
   - Interactive prompts from `inputPrompts`
3. **Run help**: `hana-cli [commandName] --help` and compare with extracted data
4. **Determine advanced sections needed**: Use Quick Reference guide above
5. **Write base sections**: Header, Description, Syntax, Diagram, Parameters
6. **Add applicable advanced sections**: Based on command characteristics
7. **Write examples**: Start simple, add complexity, test each one
8. **Validate**: Use Quality Checklist above
9. **Test**: Run all examples, verify links, check formatting
10. **Review**: Read through as end-user, ensure clarity
- [ ] Internal command links use correct command names

**Markdown Quality:**
- [ ] No MD060 table alignment errors
- [ ] Code blocks use proper syntax highlighting (```bash, ```javascript, etc.)
- [ ] Backticks used correctly for commands, options, and parameters
- [ ] No spelling or grammar errors
- [ ] Consistent terminology throughout

## Common Patterns

### Mass Operations Commands

Commands that perform bulk operations typically include:
- Schema and object parameters with wildcard support
- `--dryRun` option for previewing changes
- `--force` option to skip confirmations
- `--limit` to restrict number of operations
- `--includeSystem` to include system objects

### Analysis Commands

Commands that analyze or inspect typically include:
- Schema and object name parameters
- `--metrics` flag for detailed output
- `--limit` for result pagination
- Output format options
- Filter options

### BTP Integration Commands

Commands interacting with SAP BTP typically include:
- Target organization/space options
- Service instance parameters
- Authentication options
- Output format options

## Writing Style

- **Be concise**: Keep descriptions action-oriented and clear
- **Be specific**: Avoid vague terms like "handles data" - say "exports table data to CSV"
- **Show don't tell**: Use code examples liberally
- **Think user-first**: What problem does this solve? When would someone use this?
- **Be consistent**: Use the same terminology throughout documentation
- **Link generously**: Reference related commands and concepts

## Examples of Excellence

For reference, look at these well-documented commands:
- **Complex command with education**: `docs/02-commands/analysis-tools/calc-view-analyzer.md`
- **Simple command done right**: `docs/02-commands/backup-recovery/backup-list.md`
- **Mass operation pattern**: `docs/02-commands/mass-operations/mass-export.md`

---

**Remember**: Great documentation helps users understand not just *how* to use a command, but *when* and *why* to use it.
