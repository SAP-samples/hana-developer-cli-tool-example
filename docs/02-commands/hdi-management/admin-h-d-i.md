# adminHDI

> Command: `adminHDI`  
> Category: **HDI Management**  
> Status: Production Ready

## Description

Create an Admin User for HDI or assign HDI admin privileges to an existing user

## Syntax

```bash
hana-cli adminHDI [user] [password] [options]
```

## Aliases

- `adHDI`
- `adhdi`

## Command Diagram

```mermaid
flowchart TD
    A["hana-cli adminHDI [user] [password]"] --> B["Create an Admin User for HDI or assign HDI admin privileges to an existing user"]                
    A --> U["[user]\nUser to be created/assigned as HDI Admin (string)"]
    A --> P["[password]\nPassword for the new HDI Admin user (string)\nNot required if the user already exists and just needs to be assigned HDI Admin privileges"]     
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
| `[user]` | `string` | _(none)_ | Positional Argument | User to be created/assigned as HDI Admin. |
| `[password]` | `string` | _(none)_ | Positional Argument | Password for the new HDI Admin user. Not required if the user already exists and just needs to be assigned HDI Admin privileges. |
| `-a`, `--admin` | `boolean` | `false` | Connection Parameters | Connect via admin (`default-env-admin.json`). |
| `--conn` | `string` | _(none)_ | Connection Parameters | Connection filename to override `default-env.json`. |
| `--disableVerbose`, `--quiet` | `boolean` | `false` | Troubleshooting | Disable verbose output by removing extra human-readable output. Useful for scripting commands. |
| `-d`, `--debug` | `boolean` | `false` | Troubleshooting | Debug `hana-cli` itself by adding lots of intermediate details. |
| `-h`, `--help` | `boolean` | _(none)_ | Options | Show help. |

For a complete list of parameters and options, use:

```bash
hana-cli adminHDI --help
```

## Examples

### Basic Usage

```bash
hana-cli adminHDI --action list
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: HDI Management](..)
- [All Commands A-Z](../all-commands.md)
