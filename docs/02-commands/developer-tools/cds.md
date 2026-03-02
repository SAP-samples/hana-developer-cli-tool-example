# cds

> Command: `cds`  
> Category: **Developer Tools**  
> Status: Production Ready

## Description

Display a DB object via CDS

## Syntax

```bash
hana-cli cds [schema] [table] [options]
```

## Aliases

- `cdsPreview`

## Command Diagram

```mermaid
graph TD
    A[hana-cli cds [schema] [table]]
    A --> C1[Connection Parameters]
    C1 --> C2[-a, --admin<br/>Connect via admin (default-env-admin.json)]
    C1 --> C3[--conn<br/>Connection Filename to override default-env.json]
    A --> T1[Troubleshooting]
    T1 --> T2[--disableVerbose, --quiet<br/>Disable Verbose output - removes all extra output that is only helpful to human readable interface. Useful for scripting commands.]
    T1 --> T3[-d, --debug<br/>Debug hana-cli itself by adding output of LOTS of intermediate details]
    A --> O1[Options]
    O1 --> O2[-h, --help<br/>Show help]
    O1 --> O3[-t, --table<br/>Database Table]
    O1 --> O4[-s, --schema<br/>schema (default: **CURRENT_SCHEMA**)]
    O1 --> O5[-v, --view<br/>CDS processing for View instead of Table]
    O1 --> O6[--useHanaTypes, --hana<br/>Use SAP HANA-Specific Data Types (See https://cap.cloud.sap/docs/cds/cdl#predefined-types)]
    O1 --> O7[-q, --useQuoted, --quoted<br/>Use Quoted Identifiers ![non-identifier]]
    O1 --> O8[-p, --port<br/>Port to run HTTP server for CDS preview]
    O1 --> O9[--profile, --pr<br/>CDS Profile]
```

## Parameters

### Connection Parameters

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--admin` | `-a` | boolean | `false` | Connect via admin (default-env-admin.json) |
| `--conn` | — | string | — | Connection Filename to override default-env.json |

### Troubleshooting

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable Verbose output - removes all extra output that is only helpful to human readable interface. Useful for scripting commands. |
| `--debug` | `-d` | boolean | `false` | Debug hana-cli itself by adding output of LOTS of intermediate details |

### Options

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--help` | `-h` | boolean | — | Show help |
| `--table` | `-t` | string | — | Database Table |
| `--schema` | `-s` | string | **CURRENT_SCHEMA** | schema |
| `--view` | `-v` | boolean | `false` | CDS processing for View instead of Table |
| `--useHanaTypes` | `--hana` | boolean | `false` | Use SAP HANA-Specific Data Types (see [predefined types](https://cap.cloud.sap/docs/cds/cdl#predefined-types)) |
| `--useQuoted` | `-q`, `--quoted` | boolean | `false` | Use Quoted Identifiers ![non-identifier] |
| `--port` | `-p` | number | `false` | Port to run HTTP server for CDS preview |
| `--profile` | `--pr` | string | — | CDS Profile |

## Examples

### Basic Usage

```bash
hana-cli cds --table myTable --schema MYSCHEMA
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Developer Tools](..)
- [All Commands A-Z](../all-commands.md)
