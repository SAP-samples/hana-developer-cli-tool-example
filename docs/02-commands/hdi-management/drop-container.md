# dropContainer

> Command: `dropContainer`  
> Category: **HDI Management**  
> Status: Production Ready

## Description

Drop HDI container and clean up HDI Container users

## Syntax

```bash
hana-cli dropContainer [container] [group] [options]
```

## Aliases

- `dc`
- `dropC`

## Command Diagram

```mermaid
flowchart TD
    A["hana-cli dropContainer [container] [group]"] --> B["Drop HDI container and clean up HDI Container users"]                
    A --> C["[container]\nHDI Container to be dropped (string)"]    
    A --> G["[group]\nHDI Container Group for the container to be dropped in (string)"]    
    A --> CP{"Connection Parameters"}
    CP --> CP1["-a, --admin\nConnect via admin (default-env-admin.json)\nDefault: false"]
    CP --> CP2["--conn\nConnection filename to override default-env.json"]
    A --> E{"Troubleshooting"}
    E --> E1["--disableVerbose, --quiet\nDisable verbose/extra human-readable output\nUseful for scripting commands\nDefault: false"]
    E --> E2["-d, --debug\nDebug hana-cli with lots of intermediate details\nDefault: false"]
    A --> O{"Options"}
    O --> O1["-h, --help\nShow help"]
    O --> O2["-c, --container\nContainer Name (string)"]
    O --> O3["-g, --group\nHDI Group\nDefault: empty string"]
```

## Parameters

| Option | Type | Default | Group | Description |
| --- | --- | --- | --- | --- |
| `[container]` | `string` | _(none)_ | Positional Argument | HDI Container to be dropped. |
| `[group]` | `string` | _(none)_ | Positional Argument | HDI Container Group for the container to be dropped in. |
| `-a`, `--admin` | `boolean` | `false` | Connection Parameters | Connect via admin (`default-env-admin.json`). |
| `--conn` | `string` | _(none)_ | Connection Parameters | Connection filename to override `default-env.json`. |
| `--disableVerbose`, `--quiet` | `boolean` | `false` | Troubleshooting | Disable verbose output by removing extra human-readable output. Useful for scripting commands. |
| `-d`, `--debug` | `boolean` | `false` | Troubleshooting | Debug `hana-cli` itself by adding lots of intermediate details. |
| `-h`, `--help` | `boolean` | _(none)_ | Options | Show help. |
| `-c`, `--container` | `string` | _(none)_ | Options | Container Name. |
| `-g`, `--group` | `string` | `""` | Options | HDI Group. |

For a complete list of parameters and options, use:

```bash
hana-cli dropContainer --help
```

## Examples

### Basic Usage

```bash
hana-cli dropContainer --container myContainer
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: HDI Management](..)
- [All Commands A-Z](../all-commands.md)
