# dropGroup

> Command: `dropGroup`  
> Category: **HDI Management**  
> Status: Production Ready

## Description

Drop a container group

## Syntax

```bash
hana-cli dropGroup [group] [options]
```

## Aliases

- `dg`
- `dropG`

## Command Diagram

```mermaid
flowchart TD
    A["hana-cli dropGroup [group]"] --> B["Drop a container group"]                
    A --> G["[group]\nHDI Container Group to be dropped (string)"]    
    A --> C{"Connection Parameters"}
    C --> C1["-a, --admin\nConnect via admin (default-env-admin.json)\nDefault: false"]
    C --> C2["--conn\nConnection filename to override default-env.json"]
    A --> E{"Troubleshooting"}
    E --> E1["--disableVerbose, --quiet\nDisable verbose/extra human-readable output\nUseful for scripting commands\nDefault: false"]
    E --> E2["-d, --debug\nDebug hana-cli with lots of intermediate details\nDefault: false"]
    A --> O{"Options"}
    O --> O1["-h, --help\nShow help"]
    O --> O2["-g, --group\nHDI Group (string)"]
```

## Parameters

| Option | Type | Default | Group | Description |
| --- | --- | --- | --- | --- |
| `[group]` | `string` | _(none)_ | Positional Argument | HDI Container Group to be dropped. |
| `-a`, `--admin` | `boolean` | `false` | Connection Parameters | Connect via admin (`default-env-admin.json`). |
| `--conn` | `string` | _(none)_ | Connection Parameters | Connection filename to override `default-env.json`. |
| `--disableVerbose`, `--quiet` | `boolean` | `false` | Troubleshooting | Disable verbose output by removing extra human-readable output. Useful for scripting commands. |
| `-d`, `--debug` | `boolean` | `false` | Troubleshooting | Debug `hana-cli` itself by adding lots of intermediate details. |
| `-h`, `--help` | `boolean` | _(none)_ | Options | Show help. |
| `-g`, `--group` | `string` | _(none)_ | Options | HDI Group. |

For a complete list of parameters and options, use:

```bash
hana-cli dropGroup --help
```

## Examples

### Basic Usage

```bash
hana-cli dropGroup myGroup
```

Drops the HDI container group named `myGroup`.

### Using Named Parameter

```bash
hana-cli dropGroup --group myGroup
```

Drop container group using named option parameter.

### With Admin Connection

```bash
hana-cli dropGroup myGroup --admin
```

Drop container group using admin credentials from `default-env-admin.json`.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: HDI Management](..)
- [All Commands A-Z](../all-commands.md)
