# btpTarget

> Command: `btpTarget`  
> Category: **BTP Integration**  
> Status: Production Ready

## Description

Set BTP target subaccount from hierarchy

## Syntax

```bash
hana-cli btpTarget [options]
```

## Aliases

- `btp-ui`

## Command Diagram

```mermaid
graph TD
    A["hana-cli btpTarget"] --> B["Arguments"]
    A --> C["Troubleshooting Options"]
    A --> D["Main Options"]
    
    B --> B1["[directory]<br/>Optional"]
    B --> B2["[subaccount]<br/>Optional"]
    
    C --> C1["--disableVerbose, --quiet<br/>Disable verbose output"]
    C --> C2["-d, --debug<br/>Debug mode"]
    
    D --> D1["--subaccount, --sa<br/>Subaccount ID"]
    D --> D2["-h, --help<br/>Show help"]
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
| `--subaccount` | `--sa` | The ID of the subaccount to be targeted | string | |
| `--help` | `-h` | Show help | boolean | |

For a complete list of parameters and options, use:

```bash
hana-cli btpTarget --help
```

## Examples

### Basic Usage

```bash
hana-cli btpTarget
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: BTP Integration](..)
- [All Commands A-Z](../all-commands.md)
