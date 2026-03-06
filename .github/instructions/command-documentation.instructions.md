---
description: "Use when creating or updating CLI command documentation in docs/02-commands/. Generates comprehensive markdown files with Mermaid diagrams showing command flow, detailed parameter tables organized by category, syntax examples, and related commands."
applyTo: "docs/02-commands/**/*.md"
---

# CLI Command Documentation Guidelines

When documenting CLI commands for the hana-cli tool, follow this structured format to ensure consistency and completeness.

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
```

**Example Guidelines:**
- Start with simplest use case
- Progress to more complex scenarios
- Include real-world examples
- Show common patterns (wildcards, filtering, etc.)
- Add 2-5 examples per command

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

## Source of Truth: Command Implementation Files

Always reference the actual command implementation in `bin/[commandName].js` for:
- Command name and aliases
- All parameters and their types
- Default values
- Parameter descriptions from i18n bundles

**Extract parameters from:**
```javascript
export const builder = (yargs) => yargs.options(baseLite.getBuilder({
  schema: {
    alias: ['s'],
    type: 'string',
    desc: baseLite.bundle.getText("schema")
  },
  // ... more options
}))
```

## Quality Checklist

Before completing command documentation, verify:

- [ ] Header includes command name, category, and status
- [ ] Description is clear and comprehensive
- [ ] Syntax block shows correct command structure
- [ ] All aliases are listed
- [ ] Mermaid diagram shows complete command flow
- [ ] Diagram uses proper styling (colored nodes, proper shapes)
- [ ] All parameters from bin/*.js are documented
- [ ] Parameters are organized into logical categories
- [ ] Parameter tables include all columns (Option, Alias, Type, Default, Description)
- [ ] At least 2-3 practical examples provided
- [ ] Related commands section included
- [ ] All markdown links are working
- [ ] Code blocks use proper syntax highlighting

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
