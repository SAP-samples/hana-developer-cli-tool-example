# Internationalization (i18n)

HANA CLI supports multiple languages for global accessibility.

## Supported Languages

- **English** (en)
- **German** (de)

## Language Selection

### Environment Variable

```bash
# Set language to German
export HANA_LANG=de

# Or set via command
HANA_LANG=de hana-cli dbInfo
```

### Command Option

```bash
# Most commands support --lang option
hana-cli dbInfo --lang de
hana-cli import --help --lang de
```

## Translation Files

Translations are located in `_i18n/` directory:

```
_i18n/
├── messages.properties           # English
├── messages_de.properties        # German
├── import.properties
├── import_de.properties
├── export.properties
├── export_de.properties
└── ...
```

## Available Translations

All user-facing text is translated:

- Command descriptions
- Help text and usage
- Error messages
- Status messages
- Prompts and confirmations

## Example Output

### English

```bash
hana-cli import --help

Usage: hana-cli import [options]

Description:
  Import data from CSV or Excel files into database tables

Options:
  -n, --filename <file>    Input file path
  -t, --table <table>      Target table
```

### German

```bash
HANA_LANG=de hana-cli import --help

Verwendung: hana-cli import [Optionen]

Beschreibung:
  Importieren Sie Daten aus CSV- oder Excel-Dateien in Datenbanktabellen

Optionen:
  -n, --filename <file>    Eingabedateipfad
  -t, --table <table>      Zieltabelle
```

## Adding New Languages

1. Create translation file: `_i18n/messages_xx.properties` (where xx is language code)
2. Add translations for all message keys
3. Update configuration to support new language
4. Test translations

## Message Keys

Common message keys available for translation:

```
messages.import.start=Starting import...
messages.import.success=Import completed successfully
messages.import.error=Import failed
messages.export.start=Exporting data...
messages.error.connection=Database connection failed
messages.error.tableNotFound=Table not found
```

## Default Language

If language is not specified, HANA CLI uses:

1. `HANA_LANG` environment variable
2. System locale
3. English (fallback)

## Language in Scripts

```bash
#!/bin/bash

# Use German for all commands
export HANA_LANG=de

hana-cli import -n data.csv -t TABLE
hana-cli export -s SCHEMA -t TABLE -o output.csv
hana-cli dataValidator -s SCHEMA -t TABLE
```

## Contributing Translations

Want to add support for a new language?

1. Fork the repository
2. Create `_i18n/messages_xx.properties`
3. Translate all keys
4. Submit pull request

Want to add support for a new language? See the repository for translation contribution guidelines.

## See Also

- [CLI Features](./cli-features.md)
- [Documentation](/docs/)
