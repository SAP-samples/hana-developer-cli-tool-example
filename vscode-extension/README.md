# hana-cli Tools for SAP HANA

Visual editors and database tools for **SAP HANA**, powered by [hana-cli](https://github.com/SAP-samples/hana-developer-cli-tool-example).

This extension brings the most-used capabilities of the `hana-cli` developer tool directly into Visual Studio Code — custom editors for HANA design-time artifacts, an interactive tools panel, and quick commands for exploring a connected database.

## Features

### Custom editors

Open HANA design-time files and inspect them visually — no need to read raw source:

| File type | Editor |
|-----------|--------|
| `*.hdbcalculationview` | Calculation View Editor |
| `*.hdbtable`, `*.hdbmigrationtable` | Table Inspector |
| `*.hdbview` | View Inspector |
| `*.hdbprocedure` | Procedure Inspector |
| `*.hdbfunction` | Function Inspector |
| `*.hdbsynonym` | Synonym Inspector |
| `*.hdbrole` | Role Inspector |
| `*.hdbsequence` | Sequence Inspector |

### Commands

Available from the Command Palette (`Ctrl/Cmd+Shift+P`), all prefixed with **HANA:**

- **Open hana-cli Tools** — launch the interactive tools panel
- **New Query Editor** — run ad-hoc SQL against the connected database
- **Show Tables** / **Show Views** — browse catalog objects
- **System Info** — inspect the connected HANA system
- **Add Connection** — store HANA connection details securely
- **Import Data** — load data into a table
- **CF Login** — authenticate to Cloud Foundry

## Connection resolution

On activation the extension automatically resolves a HANA connection from your workspace, trying in order:

1. `default-env.json`
2. `.cdsrc-private.json` (CAP dynamic binding)
3. `.env` / `VCAP_SERVICES`
4. Connections you save via **HANA: Add Connection** (stored in VS Code Secret Storage)

The current connection is shown in the status bar.

## Requirements

- Visual Studio Code `^1.85.0`
- A reachable SAP HANA database (HANA Cloud or on-premise). For CAP projects, a bound HDI container or `default-env.json` is used automatically.

## Learn more

- [hana-cli documentation](https://sap-samples.github.io/hana-developer-cli-tool-example/)
- [Source & issues](https://github.com/SAP-samples/hana-developer-cli-tool-example)

## License

Licensed under the [Apache License 2.0](./LICENSE).
