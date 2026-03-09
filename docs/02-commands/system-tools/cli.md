# cli

> Command: `hana-cli`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Launcher entrypoint for the hana-cli runtime.

## ⚠️ Redirect Notice

This page documents the CLI launcher behavior. It is not a standalone subcommand entry like `connect` or `tables`.

## Syntax

```bash
hana-cli <command> [options]
```

## Command Diagram

```mermaid
    graph TD
        Start([hana-cli <command>]) --> Parse[Parse argv]
        Parse --> Resolve{Known command/alias?}
        Resolve -->|Yes| LazyLoad[Load mapped module]
        Resolve -->|No| FullIndex[Load command index/help]
        LazyLoad --> Execute[Run yargs command handler]
        FullIndex --> Execute
        Execute --> Complete([Command Complete])

        style Start fill:#0092d1
        style Complete fill:#2ecc71
        style Resolve fill:#f39c12
```

## Aliases

- No aliases

## Parameters

### Positional Arguments

| Parameter | Type | Description |
|-----------|------|-------------|
| `command` | string | Command name or alias to execute |

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--help` | `-h` | boolean | `false` | Show CLI help |
| `--version` | `-V` | boolean | `false` | Show version information (mapped to `version` command) |

For complete global help, use:

```bash
hana-cli --help
```

## Examples

### Basic Usage

```bash
hana-cli --help
```

Show available commands and global options.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
