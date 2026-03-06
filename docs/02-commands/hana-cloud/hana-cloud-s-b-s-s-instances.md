# hanaCloudSBSSInstances

> Command: `hanaCloudSBSSInstances`  
> Category: **HANA Cloud**  
> Status: Production Ready

## Description

List SAP HANA Cloud SBSS service instances in the current target space. By default, the command uses the Cloud Foundry API; set the flag to false to use XS-based service APIs.

## Syntax

```bash
hana-cli sbss [options]
```

## Aliases

- `sbssInstances`
- `sbssinstances`
- `sbssServices`
- `listsbss`
- `sbssservices`
- `sbsss`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli sbss]) --> Mode{Cloud Foundry mode?}
    Mode -->|--cf true| CF["List SBSS instances<br/>via Cloud Foundry"]
    Mode -->|--cf false| XS["List SBSS instances<br/>via XS services"]
    CF --> Output["Display instance list"]
    XS --> Output
    Start --> Options{Troubleshooting}
    Options --> Quiet["--quiet / --disableVerbose"]
    Options --> Debug["--debug"]
    Output --> Complete([Command Complete])

    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style Mode fill:#f39c12
    style Options fill:#f39c12
```

## Parameters

### Options

| Option  | Alias         | Type    | Default | Description                                                     |
|---------|---------------|---------|---------|-----------------------------------------------------------------|
| `--cf`  | `-c`, `--cmd` | boolean | `true`  | Cloud Foundry mode (set to `false` for XS-based service APIs).   |

### Troubleshooting

| Option             | Alias     | Type    | Default | Description                                         |
|--------------------|-----------|---------|---------|-----------------------------------------------------|
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable verbose output for script-friendly results. |
| `--debug`          | `-d`      | boolean | `false` | Enable debug output with intermediate details.      |
| `--help`           | `-h`      | boolean | -       | Show help.                                          |

For a complete list of parameters and options, use:

```bash
hana-cli hanaCloudSBSSInstances --help
```

## Examples

### Basic Usage

```bash
hana-cli sbss --cf
```

List SBSS instances using Cloud Foundry mode.

## Interactive Mode

This command can be run in interactive mode, which prompts for optional inputs.

| Parameter | Required | Prompted | Notes                                           |
|-----------|----------|----------|-------------------------------------------------|
| `cf`      | No       | Always   | Cloud Foundry mode (default: `true`).          |

---

## hanaCloudSBSSInstancesUI (UI Variant)

> Command: `hanaCloudSBSSInstancesUI`  
> Category: **HANA Cloud**  
> Status: Production Ready

### UI Description

Launch the SBSS instances UI for the current target space.

### UI Syntax

```bash
hana-cli sbssUI [options]
```

### UI Aliases

- `sbssInstancesUI`
- `sbssinstancesui`
- `sbssServicesUI`
- `listsbssui`
- `sbssservicesui`
- `sbsssui`

### UI Command Diagram

```mermaid
graph TD
    Start([hana-cli sbssUI]) --> Mode{Cloud Foundry mode?}
    Mode -->|--cf true| CF["Launch UI (Cloud Foundry)"]
    Mode -->|--cf false| XS["Launch UI (XS services)"]
    Start --> Options{Troubleshooting}
    Options --> Quiet["--quiet / --disableVerbose"]
    Options --> Debug["--debug"]
    CF --> Running["UI running in browser"]
    XS --> Running
    Running --> Complete([Command Complete])

    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style Mode fill:#f39c12
    style Options fill:#f39c12
```

### UI Parameters

#### UI Options

| Option  | Alias         | Type    | Default | Description                                                     |
|---------|---------------|---------|---------|-----------------------------------------------------------------|
| `--cf`  | `-c`, `--cmd` | boolean | `true`  | Cloud Foundry mode (set to `false` for XS-based service APIs).   |

#### UI Troubleshooting

| Option             | Alias     | Type    | Default | Description                                         |
|--------------------|-----------|---------|---------|-----------------------------------------------------|
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable verbose output for script-friendly results. |
| `--debug`          | `-d`      | boolean | `false` | Enable debug output with intermediate details.      |
| `--help`           | `-h`      | boolean | -       | Show help.                                          |

For a complete list of parameters and options, use:

```bash
hana-cli sbssUI --help
```

### UI Examples

```bash
hana-cli sbssUI
```

Open the SBSS instances UI.

## Related Commands

Related commands from HANA Cloud:

- `hanaCloudInstances` - List HANA Cloud instances

See the [Commands Reference](../all-commands.md) for all available commands.

## See Also

- [Category: HANA Cloud](..)
- [All Commands A-Z](../all-commands.md)
