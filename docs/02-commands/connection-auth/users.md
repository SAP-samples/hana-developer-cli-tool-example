# users

> Command: `users`  
> Category: **Connection & Auth**  
> Status: Production Ready

## Description

Get a list of all users

## Syntax

```bash
hana-cli users [user] [options]
```

## Aliases

- `u`
- `listUsers`
- `listusers`

## Command Diagram

```mermaid
graph TD
    A["hana-cli users"] --> B["[user]"]
    A --> C["Connection Parameters"]
    A --> D["Filter Options"]
    A --> E["Troubleshooting"]
    A --> F["Help"]
    
    B --> B1["user<br/>Optional user filter"]
    
    C --> C1["-a, --admin<br/>Connect via admin<br/>default: false"]
    C --> C2["--conn<br/>Connection Filename"]
    
    D --> D1["-u, --user<br/>Filter by user<br/>default: *"]
    D --> D2["-l, --limit<br/>Limit results<br/>default: 200"]
    
    E --> E1["--disableVerbose<br/>Disable Verbose Output"]
    E --> E2["-d, --debug<br/>Debug Mode"]
    
    F --> F1["-h, --help<br/>Show Help"]
```

## Parameters

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--admin` | `-a` | boolean | `false` | Connect via admin (default-env-admin.json) |
| `--conn` | - | string | - | Connection filename to override default-env.json |
| `--user` | `-u` | string | `*` | Filter by user |
| `--limit` | `-l` | number | `200` | Limit number of results |
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable verbose output - useful for scripting |
| `--debug` | `-d` | boolean | `false` | Debug hana-cli itself with detailed intermediate output |
| `--help` | `-h` | boolean | - | Show help information |

For a complete list of parameters and options, use:

```bash
hana-cli users --help
```

## Examples

### Basic Usage

```bash
hana-cli users
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Connection & Auth](..)
- [All Commands A-Z](../all-commands.md)
