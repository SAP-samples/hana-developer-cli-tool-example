# inspectJWT

> Command: `inspectJWT`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Inspect JWT Token Configuration

## Syntax

```bash
hana-cli inspectJWT [options]
```

## Aliases

- `jwt`
- `ijwt`
- `iJWT`
- `iJwt`

## Command Diagram

```mermaid
graph TD
    A["hana-cli inspectJWT"] --> B["Connection Parameters"]
    A --> C["Troubleshooting"]
    A --> D["Help"]
    
    B --> B1["-a, --admin<br/>Connect via admin<br/>default: false"]
    B --> B2["--conn<br/>Connection Filename"]
    
    C --> C1["--disableVerbose<br/>Disable Verbose Output"]
    C --> C2["-d, --debug<br/>Debug Mode"]
    
    D --> D1["-h, --help<br/>Show Help"]
```

## Parameters

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--admin` | `-a` | boolean | `false` | Connect via admin (default-env-admin.json) |
| `--conn` | - | string | - | Connection filename to override default-env.json |
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable verbose output - useful for scripting |
| `--debug` | `-d` | boolean | `false` | Debug hana-cli itself with detailed intermediate output |
| `--help` | `-h` | boolean | - | Show help information |

For a complete list of parameters and options, use:

```bash
hana-cli inspectJWT --help
```

## Examples

### Basic Usage

```bash
hana-cli inspectJWT
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
