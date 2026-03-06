---
description: "Use when adding or updating text elements in _i18n/ translation files. Enforces consistent key-value structure, language completeness, and multi-file synchronization across all supported language variants (English, German, Spanish, French, Portuguese)."
applyTo: "_i18n/**/*.properties"
---

# i18n Translation Management Guidelines

Use this guide whenever adding, updating, or removing text elements from the `_i18n/` directory.

## Scope and Structure

The `_i18n/` folder contains properties files for multi-language support:
- **Base files**: `{feature}.properties` (English)
- **Language variants**: `{feature}_{code}.properties`
  - `_de.properties` → German (Deutsch)
  - `_es.properties` → Spanish (Español)
  - `_fr.properties` → French (Français)
  - `_pt.properties` → Portuguese (Português)

Example: `examples.properties`, `examples_de.properties`, `examples_es.properties`, `examples_fr.properties`, `examples_pt.properties`

## Key Principle

**ALL language files for a feature must contain identical keys.** When adding a key to the base file, you MUST add the same key to all four language variants with appropriate translations. Never create incomplete language sets.

## Adding New Text Elements

### Step 1: Add to Base File

Edit the English base file (e.g., `_i18n/examples.properties`):

```properties
# Add your new key and English value
newKey=English text here
anotherKey=Another English string
```

### Step 2: Add to All Language Variants

For EACH language (`_de.properties`, `_es.properties`, `_fr.properties`, `_pt.properties`):

```properties
# _i18n/examples_de.properties
newKey=Deutscher Text hier
anotherKey=Ein weiterer deutscher String

# _i18n/examples_es.properties
newKey=Texto en español aquí
anotherKey=Otra cadena en español

# _i18n/examples_fr.properties
newKey=Texte français ici
anotherKey=Une autre chaîne en français

# _i18n/examples_pt.Properties
newKey=Texto em português aqui
anotherKey=Outra string em português
```

### Step 3: Verify Consistency

Before committing, ensure:
- All 5 files (base + 4 languages) have the same keys in the same order
- No key is missing from any language file
- Each key has a meaningful translation (not placeholders or English fallback)

## Updating Existing Keys

When updating an existing key's value:

1. Update the English base file
2. Update ALL four language variants with equivalent translations
3. Ensure the key name remains consistent across all files

**DO NOT** change a key name in only some files. If renaming is necessary, do it consistently across all 5 files.

## Formatting Rules

- Use strict `key=value` format (no spaces around `=`)
- Keep one key-value pair per line
- Comments are allowed with `#` prefix
- No trailing spaces or extra whitespace
- Preserve existing indentation and style within the file
- Use UTF-8 encoding for special characters (accents, umlauts, etc.)

### Example with Comments

```properties
# Command descriptions
commandName=Show command details
commandDescription=Detailed text here

# Error messages
errorKey=Error message text
warningKey=Warning message text
```

## Removing Text Elements

When removing a key:

1. Remove the key from the English base file
2. Remove the EXACT SAME key from all four language variants
3. Verify no code references remain (search for `getText("{keyName}")`)

## Language File Organization

Maintain consistent organization within each language variant:
- Group related keys together (e.g., command description, parameters, errors)
- Use comments to separate sections
- Keep keys in the same order across all language files for easier comparison
- Alphabetical ordering is optional but helpful for large files

## Validation Checklist

Before finalizing changes to `_i18n/` files:

- [ ] English base file has all new/updated keys
- [ ] **All 4 language variants** have identical keys
- [ ] No key is missing from any language file
- [ ] All values are translated (not English placeholders)
- [ ] No trailing whitespace or formatting issues
- [ ] Keys use consistent naming convention (camelCase or similar)
- [ ] Comments explain groupings or special formatting
- [ ] Special characters use UTF-8 encoding

## Common Mistakes to Avoid

❌ **Adding a key to only base file** → Breaks code that expects translations
❌ **Using English fallback in translation files** → Defeats internationalization
❌ **Inconsistent key names across files** → Causes lookup failures
❌ **Missing language variants** → Incomplete support for some users
❌ **Not registering new bundles in code** → Keys become inaccessible from application

## Integration with Command Development

When creating a new command:

1. Create (or update) the feature-specific properties file file: `_i18n/featureName.properties`
2. Add all 5 language variants immediately
3. Register the bundle in `baseLite.js` or `base.js` if command-specific
4. Use `baseLite.bundle.getText("key")` or `base.bundle.getText("key")` in code

Refer to [cli-command-development.instructions.md](./cli-command-development.instructions.md) for bundle registration details.

## Example Workflow

**Scenario**: Adding new keys to the `export` command

```bash
# Files to edit:
_i18n/export.properties          # English
_i18n/export_de.properties       # German
_i18n/export_es.properties       # Spanish
_i18n/export_fr.properties       # French
_i18n/export_pt.properties       # Portuguese
```

**Commit message**: "i18n: Add export command translations (en, de, es, fr, pt)"

This ensures all languages are updated consistently and completely.
