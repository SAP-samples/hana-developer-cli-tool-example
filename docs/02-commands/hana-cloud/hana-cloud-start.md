# hanaCloudStart

> Command: `hanaCloudStart`  
> Category: **HANA Cloud**  
> Status: Production Ready

## Description

Start SAP HANA Cloud instance

## Syntax

```bash
hana-cli hcStart [name] [options]
```

## Aliases

- `hcstart`
- `hc_start`
- `start`

## Command Diagram

```mermaid
graph TD
    A["hana-cli hcStart"] --> B["Options"]
    B --> C["-h, --help<br/>Show help"]
    B --> D["-c, --cf, --cmd<br/>Cloud Foundry?<br/>default: true"]
    B --> E["--disableVerbose, --quiet<br/>Disable Verbose output<br/>default: false"]
    B --> F["-d, --debug<br/>Debug hana-cli<br/>default: false"]
    A --> G["Start SAP HANA Cloud instance"]
```

## Parameters

| Flag | Description | Type | Default |
| --- | --- | --- | --- |
| `-h, --help` | Show help | boolean | - |
| `-n, --name` | SAP HANA Cloud Instance name | string | `**default**` |
| `--disableVerbose, --quiet` | Disable Verbose output - removes all extra output that is only helpful to human readable interface. Useful for scripting commands. | boolean | `false` |
| `-d, --debug` | Debug hana-cli itself by adding output of LOTS of intermediate details | boolean | `false` |

For a complete list of parameters and options, use:

```bash
hana-cli hanaCloudStart --help
```

## Examples

### Basic Usage

```bash
hana-cli hcStart --name myInstance
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: HANA Cloud](..)
- [All Commands A-Z](../all-commands.md)
