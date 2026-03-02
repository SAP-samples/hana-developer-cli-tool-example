# hanaCloudInstances

> Command: `hanaCloudInstances`  
> Category: **HANA Cloud**  
> Status: Production Ready

## Description

List all SAP HANA Cloud instances in your target Space

## Syntax

```bash
hana-cli hc [name] [options]
```

## Aliases

- `hcInstances`
- `instances`
- `listHC`
- `listhc`
- `hcinstances`

## Command Diagram

```mermaid
graph TD
    A["hana-cli hc [name]<br/>List HANA Cloud instances in your target Space"]
    A --> B["-n, --name<br/>SAP HANA Cloud Instance name<br/>default: **default**"]
    A --> C["🛠️ Troubleshooting"]
    C --> C1["--disableVerbose, --quiet<br/>Disable verbose output (script-friendly)"]
    C --> C2["-d, --debug<br/>Debug hana-cli (extra details)"]
    A --> D["-h, --help<br/>Show help"]
    style A fill:#1f6feb,stroke:#0b1f3a,color:#fff
    style D fill:#222,stroke:#555,color:#fff
```

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli hanaCloudInstances --help
```

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable verbose output (removes extra human-readable output; useful for scripting). |
| `--debug` | `-d` | boolean | `false` | Debug hana-cli by adding lots of intermediate details. |
| `--help` | `-h` | boolean | `—` | Show help. |
| `--name` | `-n` | string | `**default**` | SAP HANA Cloud instance name. |

## Examples

### Basic Usage

```bash
hana-cli hc --name myInstance
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: HANA Cloud](..)
- [All Commands A-Z](../all-commands.md)
