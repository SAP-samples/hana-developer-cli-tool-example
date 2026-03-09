# hanaCloudInstances

> Command: `hanaCloudInstances`  
> Category: **HANA Cloud**  
> Status: Production Ready

## Description

List SAP HANA Cloud instances in the current target space, optionally filtered by instance name. The command queries both SAP BTP multi-environment and Cloud Foundry instances and prints status, URLs, and resource details when available.

## Syntax

```bash
hana-cli hc [name] [options]
```

## Aliases

- `hcInstances`
- `instances`
- `listHC`
- `listhc`
- `hcinstances`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli hc]) --> Input{Instance filter}
    Input -->|name / --name| Name["Instance name<br/>Default: **default**"]
    Name --> Fetch["Fetch instances from<br/>BTP and Cloud Foundry"]
    Start --> Options{Troubleshooting}
    Options --> Quiet["--quiet / --disableVerbose"]
    Options --> Debug["--debug"]
    Fetch --> Output["Print instance details<br/>status, URLs, resources"]
    Output --> Complete([Command Complete])

    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style Input fill:#f39c12
    style Options fill:#f39c12
```

## Parameters

### Positional Arguments

| Parameter | Type   | Description                                      |
|-----------|--------|--------------------------------------------------|
| `name`    | string | Instance name filter (default: `**default**`).   |

### Options

| Option    | Alias | Type   | Default        | Description                      |
|-----------|-------|--------|----------------|----------------------------------|
| `--name`  | `-n`  | string | `**default**`  | SAP HANA Cloud instance name.    |

### Troubleshooting

| Option             | Alias     | Type    | Default | Description                                         |
|--------------------|-----------|---------|---------|-----------------------------------------------------|
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable verbose output for script-friendly results. |
| `--debug`          | `-d`      | boolean | `false` | Enable debug output with intermediate details.      |
| `--help`           | `-h`      | boolean | -       | Show help.                                          |

For a complete list of parameters and options, use:

```bash
hana-cli hanaCloudInstances --help
```

## Examples

### Basic Usage

```bash
hana-cli hc --name myInstance
```

List details for a specific SAP HANA Cloud instance.

## Interactive Mode

This command can be run in interactive mode, which prompts for required inputs.

| Parameter | Required | Prompted | Notes                                         |
|-----------|----------|----------|-----------------------------------------------|
| `name`    | Yes      | Always   | Instance name filter (default: `**default**`). |

## Related Commands

Related commands from HANA Cloud:

- `hanaCloudStart` - Start a HANA Cloud instance
- `hanaCloudStop` - Stop a HANA Cloud instance
- `hanaCloudHDIInstances` - List HANA Cloud HDI service instances

See the [Commands Reference](../all-commands.md) for all available commands.

## See Also

- [Category: HANA Cloud](..)
- [All Commands A-Z](../all-commands.md)
