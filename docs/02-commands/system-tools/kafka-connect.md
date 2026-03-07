# kafkaConnect

> Command: `kafkaConnect`  
> Category: **System Tools**  
> Status: Production Ready

## Description

The `kafkaConnect` command performs operations related to system tools.

## Syntax

```bash
hana-cli kafkaConnect [options]
```

## Command Diagram

```mermaid
    graph TD
        Start([hana-cli kafkaConnect]) --> Action{action}
        Action -->|list| List[List connectors]
        Action -->|create| Create[Create connector]
        Action -->|delete| Delete[Delete connector]
        Action -->|status| Status[Show status]
        Action -->|test| Test[Test connector]
        Action -->|info| Info[Show connector info]
        List --> Complete([Command Complete])
        Create --> Complete
        Delete --> Complete
        Status --> Complete
        Test --> Complete
        Info --> Complete

        style Start fill:#0092d1
        style Complete fill:#2ecc71
        style Action fill:#f39c12
```

## Aliases

- `kafka`
- `kafkaAdapter`
- `kafkasub`

## Parameters

### Positional Arguments

| Parameter | Type | Description |
|-----------|------|-------------|
| `action` | string | Operation to perform. Choices: `list`, `create`, `delete`, `status`, `test`, `info` |

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--action` | `-a` | string | `list` | Connector action. Choices: `list`, `create`, `delete`, `status`, `test`, `info` |
| `--name` | `-n` | string | - | Connector name |
| `--brokers` | `-b` | string | - | Kafka brokers list |
| `--topic` | `-t` | string | - | Kafka topic |
| `--config` | `-c` | string | - | Configuration file path |

## Examples

### Basic Usage

```bash
hana-cli kafkaConnect
```

For more examples, run:

```bash
hana-cli kafkaConnect --help
```

## Documentation

For detailed command documentation, parameters, and examples, use:

```bash
hana-cli kafkaConnect --help
```

## Related Commands

- [All Commands A-Z](../all-commands.md)
- [Commands Overview](..)

## See Also

- [Category: System Tools](..)
- [Command Reference](../all-commands.md)
