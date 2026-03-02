# generateDocs

> Command: `generateDocs`  
> Category: **Developer Tools**  
> Status: Production Ready

## Description

Auto-generate database documentation

## Syntax

```bash
hana-cli generateDocs [options]
```

## Aliases

- `docs`
- `gendocs`
- `generateDocumentation`

## Command Diagram

```mermaid
flowchart TD
    A[hana-cli generateDocs] --> B[Auto-generate database documentation]

    A --> C{Connection Parameters}
    C --> C1[-a, --admin<br/>Connect via admin profile<br/>default: false]
    C --> C2[--conn<br/>Override default-env.json with connection file]

    A --> D{Troubleshooting}
    D --> D1[--disableVerbose, --quiet<br/>Disable verbose/human-readable extras<br/>default: false]
    D --> D2[-d, --debug<br/>Debug hana-cli internals with detailed output<br/>default: false]

    A --> E{Options}
    E --> E1[-h, --help]
    E --> E2[-s, --schema<br/>Schema to document]
    E --> E3[-o, --objects<br/>tables | views | procedures | functions | all<br/>default: all]
    E --> E4[-f, --output<br/>Documentation output path]
    E --> E5[--format, --fmt<br/>markdown | html | pdf<br/>default: markdown]
    E --> E6[--includeData, --id<br/>Include data statistics<br/>default: false]
    E --> E7[--includeGrants, --ig<br/>Include grants<br/>default: true]
    E --> E8[--includeIndexes, --ii<br/>Include indexes<br/>default: true]
    E --> E9[--includeTriggers, --it<br/>Include triggers<br/>default: true]
    E --> E10[--generateTOC, --toc<br/>Generate table of contents<br/>default: true]
    E --> E11[-p, --profile<br/>CDS profile]
```

## Parameters

### Connection Parameters

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--admin` | `-a` | `boolean` | `false` | Connect via admin (`default-env-admin.json`). |
| `--conn` | `-` | `string` | `-` | Connection filename to override `default-env.json`. |

### Troubleshooting

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--disableVerbose` | `--quiet` | `boolean` | `false` | Disable verbose output and remove extra human-readable output; useful for scripting commands. |
| `--debug` | `-d` | `boolean` | `false` | Debug `hana-cli` by adding lots of intermediate detail output. |

### Options

| Option | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--help` | `-h` | `boolean` | `-` | Show help. |
| `--schema` | `-s` | `string` | `-` | Schema to document. |
| `--objects` | `-o` | `string` | `"all"` | Object types to document. Choices: `tables`, `views`, `procedures`, `functions`, `all`. |
| `--output` | `-f` | `string` | `-` | Documentation output file path. |
| `--format` | `--fmt` | `string` | `"markdown"` | Documentation format. Choices: `markdown`, `html`, `pdf`. |
| `--includeData` | `--id` | `boolean` | `false` | Include data statistics in documentation. |
| `--includeGrants` | `--ig` | `boolean` | `true` | Include grant information. |
| `--includeIndexes` | `--ii` | `boolean` | `true` | Include index information. |
| `--includeTriggers` | `--it` | `boolean` | `true` | Include trigger information. |
| `--generateTOC` | `--toc` | `boolean` | `true` | Generate table of contents. |
| `--profile` | `-p` | `string` | `-` | CDS Profile. |

For a complete list of parameters and options, use:

```bash
hana-cli generateDocs --help
```

## Examples

### Basic Usage

```bash
hana-cli generateDocs --schema MYSCHEMA --format markdown --output docs/
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Developer Tools](..)
- [All Commands A-Z](../all-commands.md)
