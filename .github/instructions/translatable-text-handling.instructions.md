---
description: "Use when adding user-facing text in CLI commands, API routes, or utilities. Enforces consistent use of bundle.getText() for all translatable strings, descriptive key naming, and multi-language synchronization across _i18n/ property files."
applyTo: "bin/*.js,routes/*.js,utils/*.js,app/**/*.js"
---

# Translatable Text Handling Guidelines

Use this guide whenever you add, update, or reference user-facing text strings in CLI commands, API routes, utilities, or any user-visible output.

## Core Principle

**All user-facing text must be translatable.** Never hardcode strings that users see. Always use `bundle.getText(key)` to retrieve text from the appropriate i18n properties file.

## When to Translate

✅ **Always translate:**
- Command descriptions (`describe`)
- Option and parameter descriptions
- Help text and error messages
- Console output, responses, and logging for end-users
- UI labels and status messages
- Validation error messages
- Success/warning/info messages

❌ **Do NOT translate (keep as inline strings):**
- Internal debug messages (prefixed with `debug()`)
- File paths and system constants
- Technical identifiers (command names, option names)
- Variable names and code structure
- JSON keys and data structure identifiers

### Example: What to Translate vs. What Not To

```javascript
// ✅ CORRECT: User-facing text is translatable
export const describe = bundle.getText("backupCommand")  // "Create a database backup"
export const builder = (yargs) => yargs
  .option('schema', {
    describe: bundle.getText("backupSchema"),  // "Target schema for backup"
    type: 'string'
  })
  .example('hana-cli backup full', bundle.getText("backupExampleFull"))

// ❌ INCORRECT: Hardcoded strings not translatable
export const describe = "Create a database backup"  
export const describe = `Show ${tableName} schema`  // Dynamic content hardcoded

// ✅ CORRECT: Dynamic content with translation
const message = bundle.getText("backupComplete", { schema: schemaName })
// key: "backupComplete=Backup completed for schema {0}"
```

## Import Pattern

Always import `bundle` from the correct base utility. The import source depends on your module type:

### For CLI Commands (bin/*.js)
```javascript
// In command setup (synchronous context):
import * as baseLite from '../utils/base-lite.js'
export const describe = baseLite.bundle.getText("commandKey")

// In async handler or functions:
const base = await import('../utils/base.js')
const message = base.bundle.getText("messageKey")
```

### For Routes (routes/*.js)
```javascript
// At top of file
import { bundle } from '../utils/base.js'

// Or within route handler
const base = await import('../utils/base.js')
response.json({ message: base.bundle.getText("routeKey") })
```

### For Utilities (utils/*.js)
```javascript
// Async utilities:
const base = await import('../utils/base.js')
const text = base.bundle.getText("utilKey")

// Or in base-lite for lightweight utilities:
import { bundle } from '../utils/base-lite.js'
```

## Translation Key Naming Convention

Keys follow a **descriptive pattern**: `{featureName}{Purpose}` where:
- **featureName**: Feature or command name (camelCase, e.g., `backup`, `dataSync`, `import`)
- **Purpose**: Brief description of the text (camelCase, e.g., `Command`, `Error`, `Success`)

### Common Purpose Suffixes

| Suffix | Use Case | Example |
|--------|----------|---------|
| `Command` | Main command description | `backupCommand` → "Create a database backup" |
| `Description` | Option/parameter description | `backupSchema` → "Target schema for backup" |
| `Example` | Usage example | `backupExampleFull` → "hana-cli backup full" |
| `Error` | Error message | `backupError` → "Backup failed: {0}" |
| `Success` | Success message | `backupSuccess` → "Backup completed successfully" |
| `Warning` | Warning message | `backupWarning` → "This operation may take time" |
| `Title` | Section/dialog title | `backupTitle` → "Backup Settings" |
| `Confirm` | Confirmation prompt | `backupConfirm` → "Proceed with backup?" |
| `NotFound` | Not found message | `backupNotFound` → "Backup not found" |
| `Label` | Field/item label | `backupLabel` → "Latest backup" |

### Invalid Key Patterns ❌

```javascript
// ❌ Too vague
getText("text")
getText("message")
getText("error")

// ❌ Inconsistent naming
getText("backup_command")  // Uses underscore inconsistently
getText("BackupCommand")   // Uses PascalCase
getText("cmdBackup")       // Reversed order

// ❌ Missing context
getText("ok")
getText("yes")
getText("warning")
```

## Adding New Translatable Strings

### Step 1: Identify the Correct Feature

Determine which feature owns the text. Create or update the corresponding i18n files:
- CLI command → Feature name from `bin/{featureName}.js`
- Route → Feature name from the logical group
- Utility → Related feature name

Example: If updating `bin/backup.js`, use files:
- `_i18n/backup.properties`
- `_i18n/backup_de.properties`
- `_i18n/backup_es.properties`
- `_i18n/backup_fr.properties`
- `_i18n/backup_pt.properties`

### Step 2: Add Key to All 5 Translation Files

Add the same key with appropriate translations to:
1. **English base file**: `{feature}.properties`
2. **All 4 language variants**: `{feature}_{code}.properties` (de, es, fr, pt)

**CRITICAL:** All 5 files MUST have identical keys. Missing keys in any language file will cause runtime errors.

```properties
# _i18n/backup.properties (English)
backupCommand=Create or manage database backups
backupSchema=Target schema for backup operation
backupError=Backup failed at {0}: {1}
backupSuccess=Backup completed successfully in {0}ms

# _i18n/backup_de.properties (German)
backupCommand=Datenbankensicherung erstellen oder verwalten
backupSchema=Zielschema für Sicherungsvorgang
backupError=Sicherung fehlgeschlagen bei {0}: {1}
backupSuccess=Sicherung erfolgreich in {0}ms abgeschlossen

# _i18n/backup_es.properties (Spanish)
backupCommand=Crear o administrar copias de seguridad de la base de datos
backupSchema=Esquema de destino para operación de copia de seguridad
backupError=Copia de seguridad fallida en {0}: {1}
backupSuccess=Copia de seguridad completada exitosamente en {0}ms

# _i18n/backup_fr.properties (French)
backupCommand=Créer ou gérer des sauvegardes de base de données
backupSchema=Schéma cible pour l'opération de sauvegarde
backupError=Sauvegarde échouée à {0}: {1}
backupSuccess=Sauvegarde complétée avec succès en {0}ms

# _i18n/backup_pt.properties (Portuguese)
backupCommand=Criar ou gerenciar backups de banco de dados
backupSchema=Esquema de destino para operação de backup
backupError=Falha no backup em {0}: {1}
backupSuccess=Backup concluído com sucesso em {0}ms
```

### Step 3: Use the Key in Code

```javascript
// In CLI command
export const describe = baseLite.bundle.getText("backupCommand")

// In option description
.option('schema', {
  describe: baseLite.bundle.getText("backupSchema"),
  type: 'string'
})

// In handler with formatting
console.log(base.bundle.getText("backupSuccess", { 0: duration }))
```

## Parameterized Strings

Use `{0}`, `{1}`, `{2}` placeholders for dynamic content that must be in a specific language:

### Property File Definition
```properties
backupError=Backup failed at {0}: {1}
importWarning=Processing file {0} ({1} of {2})
```

### Code Usage
```javascript
const message = base.bundle.getText("backupError", { 0: timestamp, 1: errorReason })
// or with array:
const message = base.bundle.getText("importWarning", timestamp, currentIndex, totalCount)
```

### When NOT to use Placeholders
```javascript
// ❌ WRONG: Using template literals defeats translation
const msg = `Backup failed: ${errorReason}`

// ✅ CORRECT: Use parameterized keys
const msg = base.bundle.getText("backupError", errorReason)
```

## Validation Checklist

Before committing changes with new or updated translation keys:

- [ ] All new keys are added to the English base file (`.properties`)
- [ ] All new keys with identical names exist in all 4 language variants (`_de`, `_es`, `_fr`, `_pt`)
- [ ] All keys have meaningful translations (not English placeholders in language files)
- [ ] Translation keys follow the `{featureName}{Purpose}` naming convention
- [ ] Code uses `bundle.getText(key)` not literal strings for user-facing text
- [ ] Parameterized strings use `{0}`, `{1}` syntax, not template literals
- [ ] No trailing spaces or extra whitespace in property files
- [ ] UTF-8 encoding used for special characters (accents, umlauts, etc.)
- [ ] Code review includes language team verification for new translations

## Common Pitfalls

### Error: Keys Missing from Language Files
```
Result: Runtime error when users select non-English language
Fix: Always add new keys to all 5 files (EN + 4 languages)
```

### Error: Using Inline Strings for User Text
```javascript
// ❌ WRONG
console.log(`Backup completed`)

// ✅ CORRECT
console.log(base.bundle.getText("backupSuccess"))
```

### Error: Inconsistent Key Naming
```javascript
// ❌ WRONG (mixing patterns)
getText("backupCommand")
getText("import_error")
getText("SyncWarning")

// ✅ CORRECT (consistent camelCase)
getText("backupCommand")
getText("importError")
getText("syncWarning")
```

### Error: Hardcoding Dynamic Content
```javascript
// ❌ WRONG (content locked in one language)
const msg = `Imported ${count} records`

// ✅ CORRECT (content translated per language)
const msg = base.bundle.getText("importRecords", count)
// In properties file: importRecords=Imported {0} records
```

## File Organization

Keep translation keys organized by feature. If a feature grows significantly, group related keys with comments:

```properties
# Command descriptions
backupCommand=Create or manage database backups
backupDescription=Backup and recovery operations

# Option descriptions
backupSchema=Target schema for backup
backupFull=Create a full backup of entire database

# Messages
backupSuccess=Backup completed successfully
backupError=Backup operation failed
backupProgress=Creating backup... {0}% complete
```

## Related Documentation

- See [i18n Translation Management Guidelines](./i18n-translation-management.instructions.md) for detailed property file syntax and multi-file synchronization
- See [CLI Command Development Guidelines](./cli-command-development.instructions.md) for yargs option descriptions and examples
- See [Route Development Guidelines](./route-development.instructions.md) for response message handling
