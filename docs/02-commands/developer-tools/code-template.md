# codeTemplate

> Command: `codeTemplate`  
> Category: **Developer Tools**  
> Status: Production Ready

## Description

Generate boilerplate code for common design patterns. This command creates code templates for CRUD operations, services, repositories, DTOs, entities, and more based on database table schemas. It supports multiple programming languages and frameworks, automatically generating properly structured code from database metadata.

## Syntax

```bash
hana-cli codeTemplate [options]
```

## Aliases

- `template`
- `codegen`
- `scaffold`
- `boilerplate`

## Command Diagram

```mermaid
graph TD
    Start([hana-cli codeTemplate]) --> Pattern{Select Pattern}
    Pattern -->|crud| Crud[CRUD Pattern]
    Pattern -->|service| Service[Service Pattern]
    Pattern -->|repository| Repo[Repository Pattern]
    Pattern -->|mapper| Mapper[Mapper Pattern]
    Pattern -->|dto| DTO[DTO Pattern]
    Pattern -->|entity| Entity[Entity Pattern]
    Pattern -->|query| Query[Query Pattern]
    Pattern -->|test| Test[Test Pattern]
    Pattern -->|migration| Migration[Migration Pattern]
    
    Crud --> Object[Get Object/Table]
    Service --> Object
    Repo --> Object
    Mapper --> Object
    DTO --> Object
    Entity --> Object
    Query --> Object
    Test --> Object
    Migration --> Object
    
    Object --> ConnectDB[Connect to Database]
    ConnectDB --> GetSchema[Retrieve Schema Metadata]
    GetSchema --> Language{Select Language}
    
    Language -->|TypeScript| TS[TypeScript Generator]
    Language -->|JavaScript| JS[JavaScript Generator]
    Language -->|Java| Java[Java Generator]
    Language -->|CDS| CDS[CDS Generator]
    Language -->|SQL| SQL[SQL Generator]
    Language -->|Python| Python[Python Generator]
    
    TS --> Framework{Framework?}
    JS --> Framework
    Java --> Framework
    
    Framework -->|Express| ExpressCode[Express Code]
    Framework -->|Spring| SpringCode[Spring Code]
    Framework -->|NestJS| NestCode[NestJS Code]
    Framework -->|CDS| CDSCode[CDS Code]
    Framework -->|None| StandardCode[Standard Code]
    
    ExpressCode --> Comments{Add Comments?}
    SpringCode --> Comments
    NestCode --> Comments
    CDSCode --> Comments
    StandardCode --> Comments
    CDS --> Comments
    SQL --> Comments
    Python --> Comments
    
    Comments -->|Yes| WithComments[Generate with Comments]
    Comments -->|No| NoComments[Generate without Comments]
    
    WithComments --> Output{Output File?}
    NoComments --> Output
    
    Output -->|Specified| WriteFile[Write to File]
    Output -->|Not Specified| DisplayCode[Display to Console]
    
    WriteFile --> Complete([Complete])
    DisplayCode --> Complete
    
    style Start fill:#0092d1
    style Complete fill:#2ecc71
    style Pattern fill:#f39c12
    style Language fill:#f39c12
    style Framework fill:#f39c12
    style Comments fill:#f39c12
    style Output fill:#f39c12
```

## Parameters

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--pattern` | `-p` | string | - | Code pattern to generate. Choices: `crud`, `service`, `repository`, `mapper`, `dto`, `entity`, `query`, `test`, `migration` |
| `--object` | `-o` | string | - | Object or table name to generate code for |
| `--schema` | `-s` | string | - | Schema name containing the object |
| `--language` | `-l` | string | `typescript` | Programming language. Choices: `javascript`, `typescript`, `java`, `cds`, `sql`, `python` |
| `--output` | `-f` | string | - | Output file path (displays to console if not specified) |
| `--framework` | `--fw` | string | `none` | Target framework. Choices: `express`, `spring`, `nestjs`, `cds`, `none` |
| `--comments` | `-c` | boolean | `true` | Include code comments in generated code |
| `--profile` | `--pr` | string | - | CDS Profile for connection |

### Connection Parameters

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--admin` | `-a` | boolean | `false` | Connect via admin (default-env-admin.json) |
| `--conn` | - | string | - | Connection filename to override default-env.json |

### Troubleshooting

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--disableVerbose` | `--quiet` | boolean | `false` | Disable verbose output - removes all extra output that is only helpful to human readable interface |
| `--debug` | `-d` | boolean | `false` | Debug hana-cli itself by adding output of LOTS of intermediate details |

## Examples

### Basic Usage

```bash
hana-cli codeTemplate --pattern crud --object myTable
```

Generates CRUD code template for `myTable` using TypeScript (default language).

### Generate Service in JavaScript

```bash
hana-cli codeTemplate --pattern service --object CUSTOMERS --language javascript
```

Generates a service layer for the CUSTOMERS table using JavaScript.

### Generate with Express Framework

```bash
hana-cli codeTemplate --pattern crud --object ORDERS --framework express --output ./src/orders.controller.ts
```

Generates Express-based CRUD controller for ORDERS table and saves to specified file.

### Generate Java Spring Repository

```bash
hana-cli codeTemplate --pattern repository --object PRODUCTS --language java --framework spring
```

Generates a Spring Data repository for the PRODUCTS table in Java.

### Generate without Comments

```bash
hana-cli codeTemplate --pattern entity --object USERS --comments false
```

Generates entity code for USERS table without inline comments.

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Developer Tools](..)
- [All Commands A-Z](../all-commands.md)
- [createModule](./create-module.md) - Create a new database module
- [generateDocs](./generate-docs.md) - Generate documentation from database objects
