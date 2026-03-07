# copy2Secrets

> Command: `copy2Secrets`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Create Kubernetes-style secret files from `VCAP_SERVICES` credentials (for example from `default-env.json`).

## Syntax

```bash
hana-cli copy2Secrets [options]
```

## Command Diagram

```mermaid
    graph TD
        Start([hana-cli copy2Secrets]) --> LoadEnv[Load env json and VCAP_SERVICES]
        LoadEnv --> Iterate[Iterate services and instances]
        Iterate --> Filter{Filter applied?}
        Filter -->|Skip| Next[Skip instance]
        Filter -->|Keep| CreatePath[Create secrets folder path]
        CreatePath --> WriteCreds[Write credential files]
        Next --> Complete([Command Complete])
        WriteCreds --> Complete

        style Start fill:#0092d1
        style Complete fill:#2ecc71
        style Filter fill:#f39c12
```

## Aliases

- `secrets`
- `make:secrets`

## Parameters

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--envJson` | `--from-file` | string | `default-env.json` | Source env file containing service bindings |
| `--secretsFolder` | `--to-folder` | string | `secrets` | Target folder for generated secret files |
| `--filter` | - | string | - | Optional filter for service instance names |

For a complete list of parameters and options, use:

```bash
hana-cli copy2Secrets --help
```

## Examples

### Basic Usage

```bash
hana-cli copy2Secrets
```

Generate secret files under the configured secrets folder.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
