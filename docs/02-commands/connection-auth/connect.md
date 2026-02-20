# connect

> Command: `connect`  
> Category: **Connection & Auth**  
> Status: Production Ready

## Description

Connects to an SAP HANA DB and writes connection information to a default-env-admin.json

## Syntax

```bash
hana-cli connect [user] [password] [options]
```

## Aliases

- `c`
- `login`

## Command Diagram

```mermaid
graph TD
    A["hana-cli connect"] --> B["[user] [password]"]
    A --> C["Connection Options"]
    A --> D["Security Options"]
    A --> E["Output Options"]
    
    C --> C1["-n, --connection<br/>Connection String"]
    C --> C2["-u, --user<br/>User"]
    C --> C3["-p, --password<br/>Password"]
    C --> C4["--userstorekey<br/>HDB User Store Key"]
    
    D --> D1["-e, --encrypt<br/>SSL Encryption"]
    D --> D2["-t, --trustStore<br/>SSL Trust Store"]
    
    E --> E1["-s, --save<br/>Save Credentials<br/>default: true"]
    
    A --> F["Troubleshooting"]
    F --> F1["--disableVerbose<br/>Disable Verbose Output"]
    F --> F2["-d, --debug<br/>Debug Mode"]
    
    A --> G["Help"]
    G --> G1["-h, --help<br/>Show Help"]
```

## Parameters

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--connection` | `-n` | string | - | Connection String in format `<host>[:<port>]` |
| `--user` | `-u` | string | - | Database user |
| `--password` | `-p` | string | - | Database password |
| `--userstorekey` | `--uk`, `--userstore` | string | - | HDB User Store Key - Overrides all other connection parameters |
| `--save` | `-s` | boolean | `true` | Save credentials to default-env-admin.json |
| `--encrypt` | `-e`, `--ssl` | boolean | `false` | Encrypt connections (required for SAP HANA service on SAP BTP or SAP HANA Cloud) |
| `--trustStore` | `-t`, `--trust`, `--truststore` | string | - | SSL Trust Store path |
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable verbose output - useful for scripting |
| `--debug` | `-d` | boolean | `false` | Debug hana-cli itself with detailed intermediate output |
| `--help` | `-h` | boolean | - | Show help information |

For a complete list of parameters and options, use:

```bash
hana-cli connect --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli connect --connection localhost:30015 --user DBUSER
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Connection & Auth](..)
- [All Commands A-Z](../all-commands.md)
