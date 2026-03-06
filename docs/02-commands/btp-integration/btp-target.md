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
flowchart TD
    Start["hana-cli btpTarget"]
    Inputs["Inputs"]
    Debug["Diagnostics options"]
    Fetch["Fetch BTP hierarchy"]
    Current["Include current target (if set)"]
    Output["Output hierarchy JSON"]
    Complete["Command Complete"]

    Start --> Inputs
    Inputs --> Debug
    Inputs --> Fetch
    Fetch --> Current
    Current --> Output
    Output --> Complete
```

## Parameters

### Positional Arguments

None.

### Options

None.

### Connection Parameters

None.

### Troubleshooting

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable Verbose output - removes all extra output that is only helpful to human readable interface. Useful for scripting commands. |
| `--debug` | `-d` | boolean | `false` | Debug hana-cli itself by adding output of LOTS of intermediate details. |

## Examples

### Basic Usage

```bash
hana-cli btpTarget
```

Return the BTP hierarchy data used by the UI.

## Related Commands

- [btp](btp.md)
- [btpInfo](btp-info.md)
- [btpSubs](btp-subs.md)

## See Also

- [Category: BTP Integration](..)
- [All Commands A-Z](../all-commands.md)
