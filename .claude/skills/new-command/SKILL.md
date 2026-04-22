---
name: new-command
description: Scaffold a new hana-cli command end-to-end — creates the yargs command module, i18n strings, Express route, MCP metadata entry, test file, and documentation page. Use when adding a new CLI command.
---

# New Command Scaffold

This skill guides the creation of a new hana-cli CLI command. A complete command touches 6+ files across the codebase. Follow every step — skipping one causes runtime failures or CI breakage.

## Step 1: Gather Requirements

Before writing any code, determine:

1. **Command name** (camelCase, e.g., `tableStats`)
2. **Category** from `bin/commandMetadata.js`: data-tools, schema-tools, object-inspection, analysis-tools, performance-monitoring, backup-recovery, system-admin, security, mass-operations, connection-auth, btp-integration, hana-cloud, hdi-management, developer-tools
3. **Parameters** the command accepts (schema, table, limit, output, custom ones)
4. **Whether it needs a DB connection** (most do)
5. **Related commands** for the doc epilogue
6. **Whether it needs a REST route** (if it should be accessible via `hana-cli ui`)

## Step 2: Create the Command File

Create `bin/<commandName>.js` following the template in `.github/instructions/cli-command-development.instructions.md`.

**Checklist — every command file MUST have:**

- [ ] `// @ts-check` at top
- [ ] `import * as baseLite from '../utils/base-lite.js'`
- [ ] `import { buildDocEpilogue } from '../utils/doc-linker.js'`
- [ ] `export const command` — yargs signature
- [ ] `export const aliases` — short names array
- [ ] `export const describe` — via `baseLite.bundle.getText("commandName")`
- [ ] `export const builder` — via `baseLite.getBuilder({...})` with `.wrap(160).example().epilog(buildDocEpilogue(...))`
- [ ] `export let inputPrompts` — prompt schema matching builder options
- [ ] `export async function handler(argv)` — dynamic `import('../utils/base.js')`
- [ ] `export async function <mainFunction>(prompts)` — with try/catch, `base.setPrompts()`, `base.createDBConnection()`, `base.end()`, `base.error()`
- [ ] Prepared statements for ALL SQL (never string interpolation)
- [ ] `base.sqlInjection.isAcceptableParameter()` for any user input in SQL

## Step 3: Add i18n Strings

Create `_i18n/messages_<commandName>_en.properties` with at minimum:

```properties
commandName=Brief description of what the command does
commandNameExample=Example usage description text
```

Add translations for de, es, fr, pt if possible, or at minimum create the English file.

If the command reuses existing i18n keys (schema, table, limit, etc.), no need to duplicate those — they're already in `_i18n/messages_en.properties`.

Register the bundle in `utils/base-lite.js` in the `additionalBundles` array if using a separate properties file.

## Step 4: Register in Command Metadata

Add an entry to `bin/commandMetadata.js`:

```javascript
commandName: {
  category: '<category>',
  relatedCommands: ['related1', 'related2']
}
```

Verify the command is picked up by `bin/commandMap.js` (it auto-discovers files in `bin/`).

## Step 5: Create the Test File

Create `tests/<commandName>.Test.js` following `.github/instructions/testing.instructions.md`.

**Minimum tests:**

```javascript
import * as base from './base.js'

describe('<commandName>', function () {
    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/<commandName>.js --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("node bin/<commandName>.js --quiet", done)
    })
})
```

## Step 6: Add Express Route (if needed)

If the command should be available via the web UI, add a route in `routes/` following `.github/instructions/route-development.instructions.md`.

Also add a route test in `tests/routes/`.

## Step 7: Add MCP Metadata (if needed)

If the command should be exposed as an MCP tool for AI assistants, update `mcp-server/src/command-metadata.ts` following `.github/instructions/mcp-server-development.instructions.md`.

## Step 8: Create Documentation Page

Create `docs/02-commands/<commandName>.md` with:
- Command description
- Usage examples
- Parameter reference
- Related commands

## Step 9: Validate

Run these checks before considering the command complete:

```bash
npm run lint                    # No lint errors
npm run validate:i18n           # i18n bundles complete
npm test -- tests/<commandName>.Test.js  # Tests pass
node bin/<commandName>.js --help         # Help displays correctly
```
