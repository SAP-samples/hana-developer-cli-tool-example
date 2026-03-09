# test

> Command: `test`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Diagnostic command used to test CLI plumbing and connection setup.

## Syntax

```bash
hana-cli test [options]
```

## Command Diagram

```mermaid
    graph TD
        Start([hana-cli test]) --> Connect[Create test connection]
        Connect --> Output[Print connection object/result]
        Output --> Complete([Command Complete])

        style Start fill:#0092d1
        style Complete fill:#2ecc71
```

## Aliases

- No aliases

## Parameters

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--help` | `-h` | boolean | `false` | Show command help |

For a complete list of parameters and options, use:

```bash
hana-cli test --help
```

## Examples

### Basic Usage

```bash
hana-cli test
```

Run a quick diagnostic connection test.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
