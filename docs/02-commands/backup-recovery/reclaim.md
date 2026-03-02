# reclaim

> Command: `reclaim`  
> Category: **Backup & Recovery**  
> Status: Production Ready

## Description

Reclaim LOB, Log, and Data Volume space

## Syntax

```bash
hana-cli reclaim [options]
```

## Aliases

- No aliases

## Command Diagram

```mermaid
graph TD
    A["🔷 hana-cli reclaim"]
    A --> B["📋 Description: Reclaim LOB, Log, and Data Volume space"]
    B --> C["🔌 Connection Parameters"]
    C --> C1["-a, --admin: Connect via admin"]
    C1 --> C2["--conn: Connection filename override"]
    C2 --> D["🔧 Troubleshooting Options"]
    D --> D1["--disableVerbose, --quiet: Disable verbose output"]
    D1 --> D2["-d, --debug: Debug hana-cli with detailed output"]
    D2 --> E["✅ Help"]
    E --> E1["-h, --help: Show help message"]
    
    style A fill:#0070C0,color:#fff,stroke:#fff,stroke-width:2px
    style B fill:#f39c12,color:#fff,stroke:#fff,stroke-width:2px
    style E1 fill:#51CF66,color:#fff,stroke:#fff,stroke-width:2px
```

## Parameters

### Connection Parameters

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--admin` | `-a` | boolean | `false` | Connect via admin (default-env-admin.json) |
| `--conn` | | string | | Connection filename to override default-env.json |

### Troubleshooting Options

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable verbose output - removes all extra output that is only helpful to human-readable interface. Useful for scripting commands. |
| `--debug` | `-d` | boolean | `false` | Debug hana-cli itself by adding output of LOTS of intermediate details |

### General Options

| Option | Alias | Type | Description |
| --- | --- | --- | --- |
| `--help` | `-h` | boolean | Show help message |

For a complete list of parameters and options, use:

```bash
hana-cli reclaim --help
```

## Examples

### Basic Usage

```bash
hana-cli reclaim
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Backup & Recovery](..)
- [All Commands A-Z](../all-commands.md)
