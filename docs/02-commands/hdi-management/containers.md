# containers

> Command: `containers`  
> Category: **HDI Management**  
> Status: Production Ready

## Description

List all HDI Containers

## Syntax

```bash
hana-cli containers [containerGroup] [container] [options]
```

## Aliases

- `cont`
- `listContainers`
- `listcontainers`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli containers --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli containers --container myContainer
```

Execute the command

---

## containersUI (UI Variant)

> Command: `containersUI`  
> Status: Production Ready

**Description:** Execute containersUI command - UI version for listing HDI containers

**Syntax:**

```bash
hana-cli containersUI [containerGroup] [container] [options]
```

**Aliases:**

- `containersui`
- `contUI`
- `listContainersUI`
- `listcontainersui`

**Parameters:**

For a complete list of parameters and options, use:

```bash
hana-cli containersUI --help
```

**Example Usage:**

```bash
hana-cli containersUI
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: HDI Management](..)
- [All Commands A-Z](../all-commands.md)
