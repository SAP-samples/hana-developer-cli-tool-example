# hanaCloudSecureStoreInstances

> Command: `hanaCloudSecureStoreInstances`  
> Category: **Backup & Recovery**  
> Status: Production Ready

## Description

List all SAP HANA Cloud SecureStore service instances in your target Space

## Syntax

```bash
hana-cli securestore [options]
```

## Aliases

- `secureStoreInstances`
- `securestoreinstances`
- `secureStoreServices`
- `listSecureStore`
- `securestoreservices`
- `securestores`

## Command Diagram

```mermaid
graph TD
    A["hana-cli securestore"] --> B["Options"]
    B --> C["-c, --cf, --cmd<br/>Cloud Foundry?<br/>default: true"]
    B --> D["-h, --help<br/>Show help"]
    B --> E["--disableVerbose, --quiet<br/>Disable Verbose output<br/>default: false"]
    B --> F["-d, --debug<br/>Debug hana-cli<br/>default: false"]
    A --> G["List all SAP HANA Cloud<br/>SecureStore service instances"]
```

## Parameters

| Flag | Description | Type | Default |
| --- | --- | --- | --- |
| `-h, --help` | Show help | boolean | - |
| `-c, --cf, --cmd` | Cloud Foundry? | boolean | `true` |
| `--disableVerbose, --quiet` | Disable Verbose output - removes all extra output that is only helpful to human readable interface. Useful for scripting commands. | boolean | `false` |
| `-d, --debug` | Debug hana-cli itself by adding output of LOTS of intermediate details | boolean | `false` |

For a complete list of parameters and options, use:

```bash
hana-cli securestore --help
```

## Examples

### Basic Usage

```bash
hana-cli securestore --cf
```

Execute the command

---

## hanaCloudSecureStoreInstancesUI (UI Variant)

> Command: `hanaCloudSecureStoreInstancesUI`  
> Status: Production Ready

**Description:** Execute hanaCloudSecureStoreInstancesUI command - UI version for listing SAP HANA Cloud SecureStore instances

**Syntax:**

```bash
hana-cli securestoreUI [options]
```

**Aliases:**

- `secureStoreInstancesUI`
- `secureStoreUI`
- `securestoreinstancesui`
- `secureStoreServicesUI`
- `listSecureStoreUI`
- `securestoreservicesui`
- `securestoresui`

**Parameters:**

For a complete list of parameters and options, use:

```bash
hana-cli securestoreUI --help
```

**Example Usage:**

```bash
hana-cli securestoreUI
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: HANA Cloud](..)
- [All Commands A-Z](../all-commands.md)
