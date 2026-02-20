# openBAS

> Command: `openBAS`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Open SAP Business Appplication Studio. If your account has SAP Build configured, this command will open the SAP Build launch page instead.

## Syntax

```bash
hana-cli openbas [options]
```

## Aliases

- `openBAS`
- `openBas`
- `build`
- `openBuild`
- `openbuild`
- `openBusinessApplicationStudio`
- `bas`
- `BAS`

## Command Diagram

```mermaid
graph TD
    A["hana-cli openbas"] --> B["Troubleshooting Options"]
    A --> C["Main Options"]
    
    B --> B1["--disableVerbose, --quiet<br/>Disable verbose output"]
    B --> B2["-d, --debug<br/>Debug mode"]
    
    C --> C1["-h, --help<br/>Show help"]
```

## Parameters

### Troubleshooting Options

| Parameter | Aliases | Description | Type | Default |
| --- | --- | --- | --- | --- |
| `--disableVerbose` | `--quiet` | Disable verbose output - removes all extra output that is only helpful for human-readable interface. Useful for scripting commands. | boolean | `false` |
| `--debug` | `-d` | Debug hana-cli itself by adding output of many intermediate details | boolean | `false` |

### Main Options

| Parameter | Aliases | Description | Type | Default |
| --- | --- | --- | --- | --- |
| `--help` | `-h` | Show help | boolean | |

For a complete list of parameters and options, use:

```bash
hana-cli openBAS --help
```

## Examples

### Basic Usage

```bash
hana-cli openBAS
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
