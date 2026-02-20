# connections

> Command: `connections`  
> Category: **Connection & Auth**  
> Status: Production Ready

## Description

Active connection details and statistics. This command requires access to system session monitoring views (M_SESSIONS) which are not available in HDI container schemas. Connect to the SYSTEMDB to view active connections.

## Syntax

```bash
hana-cli connections [options]
```

## Aliases

- `conn`
- `c`

## Command Diagram

```mermaid
graph TD
    A["hana-cli connections"] --> B["Connection Parameters"]
    A --> C["Filter Options"]
    A --> D["Troubleshooting"]
    A --> E["Help"]
    
    B --> B1["-a, --admin<br/>Connect via admin<br/>default: false"]
    B --> B2["--conn<br/>Connection Filename"]
    
    C --> C1["-l, --limit<br/>Limit results<br/>default: 100"]
    C --> C2["-u, --user<br/>Filter by user"]
    C --> C3["-a, --application<br/>Filter by application name"]
    C --> C4["-i, --idle<br/>Include idle connections<br/>default: false"]
    
    D --> D1["--disableVerbose<br/>Disable Verbose Output"]
    D --> D2["-d, --debug<br/>Debug Mode"]
    
    E --> E1["-h, --help<br/>Show Help"]
```

## Parameters

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--admin` | `-a` | boolean | `false` | Connect via admin (default-env-admin.json) |
| `--conn` | - | string | - | Connection filename to override default-env.json |
| `--limit` | `-l` | number | `100` | Limit number of results |
| `--user` | `-u` | string | - | Filter connections by user |
| `--application` | `-a` | string | - | Filter connections by application name |
| `--idle` | `-i` | boolean | `false` | Include idle connections |
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable verbose output - useful for scripting |
| `--debug` | `-d` | boolean | `false` | Debug hana-cli itself with detailed intermediate output |
| `--help` | `-h` | boolean | - | Show help information |

For a complete list of parameters and options, use:

```bash
hana-cli connections --help
```

## Examples

### Basic Usage

```bash
hana-cli connections
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Connection & Auth](..)
- [All Commands A-Z](../all-commands.md)
