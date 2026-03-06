# opendbx

> Command: `opendbx`  
> Category: **BTP Integration**  
> Status: Production Ready

## Description

Open DB Explorer - a web-based tool for exploring and managing SAP HANA databases. This command opens the DB Explorer in your default web browser, allowing you to interact with your SAP HANA database through a user-friendly interface. You can view database schemas, run SQL queries, and manage database objects directly from the DB Explorer.

### How DB Explorer URL is Determined

The command uses an intelligent two-tier lookup mechanism to find the DB Explorer URL:

1. **HANA Cloud (BTP) Lookup** - First, it attempts to retrieve HANA Cloud service instances from your current BTP subaccount using the SAP BTP CLI. If a HANA Cloud instance is found, the command extracts the DB Explorer URL from the instance's dashboard URL. This approach works even when you're logged into a development space with a remote HANA instance mapping.

2. **On-Premise XSA Fallback** - If the BTP lookup fails or no HANA Cloud instances are found, the command falls back to querying your connected HANA database directly. It retrieves the API URL from the `M_INIFILE_CONTENTS` system view (specifically from `xscontroller.ini`) and uses this to construct the DB Explorer URL. This approach is necessary for on-premise XSA-based HANA systems.

This dual approach ensures compatibility with both SAP HANA Cloud deployments and on-premise HANA instances running on SAP Application Server ABAP (XSA).

## Syntax

```bash
hana-cli opendbx [options]
```

## Aliases

- `open`
- `openDBX`
- `opendb`
- `openDBExplorer`
- `opendbexplorer`
- `dbx`
- `DBX`

## Command Diagram

```mermaid
flowchart TD
    Start["hana-cli opendbx"]
    Inputs["Inputs"]
    Conn["Connection options (fallback)"]
    Debug["Diagnostics options"]
    Lookup["Find DB Explorer URL"]
    BTPURL["Build URL from dashboard"]
    DBQuery["Query M_INIFILE_CONTENTS for xscontroller.ini api_url"]
    Open["Open URL in default browser"]
    Output["Print URL"]
    Complete["Command Complete"]

    Start --> Inputs
    Inputs --> Conn
    Inputs --> Debug
    Inputs --> Lookup
    Lookup --> BTPURL
    Lookup --> DBQuery
    DBQuery --> Conn
    BTPURL --> Open
    Conn --> Open
    Open --> Output
    Output --> Complete
```

## Parameters

### Positional Arguments

None.

### Options

None.

### Connection Parameters

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--admin` | `-a` | boolean | `false` | Connect via admin (default-env-admin.json). |
| `--conn` | - | string | - | Connection filename to override default-env.json. |

### Troubleshooting

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable Verbose output - removes all extra output that is only helpful to human readable interface. Useful for scripting commands. |
| `--debug` | `-d` | boolean | `false` | Debug hana-cli itself by adding output of LOTS of intermediate details. |

## Examples

### Basic Usage

```bash
hana-cli opendbx
```

Open DB Explorer in your default browser.

## Related Commands

- [tables](../object-inspection/tables.md)
- [schemas](../object-inspection/schemas.md)
- [objects](../object-inspection/objects.md)

## See Also

- [Category: BTP Integration](..)
- [All Commands A-Z](../all-commands.md)
