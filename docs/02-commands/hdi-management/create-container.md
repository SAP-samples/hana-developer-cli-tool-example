# createContainer

> Command: `createContainer`  
> Category: **HDI Management**  
> Status: Production Ready

## Description

Create an HDI Container and populate connection details into default-env.json

## Syntax

```bash
hana-cli createContainer [container] [group] [options]
```

## Aliases

- `cc`
- `cCont`

## Command Diagram

```mermaid
flowchart TD
    A["hana-cli createContainer [container] [group]"] --> B["Create an HDI Container and populate connection details into default-env.json"]                
    A --> C["[container]\nHDI Container to be created (string)"]
    A --> G["[group]\nHDI Container Group for the container to be created in (string)"]    
    A --> CP{"Connection Parameters"}
    CP --> CP1["-a, --admin\nConnect via admin (default-env-admin.json)\nDefault: false"]
    CP --> CP2["--conn\nConnection filename to override default-env.json"]
    A --> E{"Troubleshooting"}
    E --> E1["--disableVerbose, --quiet\nDisable verbose/extra human-readable output\nUseful for scripting commands\nDefault: false"]
    E --> E2["-d, --debug\nDebug hana-cli with lots of intermediate details\nDefault: false"]
    A --> O{"Options"}
    O --> O1["-h, --help\nShow help"]
    O --> O2["-s, --save\nSave credentials to default-env.json\nDefault: true"]
    O --> O3["-e, --encrypt, --ssl\nEncrypt connections (required for SAP HANA service for SAP BTP or SAP HANA Cloud)\nDefault: false"]
```

## Parameters

| Option | Type | Default | Group | Description |
| --- | --- | --- | --- | --- |
| `[container]` | `string` | _(none)_ | Positional Argument | HDI Container to be created. |
| `[group]` | `string` | _(none)_ | Positional Argument | HDI Container Group for the container to be created in. |
| `-a`, `--admin` | `boolean` | `false` | Connection Parameters | Connect via admin (`default-env-admin.json`). |
| `--conn` | `string` | _(none)_ | Connection Parameters | Connection filename to override `default-env.json`. |
| `--disableVerbose`, `--quiet` | `boolean` | `false` | Troubleshooting | Disable verbose output by removing extra human-readable output. Useful for scripting commands. |
| `-d`, `--debug` | `boolean` | `false` | Troubleshooting | Debug `hana-cli` itself by adding lots of intermediate details. |
| `-h`, `--help` | `boolean` | _(none)_ | Options | Show help. |
| `-c`, `--container` | `string` | _(none)_ | Options | Container Name. |
| `-g`, `--group` | `string` | `""` | Options | HDI Group. |
| `-s`, `--save` | `boolean` | `true` | Options | Save credentials to `default-env.json`. |
| `-e`, `--encrypt`, `--ssl` | `boolean` | `false` | Options | Encrypt connections (required for SAP HANA service for SAP BTP or SAP HANA Cloud). |

For a complete list of parameters and options, use:

```bash
hana-cli createContainer --help
```

## Examples

### Basic Usage

```bash
hana-cli createContainer --container myContainer
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: HDI Management](..)
- [All Commands A-Z](../all-commands.md)
