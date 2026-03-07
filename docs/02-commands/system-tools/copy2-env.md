# copy2Env

> Command: `copy2Env`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Copy default-env.json contents to .env and reformat

## Syntax

```bash
hana-cli copy2Env [options]
```

## Command Diagram

```mermaid
    graph TD
        Start([hana-cli copy2Env]) --> Resolve[Resolve env source file]
        Resolve --> Load[Load VCAP_SERVICES]
        Load --> Write[Write .env with VCAP_SERVICES]
        Write --> Complete([Command Complete])

        style Start fill:#0092d1
        style Complete fill:#2ecc71
```

## Aliases

- `copyEnv`
- `copyenv`
- `copy2env`

## Parameters

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| - | - | - | - | No command-specific options |

For a complete list of parameters and options, use:

```bash
hana-cli copy2Env --help
```

## Examples

### Basic Usage

```bash
hana-cli copy2Env
```

Copy default-env.json contents to .env and reformat

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
