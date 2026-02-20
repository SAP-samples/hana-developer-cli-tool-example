# btpSubs

> Command: `btpSubs`  
> Category: **BTP Integration**  
> Status: Production Ready

## Description

BTP Active Subscriptions and their URL

## Syntax

```bash
hana-cli btpSubs [options]
```

## Aliases

- `subs`
- `Sub`
- `Subs`
- `btpsub`
- `btpsubs`
- `btpSub`
- `btpSubs`
- `btpsubscriptions`
- `btpSubscriptions`

## Command Diagram

```mermaid
graph TD
    A["hana-cli sub"] --> B["Troubleshooting Options"]
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
hana-cli btpSubs --help
```

## Examples

### Basic Usage

```bash
hana-cli btpSubs
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: BTP Integration](..)
- [All Commands A-Z](../all-commands.md)
