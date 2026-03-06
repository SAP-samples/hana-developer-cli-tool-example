# adminHDIGroup

> Command: `adminHDIGroup`  
> Category: **HDI Management**  
> Status: Production Ready

## Description

Add a User as an HDI Group Admin

## Syntax

```bash
hana-cli adminHDIGroup [user] [group] [options]
```

## Aliases

- `adHDIG`
- `adhdig`

## Command Diagram

```mermaid
flowchart TD
    A["hana-cli adminHDIGroup [user] [group]"] --> B["Add a User as an HDI Group Admin"]                
    A --> U["[user]\nUser to be added as HDI Group Admin (string)"]
    A --> G["[group]\nHDI Group to which the user should be added (string)"]    
    A --> C{"Connection Parameters"}
    C --> C1["-a, --admin\nConnect via admin (default-env-admin.json)\nDefault: false"]
    C --> C2["--conn\nConnection filename to override default-env.json"]
    A --> E{"Troubleshooting"}
    E --> E1["--disableVerbose, --quiet\nDisable verbose/extra human-readable output\nUseful for scripting commands\nDefault: false"]
    E --> E2["-d, --debug\nDebug hana-cli with lots of intermediate details\nDefault: false"]
    A --> O{"Options"}
    O --> O1["-h, --help\nShow help"]
```

## Parameters

| Option | Type | Default | Group | Description |
| --- | --- | --- | --- | --- |
| `[user]` | `string` | _(none)_ | Positional Argument | User to be added as HDI Group Admin. |
| `[group]` | `string` | _(none)_ | Positional Argument | HDI Group to which the user should be added. |
| `-a`, `--admin` | `boolean` | `false` | Connection Parameters | Connect via admin (`default-env-admin.json`). |
| `--conn` | `string` | _(none)_ | Connection Parameters | Connection filename to override `default-env.json`. |
| `--disableVerbose`, `--quiet` | `boolean` | `false` | Troubleshooting | Disable verbose output by removing extra human-readable output. Useful for scripting commands. |
| `-d`, `--debug` | `boolean` | `false` | Troubleshooting | Debug `hana-cli` itself by adding lots of intermediate details. |
| `-h`, `--help` | `boolean` | _(none)_ | Options | Show help. |

For a complete list of parameters and options, use:

```bash
hana-cli adminHDIGroup --help
```

## Examples

### Basic Usage

```bash
hana-cli adminHDIGroup HDI_USER myGroup
```

Adds `HDI_USER` as an administrator of the HDI group `myGroup`.

### Using Named Parameters

```bash
hana-cli adminHDIGroup --user HDI_USER --group myGroup
```

Add user as HDI group admin using named option parameters.

### With Admin Connection

```bash
hana-cli adminHDIGroup HDI_USER myGroup --admin
```

Add user as HDI group admin using admin credentials from `default-env-admin.json`.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: HDI Management](..)
- [All Commands A-Z](../all-commands.md)
