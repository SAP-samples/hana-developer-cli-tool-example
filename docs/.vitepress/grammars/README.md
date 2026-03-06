# CDS TextMate Grammar

To add proper SAP CAP CDS syntax highlighting, place the official CDS TextMate grammar here.

## Getting the Official CDS Grammar

### Option 1: Extract from SAP CDS VSCode Extension

1. Install the [SAP CDS Language Support extension](https://marketplace.visualstudio.com/items?itemName=SAPSE.vscode-cds) in VSCode
2. Locate the extension folder (usually in `~/.vscode/extensions/sapse.vscode-cds-*`)
3. Find `syntaxes/cds.tmLanguage.json`
4. Copy it to this directory as `cds.tmLanguage.json`

### Option 2: Use the Grammar from npm

If available via npm package, install:
```bash
npm install @sap/cds-lsp --save-dev
```

Then locate the grammar file in `node_modules/@sap/cds-lsp/syntaxes/`

### Option 3: GitHub Repository

Check SAP's GitHub repositories for the CDS language grammar:
- [SAP CDS Compiler](https://github.com/SAP/cds-compiler)
- [SAP CDS Language Support](https://github.com/SAP/cds-lsp)

## Expected File

The file should be named `cds.tmLanguage.json` and placed in this directory.

Example structure:
```json
{
  "scopeName": "source.cds",
  "name": "CDS",
  "fileTypes": ["cds"],
  "patterns": [
    ...
  ]
}
```

## Fallback Behavior

If the grammar file is not found, VitePress will fall back to using TypeScript syntax highlighting, which provides reasonable highlighting for CDS entity definitions.
