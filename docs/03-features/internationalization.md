# Internationalization (i18n)

HANA CLI supports multiple languages for global accessibility.

## Supported Languages

- **English** (en)
- **German** (de)
- **Spanish** (es)
- **French** (fr)
- **Portuguese** (pt)

## Language Selection

### Environment Variable

HANA CLI uses standard Unix locale environment variables to determine the language.

**PowerShell (Windows):**

```powershell
# Set for current session
$env:LANG = "de_DE"

# Set permanently for current user
[System.Environment]::SetEnvironmentVariable('LANG', 'de_DE', 'User')

# Run single command with language
& { $env:LANG = "de_DE"; hana-cli dbInfo }
```

**Command Prompt (Windows):**

```cmd
# Set for current session
set LANG=de_DE

# Set permanently
setx LANG de_DE

# Run single command with language
set LANG=de_DE && hana-cli dbInfo
```

**Bash/Zsh (macOS/Linux):**

```bash
# Set for current session
export LANG=de_DE

# Set permanently (add to ~/.bashrc or ~/.zshrc)
echo 'export LANG=de_DE' >> ~/.bashrc

# Run single command with language
LANG=de_DE hana-cli dbInfo
```

### Supported Environment Variables

The CLI checks these environment variables in order:

1. `LC_ALL` - Overrides all other locale settings
2. `LC_MESSAGES` - Controls message language specifically
3. `LANG` - General locale setting
4. `LANGUAGE` - Fallback language list

**Example using LC_MESSAGES (recommended for message translation only):**

```bash
# Bash/Zsh
export LC_MESSAGES=de_DE

# PowerShell
$env:LC_MESSAGES = "de_DE"
```

### Supported Locale Formats

Both language-only and full locale formats work:

- **Language only**: `de`, `es`, `fr`, `pt`, `en`
- **Full locale**: `de_DE`, `es_ES`, `fr_FR`, `pt_PT`, `en_US`

The CLI extracts the language code from the full locale automatically.

### Troubleshooting

**If translations don't appear:**

1. **Verify the environment variable is set:**

   ```powershell
   # PowerShell
   echo $env:LANG
   
   # Bash/Zsh
   echo $LANG
   ```

2. **Test with a simple command:**

   ```powershell
   $env:LANG = "de"
   hana-cli help | Select-Object -First 1
   # Should output: "Verwendung: hana-cli <cmd> [Optionen]"
   ```

3. **Try the script block syntax in PowerShell:**

   ```powershell
   & { $env:LANG = "de"; hana-cli help | Select-Object -First 1 }
   ```

4. **Check if another locale variable is overriding:**

   ```powershell
   # Check all locale variables
   Get-ChildItem env: | Where-Object { $_.Name -match "LANG|LC_" }
   ```

5. **Restart your terminal** if you set a permanent environment variable with `SetEnvironmentVariable()`.

## Translation Files

Translations are located in `_i18n/` directory:

```bash
_i18n/
├── messages.properties           # English
├── messages_de.properties        # German
├── messages_es.properties        # Spanish
├── messages_fr.properties        # French
├── messages_pt.properties        # Portuguese
├── import.properties
├── import_de.properties
├── import_es.properties
├── import_fr.properties
├── import_pt.properties
├── export.properties
├── export_de.properties
├── export_es.properties
├── export_fr.properties
├── export_pt.properties
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

**Bash/Zsh:**

```bash
LANG=de_DE hana-cli import --help

Verwendung: hana-cli import [Optionen]

Beschreibung:
  Importieren Sie Daten aus CSV- oder Excel-Dateien in Datenbanktabellen

Optionen:
  -n, --filename <file>    Eingabedateipfad
  -t, --table <table>      Zieltabelle
```

**PowerShell:**

```powershell
$env:LANG = "de_DE"
hana-cli import --help

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

```properties
messages.import.start=Starting import...
messages.import.success=Import completed successfully
messages.import.error=Import failed
messages.export.start=Exporting data...
messages.error.connection=Database connection failed
messages.error.tableNotFound=Table not found
```

## Default Language

If language is not specified, HANA CLI uses:

1. Environment variables (`LC_ALL`, `LC_MESSAGES`, `LANG`, `LANGUAGE`)
2. System locale
3. English (fallback)

## Language in Scripts

**Bash/Zsh Script:**

```bash
#!/bin/bash

# Use German for all commands
export LANG=de_DE

hana-cli import -n data.csv -t TABLE
hana-cli export -s SCHEMA -t TABLE -o output.csv
hana-cli dataValidator -s SCHEMA -t TABLE
```

**PowerShell Script:**

```powershell
# Use German for all commands
$env:LANG = "de_DE"

hana-cli import -n data.csv -t TABLE
hana-cli export -s SCHEMA -t TABLE -o output.csv
hana-cli dataValidator -s SCHEMA -t TABLE
```

**Batch Script (Windows):**

```batch
@echo off
REM Use German for all commands
set LANG=de_DE

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

Want to add support for a new language? Or encounter a translation issue? See the repository for translation contribution guidelines. We welcome contributions to expand our language support!

## See Also

- [CLI Features](./cli-features.md)
- [Documentation Home](/)
