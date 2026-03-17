#!/usr/bin/env node
// @ts-check
/**
 * Generate portable agent instructions for hana-cli consumers
 * 
 * Reads command metadata from multiple sources and generates:
 * - Universal markdown reference files
 * - Multi-format agent adapter files (Copilot, Cursor, Claude, Windsurf, Cline, generic)
 * - Per-category reference files
 * - llms.txt compact reference
 * 
 * Usage: node generate-agent-instructions.js [--force]
 * 
 * Data sources:
 *   bin/commandMetadata.js       → Category mapping for all commands
 *   mcp-server/src/command-metadata.ts (built) → Enriched metadata, categories, workflows
 *   mcp-server/src/examples-presets.ts (built) → Concrete examples and presets
 *   bin/*.js                     → builder exports for parameter schemas
 * 
 * @module generate-agent-instructions
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Directories
const BIN_DIR = path.join(__dirname, 'bin')
const OUTPUT_DIR = path.join(__dirname, 'agent-instructions')
const CATEGORIES_DIR = path.join(OUTPUT_DIR, 'categories')

// Force flag
const FORCE = process.argv.includes('--force')

// ── Data Loading ────────────────────────────────────────────────────────

/**
 * Load command metadata from bin/commandMetadata.js
 * @returns {Promise<Record<string, {category: string, relatedCommands?: string[]}>>}
 */
async function loadCommandMetadata() {
    const mod = await import('./bin/commandMetadata.js')
    return mod.commandMetadata
}

/**
 * Load enriched metadata, categories, and workflows from MCP build
 */
async function loadEnrichedMetadata() {
    try {
        const mod = await import('./mcp-server/build/command-metadata.js')
        return {
            enriched: mod.COMMAND_METADATA_MAP || {},
            categories: mod.CATEGORIES || {},
            workflows: mod.WORKFLOWS || {},
        }
    } catch {
        console.warn('⚠️  MCP server not built — run "npm run build" in mcp-server/ first for enriched metadata')
        return { enriched: {}, categories: {}, workflows: {} }
    }
}

/**
 * Load examples and presets from MCP build
 */
async function loadExamplesPresets() {
    try {
        const mod = await import('./mcp-server/build/examples-presets.js')
        return {
            examples: mod.COMMAND_EXAMPLES || {},
            presets: mod.COMMAND_PRESETS || {},
        }
    } catch {
        console.warn('⚠️  MCP server not built — examples/presets unavailable')
        return { examples: {}, presets: {} }
    }
}

/**
 * Extract builder options from a single command file by parsing source text
 * @param {string} filePath
 * @returns {Record<string, {type?: string, alias?: string[], default?: any, desc?: string, choices?: string[]}>}
 */
function extractBuilderOptions(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8')

        // Extract command signature
        const cmdMatch = content.match(/export\s+const\s+command\s*=\s*['"`](.*?)['"`]/)
        // Extract aliases
        const aliasMatch = content.match(/export\s+const\s+aliases\s*=\s*\[(.*?)\]/s)
        // Extract describe
        const descMatch = content.match(/export\s+const\s+describe\s*=\s*(?:baseLite\.bundle\.getText\(['"`](.*?)['"`]\)|['"`](.*?)['"`])/)

        // Extract the options object from getBuilder({...}) or yargs.options({...})
        const builderBlockMatch = content.match(/(?:getBuilder|\.options)\(\s*\{([\s\S]*?)\}\s*\)/)

        /** @type {Record<string, any>} */
        const options = {}
        if (builderBlockMatch) {
            const block = builderBlockMatch[1]
            // Match each option: key: { ... }
            const optRegex = /(\w+)\s*:\s*\{([^}]*)\}/g
            let m
            while ((m = optRegex.exec(block)) !== null) {
                const optName = m[1]
                const optBody = m[2]
                const opt = {}

                const typeM = optBody.match(/type\s*:\s*['"`](\w+)['"`]/)
                if (typeM) opt.type = typeM[1]

                const defaultM = optBody.match(/default\s*:\s*([^,\n]+)/)
                if (defaultM) {
                    let val = defaultM[1].trim()
                    if (val === 'true') val = true
                    else if (val === 'false') val = false
                    else if (/^\d+$/.test(val)) val = parseInt(val, 10)
                    opt.default = val
                }

                const choicesM = optBody.match(/choices\s*:\s*\[([^\]]+)\]/)
                if (choicesM) {
                    opt.choices = choicesM[1].split(',').map(c => c.trim().replace(/['"]/g, '')).filter(Boolean)
                }

                const aliasM = optBody.match(/alias\s*:\s*\[([^\]]+)\]/)
                if (aliasM) {
                    opt.alias = aliasM[1].split(',').map(a => a.trim().replace(/['"]/g, '')).filter(Boolean)
                }

                const descM = optBody.match(/desc\s*:\s*(?:baseLite\.bundle\.getText\(['"`](\w+)['"`]\)|['"`](.*?)['"`])/)
                if (descM) opt.descKey = descM[1] || descM[2]

                options[optName] = opt
            }
        }

        return {
            commandSig: cmdMatch ? cmdMatch[1] : null,
            aliases: aliasMatch
                ? aliasMatch[1].split(',').map(a => a.trim().replace(/['"]/g, '')).filter(Boolean)
                : [],
            descKey: descMatch ? (descMatch[1] || descMatch[2]) : null,
            options,
        }
    } catch {
        return { commandSig: null, aliases: [], descKey: null, options: {} }
    }
}

/**
 * Load all command file metadata from bin/
 */
function loadAllCommandFiles() {
    const files = fs.readdirSync(BIN_DIR)
        .filter(f => f.endsWith('.js') && !['index.js', 'cli.js', 'commandMetadata.js'].includes(f))
        .sort()

    const commands = {}
    for (const file of files) {
        const name = file.replace('.js', '')
        commands[name] = extractBuilderOptions(path.join(BIN_DIR, file))
    }
    return commands
}

// ── Deduplication: identify canonical commands vs aliases ────────────

/**
 * Build a set of canonical commands (not aliases)
 * @param {Record<string, any>} commandMeta - from commandMetadata.js
 * @param {Record<string, any>} commandFiles - parsed builder info
 * @returns {Map<string, {category: string, relatedCommands: string[], aliases: string[], commandSig: string, options: Record<string, any>, enriched: any, examples: any[], presets: any[]}>}
 */
function buildCanonicalCommands(commandMeta, commandFiles, enriched, examples, presets) {
    // First pass: identify which file-based commands are aliases of others
    // Aliases typically share the same metadata object reference or point to same category with same relatedCommands
    const aliasTargets = new Set()
    for (const [, info] of Object.entries(commandFiles)) {
        if (info.aliases) {
            for (const alias of info.aliases) {
                aliasTargets.add(alias)
            }
        }
    }

    // Filter to only canonical commands (those that have their own file AND are not listed as an alias of another command)
    const canonical = new Map()
    for (const [name, fileInfo] of Object.entries(commandFiles)) {
        // Skip if this file name appears as an alias of another command
        if (aliasTargets.has(name)) continue

        const meta = commandMeta[name] || {}
        const enr = enriched[name] || {}

        canonical.set(name, {
            category: meta.category || enr.category || 'other',
            relatedCommands: meta.relatedCommands || enr.relatedCommands || [],
            aliases: fileInfo.aliases || [],
            commandSig: fileInfo.commandSig || name,
            options: fileInfo.options || {},
            tags: enr.tags || [],
            useCases: enr.useCases || [],
            prerequisites: enr.prerequisites || [],
            examples: examples[name] || [],
            presets: presets[name] || [],
        })
    }

    return canonical
}

// ── Markdown Generators ─────────────────────────────────────────────

/**
 * Get the package version
 */
function getVersion() {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))
    return pkg.version
}

/**
 * Format a category name for display
 */
function formatCategory(cat) {
    return cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/**
 * Generate parameter table for a command
 */
function generateParamTable(options) {
    if (!options || Object.keys(options).length === 0) return ''

    let table = '| Parameter | Type | Default | Description |\n'
    table += '|-----------|------|---------|-------------|\n'
    for (const [name, opt] of Object.entries(options)) {
        const type = opt.type || 'string'
        let def = opt.default !== undefined ? `\`${opt.default}\`` : '-'
        const desc = opt.descKey || name
        const aliases = opt.alias ? opt.alias.map(a => `\`-${a.length === 1 ? a : '-' + a}\``).join(', ') : ''
        const aliasStr = aliases ? ` (${aliases})` : ''
        table += `| \`--${name}\`${aliasStr} | ${type} | ${def} | ${desc} |\n`
    }
    return table
}

/**
 * Generate the HANA_CLI_REFERENCE.md master document
 */
function generateReference(canonical, categories, workflows, version) {
    const lines = []

    lines.push(`# SAP HANA CLI (hana-cli) — Complete Command Reference`)
    lines.push(``)
    lines.push(`> Generated from hana-cli v${version} on ${new Date().toISOString().split('T')[0]}`)
    lines.push(`> This file is auto-generated. Do not edit manually.`)
    lines.push(``)
    lines.push(`## What is hana-cli?`)
    lines.push(``)
    lines.push(`**hana-cli** is a command-line tool that simplifies SAP HANA database development. It wraps complex multi-step database operations into single, easy-to-use commands. It is a development-time tool — not a replacement for \`hdbsql\` or production administration tools.`)
    lines.push(``)
    lines.push(`### Installation`)
    lines.push(``)
    lines.push('```bash')
    lines.push(`npm install -g hana-cli`)
    lines.push('```')
    lines.push(``)
    lines.push(`**Requirements:** Node.js ≥ 20.19.0`)
    lines.push(``)
    lines.push(`### Connection Setup`)
    lines.push(``)
    lines.push(`Before using most commands, establish a database connection:`)
    lines.push(``)
    lines.push('```bash')
    lines.push(`# Interactive connection wizard`)
    lines.push(`hana-cli connect`)
    lines.push(``)
    lines.push(`# Connect via BTP service key`)
    lines.push(`hana-cli connectViaServiceKey`)
    lines.push(``)
    lines.push(`# Copy connection to default-env.json for CAP/CDS projects`)
    lines.push(`hana-cli copy2DefaultEnv`)
    lines.push('```')
    lines.push(``)
    lines.push(`Connection details are stored locally. Use \`hana-cli status\` to verify your connection.`)
    lines.push(``)
    lines.push(`### Running Commands`)
    lines.push(``)
    lines.push('```bash')
    lines.push(`# Direct CLI mode`)
    lines.push(`hana-cli <command> [options]`)
    lines.push(``)
    lines.push(`# Interactive mode (menu-driven)`)
    lines.push(`hana-cli`)
    lines.push(``)
    lines.push(`# Get help for any command`)
    lines.push(`hana-cli <command> --help`)
    lines.push('```')
    lines.push(``)
    lines.push(`### Output Formats`)
    lines.push(``)
    lines.push(`Many commands support \`--output\` with values: \`table\`, \`json\`, \`csv\`, \`excel\`.`)
    lines.push(``)

    // ── Command Reference by Category ──
    lines.push(`---`)
    lines.push(``)
    lines.push(`## Command Reference`)
    lines.push(``)

    // Group canonical commands by category
    const byCategory = new Map()
    for (const [name, cmd] of canonical) {
        const cat = cmd.category
        if (!byCategory.has(cat)) byCategory.set(cat, [])
        byCategory.get(cat).push({ name, ...cmd })
    }

    // Sort categories
    const sortedCats = [...byCategory.keys()].sort()

    for (const cat of sortedCats) {
        const catInfo = categories[cat]
        const catName = catInfo ? catInfo.name : formatCategory(cat)
        const catDesc = catInfo ? catInfo.description : ''

        lines.push(`### ${catName}`)
        if (catDesc) lines.push(``)
        if (catDesc) lines.push(`${catDesc}`)
        lines.push(``)

        const cmds = byCategory.get(cat).sort((a, b) => a.name.localeCompare(b.name))

        for (const cmd of cmds) {
            lines.push(`#### \`${cmd.name}\``)
            lines.push(``)
            if (cmd.aliases.length > 0) {
                lines.push(`**Aliases:** ${cmd.aliases.map(a => `\`${a}\``).join(', ')}`)
            }
            if (cmd.commandSig && cmd.commandSig !== cmd.name) {
                lines.push(`**Syntax:** \`hana-cli ${cmd.commandSig}\``)
            } else {
                lines.push(`**Syntax:** \`hana-cli ${cmd.name}\``)
            }
            if (cmd.tags.length > 0) {
                lines.push(`**Tags:** ${cmd.tags.join(', ')}`)
            }
            lines.push(``)
            if (cmd.useCases.length > 0) {
                lines.push(`**Use cases:**`)
                for (const uc of cmd.useCases) {
                    lines.push(`- ${uc}`)
                }
                lines.push(``)
            }
            if (cmd.prerequisites.length > 0) {
                lines.push(`**Prerequisites:** ${cmd.prerequisites.join(', ')}`)
                lines.push(``)
            }

            // Parameter table
            const paramTable = generateParamTable(cmd.options)
            if (paramTable) {
                lines.push(`**Parameters:**`)
                lines.push(``)
                lines.push(paramTable)
            }

            if (cmd.relatedCommands.length > 0) {
                lines.push(`**Related:** ${cmd.relatedCommands.map(r => `\`${r}\``).join(', ')}`)
            }
            lines.push(``)
            lines.push(`---`)
            lines.push(``)
        }
    }

    // ── Workflows ──
    if (Object.keys(workflows).length > 0) {
        lines.push(`## Multi-Step Workflows`)
        lines.push(``)
        lines.push(`These are pre-defined sequences of commands for common tasks.`)
        lines.push(``)

        for (const [, wf] of Object.entries(workflows)) {
            lines.push(`### ${wf.name}`)
            lines.push(``)
            lines.push(`${wf.description}`)
            lines.push(``)
            lines.push(`**Goal:** ${wf.goal}`)
            if (wf.estimatedTime) lines.push(`**Estimated time:** ${wf.estimatedTime}`)
            if (wf.tags) lines.push(`**Tags:** ${wf.tags.join(', ')}`)
            lines.push(``)
            lines.push(`| Step | Command | Description |`)
            lines.push(`|------|---------|-------------|`)
            for (const step of wf.steps) {
                const params = step.keyParameters ? Object.entries(step.keyParameters).map(([k, v]) => `--${k} ${v}`).join(' ') : ''
                lines.push(`| ${step.order} | \`hana-cli ${step.command} ${params}\` | ${step.description} |`)
            }
            lines.push(``)
        }
    }

    // ── Common Patterns ──
    lines.push(`## Common Patterns`)
    lines.push(``)
    lines.push(`### Explore Before Modify`)
    lines.push(`1. \`hana-cli tables\` → find the table`)
    lines.push(`2. \`hana-cli inspectTable --table X --schema Y\` → understand structure`)
    lines.push(`3. \`hana-cli dataProfile --table X --schema Y\` → understand data`)
    lines.push(`4. Then proceed with import/export/modify operations`)
    lines.push(``)
    lines.push(`### Safe Data Import`)
    lines.push(`1. \`hana-cli import --filename data.csv --table X --schema Y --dryRun\` → preview`)
    lines.push(`2. Review the dry-run output for errors`)
    lines.push(`3. \`hana-cli import --filename data.csv --table X --schema Y\` → actual import`)
    lines.push(``)
    lines.push(`### Performance Investigation`)
    lines.push(`1. \`hana-cli healthCheck\` → overview`)
    lines.push(`2. \`hana-cli expensiveStatements --limit 10\` → find slow queries`)
    lines.push(`3. \`hana-cli queryPlan --query "SELECT ..."\` → analyze specific query`)
    lines.push(``)
    lines.push(`### Schema Comparison`)
    lines.push(`1. \`hana-cli compareSchema --sourceSchema DEV --targetSchema PROD\` → find differences`)
    lines.push(`2. Review differences`)
    lines.push(`3. \`hana-cli schemaClone --sourceSchema DEV --targetSchema TEST\` → clone if needed`)
    lines.push(``)
    lines.push(`### Security Review`)
    lines.push(`1. \`hana-cli securityScan\` → comprehensive scan`)
    lines.push(`2. \`hana-cli privilegeAnalysis\` → check privilege distribution`)
    lines.push(`3. \`hana-cli grantChains --user X\` → trace specific user privileges`)
    lines.push(``)

    // ── Quick Reference Table ──
    lines.push(`## Quick Reference — All Commands`)
    lines.push(``)
    lines.push(`| Command | Category | Description |`)
    lines.push(`|---------|----------|-------------|`)
    for (const [name, cmd] of [...canonical].sort((a, b) => a[0].localeCompare(b[0]))) {
        const aliasStr = cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : ''
        const desc = cmd.useCases.length > 0 ? cmd.useCases[0] : formatCategory(cmd.category)
        lines.push(`| \`${name}\`${aliasStr} | ${formatCategory(cmd.category)} | ${desc} |`)
    }
    lines.push(``)

    return lines.join('\n')
}

/**
 * Generate HANA_CLI_QUICKSTART.md
 */
function generateQuickstart(canonical, version) {
    const topCommands = [
        'status', 'connect', 'tables', 'inspectTable', 'views',
        'import', 'export', 'querySimple', 'healthCheck', 'schemas',
    ]

    const lines = []
    lines.push(`# hana-cli Quick Start Guide`)
    lines.push(``)
    lines.push(`> Generated from hana-cli v${version} on ${new Date().toISOString().split('T')[0]}`)
    lines.push(``)
    lines.push(`## Install`)
    lines.push(``)
    lines.push('```bash')
    lines.push(`npm install -g hana-cli`)
    lines.push('```')
    lines.push(``)
    lines.push(`## Connect to Your Database`)
    lines.push(``)
    lines.push('```bash')
    lines.push(`# Interactive connection wizard — prompts for host, port, user, password`)
    lines.push(`hana-cli connect`)
    lines.push(``)
    lines.push(`# Or connect using a BTP service key file`)
    lines.push(`hana-cli connectViaServiceKey`)
    lines.push(``)
    lines.push(`# Verify your connection`)
    lines.push(`hana-cli status`)
    lines.push('```')
    lines.push(``)
    lines.push(`## Essential Commands`)
    lines.push(``)

    for (const name of topCommands) {
        const cmd = canonical.get(name)
        if (!cmd) continue
        lines.push(`### \`hana-cli ${name}\``)
        if (cmd.useCases.length > 0) {
            lines.push(`${cmd.useCases[0]}`)
        }
        if (cmd.aliases.length > 0) {
            lines.push(`Aliases: ${cmd.aliases.map(a => `\`${a}\``).join(', ')}`)
        }
        lines.push(``)
        lines.push('```bash')
        if (cmd.commandSig && cmd.commandSig !== name) {
            lines.push(`hana-cli ${cmd.commandSig}`)
        } else {
            lines.push(`hana-cli ${name}`)
        }
        lines.push('```')
        lines.push(``)
    }

    lines.push(`## Common Workflows`)
    lines.push(``)
    lines.push(`### Explore a Schema`)
    lines.push('```bash')
    lines.push(`hana-cli schemas                                    # List schemas`)
    lines.push(`hana-cli tables --schema MY_SCHEMA                  # List tables`)
    lines.push(`hana-cli inspectTable --table MY_TABLE --schema MY_SCHEMA  # Column details`)
    lines.push('```')
    lines.push(``)
    lines.push(`### Import Data`)
    lines.push('```bash')
    lines.push(`hana-cli import --filename data.csv --table MY_TABLE --schema MY_SCHEMA --dryRun  # Preview`)
    lines.push(`hana-cli import --filename data.csv --table MY_TABLE --schema MY_SCHEMA           # Execute`)
    lines.push('```')
    lines.push(``)
    lines.push(`### Export Data`)
    lines.push('```bash')
    lines.push(`hana-cli export --table MY_TABLE --schema MY_SCHEMA --filename export.csv`)
    lines.push('```')
    lines.push(``)
    lines.push(`### Run a Query`)
    lines.push('```bash')
    lines.push(`hana-cli querySimple --query "SELECT TOP 10 * FROM MY_SCHEMA.MY_TABLE"`)
    lines.push('```')
    lines.push(``)
    lines.push(`### Check System Health`)
    lines.push('```bash')
    lines.push(`hana-cli healthCheck`)
    lines.push(`hana-cli systemInfo`)
    lines.push('```')
    lines.push(``)
    lines.push(`## Getting Help`)
    lines.push(``)
    lines.push('```bash')
    lines.push(`hana-cli --help         # List all commands`)
    lines.push(`hana-cli <cmd> --help   # Help for specific command`)
    lines.push(`hana-cli interactive    # Interactive menu mode`)
    lines.push('```')
    lines.push(``)

    return lines.join('\n')
}

/**
 * Generate HANA_CLI_EXAMPLES.md from examples and presets
 */
function generateExamples(canonical, examples, presets) {
    const lines = []
    lines.push(`# hana-cli — Real-World Examples`)
    lines.push(``)
    lines.push(`> Auto-generated from hana-cli command examples and parameter presets.`)
    lines.push(``)

    // Examples section
    const exampleCommands = Object.keys(examples).sort()
    if (exampleCommands.length > 0) {
        lines.push(`## Command Examples`)
        lines.push(``)

        for (const cmd of exampleCommands) {
            const cmdExamples = examples[cmd]
            if (!cmdExamples || cmdExamples.length === 0) continue

            lines.push(`### \`${cmd}\``)
            lines.push(``)

            for (const ex of cmdExamples) {
                lines.push(`**${ex.scenario}** — ${ex.description}`)
                lines.push(``)
                lines.push('```bash')
                const params = Object.entries(ex.parameters)
                    .map(([k, v]) => typeof v === 'boolean' ? (v ? `--${k}` : '') : `--${k} ${JSON.stringify(v)}`)
                    .filter(Boolean)
                    .join(' ')
                lines.push(`hana-cli ${cmd} ${params}`)
                lines.push('```')
                if (ex.notes) lines.push(`> ${ex.notes}`)
                if (ex.expectedOutput) lines.push(`Expected: ${ex.expectedOutput}`)
                lines.push(``)
            }
        }
    }

    // Presets section
    const presetCommands = Object.keys(presets).sort()
    if (presetCommands.length > 0) {
        lines.push(`## Parameter Presets`)
        lines.push(``)
        lines.push(`Pre-configured parameter combinations for common scenarios.`)
        lines.push(``)

        for (const cmd of presetCommands) {
            const cmdPresets = presets[cmd]
            if (!cmdPresets || cmdPresets.length === 0) continue

            lines.push(`### \`${cmd}\` Presets`)
            lines.push(``)

            for (const preset of cmdPresets) {
                lines.push(`**${preset.name}** — ${preset.description}`)
                if (preset.whenToUse) lines.push(`When to use: ${preset.whenToUse}`)
                lines.push(``)
                lines.push('```bash')
                const params = Object.entries(preset.parameters)
                    .map(([k, v]) => typeof v === 'boolean' ? (v ? `--${k}` : '') : `--${k} ${v}`)
                    .filter(Boolean)
                    .join(' ')
                lines.push(`hana-cli ${cmd} ${params}`)
                lines.push('```')
                if (preset.notes) lines.push(`> ${preset.notes}`)
                lines.push(``)
            }
        }
    }

    return lines.join('\n')
}

/**
 * Generate HANA_CLI_WORKFLOWS.md
 */
function generateWorkflows(workflows) {
    const lines = []
    lines.push(`# hana-cli — Multi-Step Workflows`)
    lines.push(``)
    lines.push(`> Pre-defined sequences of hana-cli commands for common development tasks.`)
    lines.push(``)

    for (const [, wf] of Object.entries(workflows)) {
        lines.push(`## ${wf.name}`)
        lines.push(``)
        lines.push(`${wf.description}`)
        lines.push(``)
        lines.push(`**Goal:** ${wf.goal}`)
        if (wf.estimatedTime) lines.push(`**Estimated time:** ${wf.estimatedTime}`)
        if (wf.tags) lines.push(`**Tags:** ${wf.tags.join(', ')}`)
        lines.push(``)

        for (const step of wf.steps) {
            lines.push(`### Step ${step.order}: ${step.command}`)
            lines.push(``)
            lines.push(step.description)
            lines.push(``)
            if (step.keyParameters && Object.keys(step.keyParameters).length > 0) {
                const params = Object.entries(step.keyParameters).map(([k, v]) => `--${k} ${v}`).join(' ')
                lines.push('```bash')
                lines.push(`hana-cli ${step.command} ${params}`)
                lines.push('```')
            } else {
                lines.push('```bash')
                lines.push(`hana-cli ${step.command}`)
                lines.push('```')
            }
            if (step.expectedOutput) {
                lines.push(``)
                lines.push(`Expected output: ${step.expectedOutput}`)
            }
            lines.push(``)
        }

        lines.push(`---`)
        lines.push(``)
    }

    return lines.join('\n')
}

/**
 * Generate per-category markdown file
 */
function generateCategoryFile(catKey, catInfo, commands, examples, presets) {
    const catName = catInfo ? catInfo.name : formatCategory(catKey)
    const catDesc = catInfo ? catInfo.description : ''

    const lines = []
    lines.push(`# ${catName}`)
    lines.push(``)
    if (catDesc) lines.push(`${catDesc}`)
    lines.push(``)
    lines.push(`| Command | Aliases | Description |`)
    lines.push(`|---------|---------|-------------|`)
    for (const cmd of commands) {
        const aliasStr = cmd.aliases.length > 0 ? cmd.aliases.map(a => `\`${a}\``).join(', ') : '-'
        const desc = cmd.useCases.length > 0 ? cmd.useCases[0] : '-'
        lines.push(`| \`${cmd.name}\` | ${aliasStr} | ${desc} |`)
    }
    lines.push(``)

    for (const cmd of commands) {
        lines.push(`## \`${cmd.name}\``)
        lines.push(``)
        if (cmd.commandSig && cmd.commandSig !== cmd.name) {
            lines.push('```bash')
            lines.push(`hana-cli ${cmd.commandSig}`)
            lines.push('```')
            lines.push(``)
        }
        if (cmd.aliases.length > 0) {
            lines.push(`**Aliases:** ${cmd.aliases.map(a => `\`${a}\``).join(', ')}`)
        }
        if (cmd.tags.length > 0) {
            lines.push(`**Tags:** ${cmd.tags.join(', ')}`)
        }
        if (cmd.useCases.length > 0) {
            for (const uc of cmd.useCases) lines.push(`- ${uc}`)
        }
        if (cmd.prerequisites.length > 0) {
            lines.push(`**Prerequisites:** ${cmd.prerequisites.join(', ')}`)
        }
        lines.push(``)

        const paramTable = generateParamTable(cmd.options)
        if (paramTable) {
            lines.push(`### Parameters`)
            lines.push(``)
            lines.push(paramTable)
        }

        // Include examples if available
        const cmdExamples = examples[cmd.name]
        if (cmdExamples && cmdExamples.length > 0) {
            lines.push(`### Examples`)
            lines.push(``)
            for (const ex of cmdExamples) {
                const params = Object.entries(ex.parameters)
                    .map(([k, v]) => typeof v === 'boolean' ? (v ? `--${k}` : '') : `--${k} ${JSON.stringify(v)}`)
                    .filter(Boolean)
                    .join(' ')
                lines.push(`**${ex.scenario}:** \`hana-cli ${cmd.name} ${params}\``)
                if (ex.notes) lines.push(`> ${ex.notes}`)
                lines.push(``)
            }
        }

        if (cmd.relatedCommands.length > 0) {
            lines.push(`**Related:** ${cmd.relatedCommands.map(r => `\`${r}\``).join(', ')}`)
        }
        lines.push(``)
        lines.push(`---`)
        lines.push(``)
    }

    return lines.join('\n')
}

// ── Agent Format Generators ─────────────────────────────────────────

/**
 * Core context block used by all agent formats
 */
function agentPreamble(version) {
    return `# hana-cli — AI Coding Assistant Context

## About hana-cli

hana-cli (npm: hana-cli, install: \`npm install -g hana-cli\`) is a command-line tool for SAP HANA database development. It simplifies complex multi-step database operations into single commands. It is a development tool, not a replacement for hdbsql or production admin tools.

**Version:** ${version}  
**Requirements:** Node.js ≥ 20.19.0  
**Module:** ESM (\`"type": "module"\`)

## When to Use hana-cli

Use hana-cli when a developer needs to:
- **Explore schemas**: \`hana-cli tables\`, \`hana-cli views\`, \`hana-cli schemas\`
- **Inspect objects**: \`hana-cli inspectTable\`, \`hana-cli inspectView\`, \`hana-cli inspectProcedure\`
- **Import/export data**: \`hana-cli import\`, \`hana-cli export\`
- **Run queries**: \`hana-cli querySimple --query "SQL"\`
- **Check health**: \`hana-cli healthCheck\`, \`hana-cli systemInfo\`
- **Manage connections**: \`hana-cli connect\`, \`hana-cli status\`
- **Profile data**: \`hana-cli dataProfile\`, \`hana-cli dataValidator\`
- **Compare schemas**: \`hana-cli compareSchema\`, \`hana-cli compareData\`
- **Monitor performance**: \`hana-cli expensiveStatements\`, \`hana-cli memoryAnalysis\`
- **Manage security**: \`hana-cli users\`, \`hana-cli roles\`, \`hana-cli securityScan\`
- **Work with HANA Cloud**: \`hana-cli hanaCloudInstances\`, \`hana-cli hanaCloudStart\`
- **Manage HDI**: \`hana-cli containers\`, \`hana-cli adminHDI\`

## Key Patterns

1. **Always verify connection first:** \`hana-cli status\`
2. **Explore before modifying:** Use \`tables\`, \`inspectTable\`, \`dataProfile\` before import/export
3. **Use dry-run for imports:** \`hana-cli import --filename data.csv --table X --schema Y --dryRun\`
4. **Use --output flag:** Many commands support \`--output json|csv|table|excel\`
5. **Use --query flag with querySimple:** \`hana-cli querySimple --query "SELECT ..."\` (not positional args)
6. **Interactive mode:** Run \`hana-cli\` with no arguments for a menu-driven experience

## Connection Setup

\`\`\`bash
hana-cli connect                    # Interactive wizard
hana-cli connectViaServiceKey       # Via BTP service key
hana-cli copy2DefaultEnv            # Copy to default-env.json for CAP projects
hana-cli status                     # Verify connection
\`\`\`

## Reference

For the complete command reference with all parameters, see:
- HANA_CLI_REFERENCE.md (full reference, all commands)
- HANA_CLI_QUICKSTART.md (getting started, top 10 commands)
- HANA_CLI_EXAMPLES.md (real-world scenarios)
- HANA_CLI_WORKFLOWS.md (multi-step workflows)
- categories/*.md (per-category deep dives)

Or run \`hana-cli <command> --help\` for any specific command.
`
}

function generateCopilotInstructions(version) {
    return `${agentPreamble(version)}
## Copilot-Specific Notes

When assisting with SAP HANA development in this project:
- Suggest hana-cli commands when the developer needs to interact with HANA databases
- Use \`hana-cli querySimple --query "SQL"\` for ad-hoc queries (always use --query flag)
- Check connection with \`hana-cli status\` before suggesting database operations
- For data loading, recommend the dry-run pattern: import with --dryRun first, then without
- Refer to the HANA_CLI_REFERENCE.md file in this directory for detailed parameter information
`
}

function generateCopilotInstructionFile(version) {
    return `---
description: "Use when working with SAP HANA databases, CDS models, HDI containers, or BTP projects. Provides hana-cli command knowledge for database operations."
applyTo: "*.hdbcds,*.hdbtable,*.hdbview,*.hdbprocedure,*.hdbfunction,*.cds,mta.yaml,mta.yml,default-env.json,*.hdbgrants,*.hdbsynonym,*.hdbsequence"
---

${agentPreamble(version)}
`
}

function generateCopilotPrompt() {
    return `---
description: "Ask about hana-cli capabilities and get command recommendations"
---
You have access to hana-cli, a comprehensive SAP HANA CLI tool. When the user asks about database operations, suggest appropriate hana-cli commands.

Key commands:
- Schema exploration: tables, views, schemas, objects, inspectTable, inspectView
- Data operations: import, export, querySimple, dataProfile, dataValidator
- Performance: healthCheck, expensiveStatements, memoryAnalysis, tableHotspots
- Security: users, roles, securityScan, privilegeAnalysis
- Connection: connect, status, connectViaServiceKey

Always use \`hana-cli <command> --help\` for detailed parameter information.
Always use \`--query\` flag with querySimple: \`hana-cli querySimple --query "SELECT ..."\`
`
}

function generateCursorRules(version) {
    return `${agentPreamble(version)}`
}

function generateClaudeMd(version) {
    return `${agentPreamble(version)}`
}

function generateWindsurfRules(version) {
    return `${agentPreamble(version)}`
}

function generateClineRules(version) {
    return `${agentPreamble(version)}`
}

function generateGenericInstructions(version) {
    return `${agentPreamble(version)}

---

This file provides context for any AI coding assistant about the hana-cli tool.
Place it in your project root or in a location your coding agent reads for project context.
`
}

/**
 * Generate llms.txt — compact machine-readable format
 */
function generateLlmsTxt(canonical, version) {
    const lines = []
    lines.push(`# hana-cli`)
    lines.push(``)
    lines.push(`> SAP HANA Developer CLI Tool — simplifies database development operations`)
    lines.push(``)
    lines.push(`## Install: npm install -g hana-cli`)
    lines.push(`## Version: ${version}`)
    lines.push(`## Docs: https://github.com/SAP-samples/hana-developer-cli-tool-example`)
    lines.push(``)
    lines.push(`## Commands`)
    lines.push(``)

    for (const [name, cmd] of [...canonical].sort((a, b) => a[0].localeCompare(b[0]))) {
        const aliases = cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : ''
        const desc = cmd.useCases.length > 0 ? cmd.useCases[0] : formatCategory(cmd.category)
        lines.push(`- ${name}${aliases}: ${desc}`)
    }
    lines.push(``)
    lines.push(`## Quick Start`)
    lines.push(`- hana-cli connect`)
    lines.push(`- hana-cli status`)
    lines.push(`- hana-cli tables --schema MYSCHEMA`)
    lines.push(`- hana-cli inspectTable --table MYTABLE --schema MYSCHEMA`)
    lines.push(`- hana-cli querySimple --query "SELECT TOP 10 * FROM MYSCHEMA.MYTABLE"`)
    lines.push(`- hana-cli import --filename data.csv --table MYTABLE --schema MYSCHEMA --dryRun`)
    lines.push(`- hana-cli healthCheck`)

    return lines.join('\n')
}

// ── File Writing ────────────────────────────────────────────────────

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

function writeFile(filePath, content) {
    if (fs.existsSync(filePath) && !FORCE) {
        console.log(`  ⏩ Skipping (exists): ${path.relative(__dirname, filePath)}`)
        return false
    }
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`  ✅ ${path.relative(__dirname, filePath)}`)
    return true
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
    console.log('🔧 Generating portable agent instructions for hana-cli...')
    console.log('')

    // Load data
    console.log('📖 Loading data sources...')
    const [commandMeta, { enriched, categories, workflows }, { examples, presets }] = await Promise.all([
        loadCommandMetadata(),
        loadEnrichedMetadata(),
        loadExamplesPresets(),
    ])
    const commandFiles = loadAllCommandFiles()

    // Build canonical command map
    const canonical = buildCanonicalCommands(commandMeta, commandFiles, enriched, examples, presets)
    console.log(`   Found ${canonical.size} canonical commands`)

    const version = getVersion()
    let written = 0

    // Create directories
    ensureDir(OUTPUT_DIR)
    ensureDir(CATEGORIES_DIR)
    ensureDir(path.join(OUTPUT_DIR, 'copilot', '.github', 'instructions'))
    ensureDir(path.join(OUTPUT_DIR, 'copilot', '.github', 'prompts'))
    ensureDir(path.join(OUTPUT_DIR, 'cursor'))
    ensureDir(path.join(OUTPUT_DIR, 'claude'))
    ensureDir(path.join(OUTPUT_DIR, 'windsurf'))
    ensureDir(path.join(OUTPUT_DIR, 'cline'))
    ensureDir(path.join(OUTPUT_DIR, 'generic'))

    // ── Phase 1: Universal reference files ──
    console.log('')
    console.log('📝 Generating universal reference files...')
    if (writeFile(path.join(OUTPUT_DIR, 'HANA_CLI_REFERENCE.md'), generateReference(canonical, categories, workflows, version))) written++
    if (writeFile(path.join(OUTPUT_DIR, 'HANA_CLI_QUICKSTART.md'), generateQuickstart(canonical, version))) written++
    if (writeFile(path.join(OUTPUT_DIR, 'HANA_CLI_EXAMPLES.md'), generateExamples(canonical, examples, presets))) written++
    if (writeFile(path.join(OUTPUT_DIR, 'HANA_CLI_WORKFLOWS.md'), generateWorkflows(workflows))) written++

    // ── Phase 1.5: Per-category files ──
    console.log('')
    console.log('📂 Generating per-category reference files...')
    const byCategory = new Map()
    for (const [name, cmd] of canonical) {
        const cat = cmd.category
        if (!byCategory.has(cat)) byCategory.set(cat, [])
        byCategory.get(cat).push({ name, ...cmd })
    }
    for (const [cat, commands] of byCategory) {
        const catInfo = categories[cat]
        const fileName = `${cat}.md`
        commands.sort((a, b) => a.name.localeCompare(b.name))
        if (writeFile(path.join(CATEGORIES_DIR, fileName), generateCategoryFile(cat, catInfo, commands, examples, presets))) written++
    }

    // ── Phase 2: Agent format adapters ──
    console.log('')
    console.log('🤖 Generating agent format adapters...')

    // Copilot
    if (writeFile(path.join(OUTPUT_DIR, 'copilot', '.github', 'copilot-instructions.md'), generateCopilotInstructions(version))) written++
    if (writeFile(path.join(OUTPUT_DIR, 'copilot', '.github', 'instructions', 'hana-cli-usage.instructions.md'), generateCopilotInstructionFile(version))) written++
    if (writeFile(path.join(OUTPUT_DIR, 'copilot', '.github', 'prompts', 'hana-cli-help.prompt.md'), generateCopilotPrompt())) written++

    // Cursor
    if (writeFile(path.join(OUTPUT_DIR, 'cursor', '.cursorrules'), generateCursorRules(version))) written++

    // Claude Code
    if (writeFile(path.join(OUTPUT_DIR, 'claude', 'CLAUDE.md'), generateClaudeMd(version))) written++

    // Windsurf
    if (writeFile(path.join(OUTPUT_DIR, 'windsurf', '.windsurfrules'), generateWindsurfRules(version))) written++

    // Cline
    if (writeFile(path.join(OUTPUT_DIR, 'cline', '.clinerules'), generateClineRules(version))) written++

    // Generic
    if (writeFile(path.join(OUTPUT_DIR, 'generic', 'AGENT_INSTRUCTIONS.md'), generateGenericInstructions(version))) written++

    // llms.txt
    if (writeFile(path.join(OUTPUT_DIR, 'llms.txt'), generateLlmsTxt(canonical, version))) written++

    console.log('')
    console.log(`✅ Generated ${written} files in agent-instructions/`)
    console.log(`   Use --force to overwrite existing files`)
    process.exit(0)
}

main().catch(err => {
    console.error('❌ Generation failed:', err.message)
    console.error(err.stack)
    process.exit(1)
})
