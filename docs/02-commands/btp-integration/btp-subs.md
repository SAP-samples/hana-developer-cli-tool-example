# sub

> Command: `sub`  
> Category: **BTP Integration**  
> Status: Production Ready

## Description

BTP Active Subscriptions and their URL

## Syntax

```bash
hana-cli sub [options]
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
    Start([hana-cli sub]) --> Inputs{Inputs}
    Inputs -->|--debug/--disableVerbose| Debug[Diagnostics options]
    Inputs --> Fetch[Fetch BTP subscriptions]
    Fetch --> Filter[Filter to subscribed apps]
    Filter --> Output[Print app names and URLs]
    Output --> Complete([Command Complete])

    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style Inputs fill:#f39c12
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
hana-cli sub
```

List active BTP subscriptions and their URLs.

## Related Commands

- [btp](btp.md)
- [btpInfo](btp-info.md)
- [hanaCloudInstances](../hana-cloud/hana-cloud-instances.md)

## See Also

- [Category: BTP Integration](..)
- [All Commands A-Z](../all-commands.md)
