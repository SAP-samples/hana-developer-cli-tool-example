# btp

> Command: `btp`  
> Category: **BTP Integration**  
> Status: Production Ready

## Description

Set the target for commands for the btp CLI to the global account, a directory, or a subaccount. Commands are executed in the specified target, unless you override it using a parameter. If the specified target is part of an account hierarchy, its parents are also targeted, so that if a command is only available on a higher level, it will be executed there.

## Syntax

```bash
hana-cli btp [directory] [subaccount] [options]
```

## Aliases

- `btpTarget`
- `btptarget`
- `btp`

## Command Diagram

```mermaid
graph TD
    A["hana-cli btp"] --> B["Arguments"]
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
hana-cli btp --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli btp --subaccount mySubaccount
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: BTP Integration](..)
- [All Commands A-Z](../all-commands.md)
