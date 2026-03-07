# copy2DefaultEnv

> Command: `copy2DefaultEnv`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Copy .env contents to default-env.json and reformat

## Syntax

```bash
hana-cli copy2DefaultEnv [options]
```

## Command Diagram

```mermaid
    graph TD
        Start([hana-cli copy2DefaultEnv]) --> ReadEnv[Read VCAP_SERVICES from .env]
        ReadEnv --> Validate{HANA service present?}
        Validate -->|No| Error[Return configuration error]
        Validate -->|Yes| Transform[Build default-env.json payload]
        Transform --> WriteFile[Write default-env.json]
        WriteFile --> Complete([Command Complete])

        style Start fill:#0092d1
        style Complete fill:#2ecc71
        style Validate fill:#f39c12
```

## Aliases

- `copyDefaultEnv`
- `copyDefault-Env`
- `copy2defaultenv`
- `copydefaultenv`
- `copydefault-env`

## Parameters

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| - | - | - | - | No command-specific options |

For a complete list of parameters and options, use:

```bash
hana-cli copy2DefaultEnv --help
```

## Examples

### Basic Usage

```bash
hana-cli copy2DefaultEnv
```

Create or update `default-env.json` from the current `VCAP_SERVICES` environment.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
