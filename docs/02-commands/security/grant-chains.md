# grantChains

> Command: `grantChains`  
> Category: **Security**  
> Status: Production Ready

## Description

Visualize privilege inheritance chains for a user or role, including nested roles and privilege summaries.

## Syntax

```bash
hana-cli grantChains [options]
```

## Aliases

- `grants`
- `grantchain`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli grantChains]) --> Input{Input Parameters}
    Input --> Connect[Create DB connection]
    Connect --> Target{User or role provided?}
    Target -->|user| UserChain[Analyze user grant chain]
    Target -->|role| RoleChain[Analyze role grant chain]
    Target -->|none| Current[Analyze current user]
    UserChain --> Format{Output format}
    RoleChain --> Format
    Current --> Format
    Format --> Output[Render tree/table/json]
    Output --> Summary[Show chain summary]
    Summary --> Complete([Command Complete])

    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style Input fill:#f39c12
    style Target fill:#f39c12
    style Format fill:#f39c12
```

## Parameters

### Positional Arguments

This command does not accept positional arguments.

### Options

| Option    | Alias | Type   | Default | Description                 |
|-----------|-------|--------|---------|-----------------------------|
| `--user`  | `-u`  | string | -       | Target user to analyze.     |
| `--role`  | `-r`  | string | -       | Target role to analyze.     |
| `--depth` | `-d`  | number | `5`     | Maximum depth of the chain. |

### Output Options

| Option     | Alias | Type   | Default | Description                                           |
|------------|-------|--------|---------|-------------------------------------------------------|
| `--format` | `-f`  | string | `tree`  | Output format. Choices: `tree`, `table`, `json`       |

### Connection Parameters

| Option    | Alias | Type    | Default | Description                                      |
|-----------|-------|---------|---------|--------------------------------------------------|
| `--admin` | `-a`  | boolean | `false` | Connect via admin (default-env-admin.json)       |
| `--conn`  | -     | string  | -       | Connection filename to override default-env.json |

### Troubleshooting

| Option             | Alias     | Type    | Default | Description            |
|--------------------|-----------|---------|---------|------------------------|
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable verbose output |
| `--debug`          | `-d`      | boolean | `false` | Enable debug output    |

For the runtime-generated option list, run:

```bash
hana-cli grantChains --help
```

## Examples

### Basic Usage

```bash
hana-cli grantChains --user DBUSER
```

Visualize the grant chain for `DBUSER`.

## Related Commands

- `privilegeAnalysis` - Analyze user privileges and suggest least privilege
- `privilegeError` - Get insufficient privilege error details
- `roles` - List roles and role metadata

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Security](..)
- [All Commands A-Z](../all-commands.md)
