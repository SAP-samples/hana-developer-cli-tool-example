# createContainerUsers

> Command: `createContainerUsers`  
> Category: **HDI Management**  
> Status: Production Ready

## Description

Create new HDI Container technical users for an existing container and populates connection details into default-env.json

## Syntax

```bash
hana-cli createContainerUsers [container] [options]
```

## Aliases

- `ccu`
- `cContU`

## Command Diagram

```mermaid
flowchart TD
    A["hana-cli createContainerUsers [container]"] --> B["Create new HDI Container technical users for an existing container and populates connection details into default-env.json"]                
    A --> C["[container]\nHDI Container for which to create users (string)"]    
    A --> CP{"Connection Parameters"}
    CP --> CP1["-a, --admin\nConnect via admin (default-env-admin.json)\nDefault: false"]
    CP --> CP2["--conn\nConnection filename to override default-env.json"]
    A --> E{"Troubleshooting"}
    E --> E1["--disableVerbose, --quiet\nDisable verbose/extra human-readable output\nUseful for scripting commands\nDefault: false"]
    E --> E2["-d, --debug\nDebug hana-cli with lots of intermediate details\nDefault: false"]
    A --> O{"Options"}
    O --> O1["-h, --help\nShow help"]
```

## Parameters

| Option | Type | Default | Group | Description |
| --- | --- | --- | --- | --- |
| `[container]` | `string` | _(none)_ | Positional Argument | HDI Container for which to create users. |
| `-a`, `--admin` | `boolean` | `false` | Connection Parameters | Connect via admin (`default-env-admin.json`). |
| `--conn` | `string` | _(none)_ | Connection Parameters | Connection filename to override `default-env.json`. |
| `--disableVerbose`, `--quiet` | `boolean` | `false` | Troubleshooting | Disable verbose output by removing extra human-readable output. Useful for scripting commands. |
| `-d`, `--debug` | `boolean` | `false` | Troubleshooting | Debug `hana-cli` itself by adding lots of intermediate details. |
| `-h`, `--help` | `boolean` | _(none)_ | Options | Show help. |
| `-c`, `--container` | `string` | _(none)_ | Options | Container Name. |
| `-s`, `--save` | `boolean` | `true` | Options | Save credentials to `default-env.json`. |
| `-e`, `--encrypt`, `--ssl` | `boolean` | `false` | Options | Encrypt connections (required for SAP HANA service for SAP BTP or SAP HANA Cloud). |

For a complete list of parameters and options, use:

```bash
hana-cli createContainerUsers --help
```

## Examples

### Create Users for Container

```bash
hana-cli createContainerUsers myContainer
```

Creates technical users for the existing HDI container `myContainer` and saves credentials to `default-env.json`.

### Using Named Parameter

```bash
hana-cli createContainerUsers --container myContainer
```

Create container users using named option parameter.

### Without Saving Credentials

```bash
hana-cli createContainerUsers myContainer --save false
```

Creates technical users without saving credentials to `default-env.json`.

### With Encrypted Connection

```bash
hana-cli createContainerUsers myContainer --encrypt
```

Creates users with SSL encryption enabled (required for SAP HANA Cloud).

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: HDI Management](..)
- [All Commands A-Z](../all-commands.md)
