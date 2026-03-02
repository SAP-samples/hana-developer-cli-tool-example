# callProcedure

> Command: `callProcedure`  
> Category: **Developer Tools**  
> Status: Production Ready

## Description

Call a stored procedure and display the results

## Syntax

```bash
hana-cli callProcedure [schema] [procedure] [options]
```

## Aliases

- `cp`
- `callprocedure`
- `callProc`
- `callproc`
- `callSP`
- `callsp`

## Command Diagram

```mermaid
graph TD
    A["hana-cli callProcedure"] --> B["[schema] [procedure]"]
    A --> C["Procedure Options"]
    A --> D["Connection Parameters"]
    A --> E["Troubleshooting"]
    A --> F["Help"]
    
    C --> C1["-p, --procedure, --sp<br/>Stored Procedure<br/>string"]
    C --> C2["-s, --schema<br/>Schema<br/>default: **CURRENT_SCHEMA**"]
    C --> C3["-p, --profile<br/>CDS Profile<br/>string"]
    
    D --> D1["-a, --admin<br/>Connect via admin<br/>default: false"]
    D --> D2["--conn<br/>Connection Filename"]
    
    E --> E1["--disableVerbose, --quiet<br/>Disable Verbose Output<br/>default: false"]
    E --> E2["-d, --debug<br/>Debug Mode<br/>default: false"]
    
    F --> F1["-h, --help<br/>Show Help"]
```

## Parameters

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--procedure` | `--sp`, `-p` | string | - | Stored Procedure to call |
| `--schema` | `-s` | string | `**CURRENT_SCHEMA**` | Schema containing the stored procedure |
| `--profile` | `-p` | string | - | CDS Profile |
| `--admin` | `-a` | boolean | `false` | Connect via admin (default-env-admin.json) |
| `--conn` | - | string | - | Connection filename to override default-env.json |
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable verbose output - useful for scripting commands |
| `--debug` | `-d` | boolean | `false` | Debug hana-cli itself by adding output of LOTS of intermediate details |
| `--help` | `-h` | boolean | - | Show help information |

For a complete list of parameters and options, use:

```bash
hana-cli callProcedure --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli callProcedure --procedure myProc --schema MYSCHEMA
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Developer Tools](..)
- [All Commands A-Z](../all-commands.md)
