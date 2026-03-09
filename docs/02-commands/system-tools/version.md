# version

> Command: `version`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Display hana-cli and related tool versions.

## Syntax

```bash
hana-cli version [options]
```

## Command Diagram

```mermaid
    graph TD
        Start([hana-cli version]) --> Gather[Gather local package versions]
        Gather --> CliCheck[Check cf-cli and btp-cli versions]
        CliCheck --> Latest[Fetch latest hana-cli version]
        Latest --> Output[Render version report]
        Output --> Complete([Command Complete])

        style Start fill:#0092d1
        style Complete fill:#2ecc71
```

## Aliases

- `ver`

## Parameters

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--help` | `-h` | boolean | `false` | Show command help |
| `--version` | `-V` | boolean | `false` | Show version command output shortcut |

For a complete list of parameters and options, use:

```bash
hana-cli version --help
```

## Examples

### Basic Usage

```bash
hana-cli version
```

Print local and latest version information.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
