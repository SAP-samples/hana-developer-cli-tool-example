#!/usr/bin/env node
// @ts-check
/**
 * Lightweight installer bundled with hana-cli-agent-instructions npm package.
 * Copies instruction files to the target project.
 * 
 * Usage: npx hana-cli-agent-instructions [--format <format>] [--target <path>] [--force] [--list]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = process.argv.slice(2)
/** @param {string} name */
function getArg(name) { const i = args.indexOf(`--${name}`); return i !== -1 && args[i + 1] ? args[i + 1] : null }
/** @param {string} name */
const hasFlag = (name) => args.includes(`--${name}`)

const FORMAT = getArg('format')
const TARGET = getArg('target') || '.'
const FORCE = hasFlag('force')

/** @type {Record<string, {name: string, detect: string[], files: {src: string, dest: string}[]}>} */
const FORMATS = {
    copilot:  { name: 'GitHub Copilot', detect: ['.github'], files: [
        { src: 'copilot/.github/copilot-instructions.md', dest: '.github/copilot-instructions.md' },
        { src: 'copilot/.github/instructions/hana-cli-usage.instructions.md', dest: '.github/instructions/hana-cli-usage.instructions.md' },
        { src: 'copilot/.github/prompts/hana-cli-help.prompt.md', dest: '.github/prompts/hana-cli-help.prompt.md' },
    ]},
    cursor:   { name: 'Cursor',       detect: ['.cursor', '.cursorrules'], files: [{ src: 'cursor/.cursorrules', dest: '.cursorrules' }]},
    claude:   { name: 'Claude Code',  detect: ['CLAUDE.md'], files: [{ src: 'claude/CLAUDE.md', dest: 'CLAUDE.md' }]},
    windsurf: { name: 'Windsurf',     detect: ['.windsurf', '.windsurfrules'], files: [{ src: 'windsurf/.windsurfrules', dest: '.windsurfrules' }]},
    cline:    { name: 'Cline',        detect: ['.cline', '.clinerules'], files: [{ src: 'cline/.clinerules', dest: '.clinerules' }]},
    generic:  { name: 'Generic',      detect: [], files: [{ src: 'generic/AGENT_INSTRUCTIONS.md', dest: 'AGENT_INSTRUCTIONS.md' }]},
}

const REFS = ['HANA_CLI_REFERENCE.md', 'HANA_CLI_QUICKSTART.md', 'HANA_CLI_EXAMPLES.md', 'HANA_CLI_WORKFLOWS.md', 'llms.txt']

if (hasFlag('help') || hasFlag('h')) {
    console.log(`\nUsage: npx hana-cli-agent-instructions [--format copilot|cursor|claude|windsurf|cline|generic|all] [--target ./path] [--force]\n`)
    process.exit(0)
}

if (hasFlag('list')) {
    console.log('\nFormats: ' + Object.keys(FORMATS).join(', ') + ', all\n')
    process.exit(0)
}

const targetDir = path.resolve(TARGET)

/** @param {string} targetDir */
function detect(targetDir) {
    for (const [fmt, info] of Object.entries(FORMATS)) {
        for (const d of info.detect) { if (fs.existsSync(path.join(targetDir, d))) return fmt }
    }
    return 'generic'
}

const format = FORMAT || detect(targetDir)
const formats = format === 'all' ? Object.keys(FORMATS) : [format]

if (format !== 'all' && !FORMATS[format]) {
    console.error(`Unknown format: ${format}. Available: ${Object.keys(FORMATS).join(', ')}, all`)
    process.exit(1)
}

console.log(`\n📦 Installing hana-cli agent instructions (${format === 'all' ? 'all' : FORMATS[format]?.name})`)

let n = 0
/**
 * @param {string} src
 * @param {string} dest
 */
function cp(src, dest) {
    const s = path.join(__dirname, src)
    const d = path.join(targetDir, dest)
    if (!fs.existsSync(s)) { console.log(`  ⚠️  Missing: ${src}`); return }
    if (fs.existsSync(d) && !FORCE) { console.log(`  ⏩ Exists: ${dest}`); return }
    fs.mkdirSync(path.dirname(d), { recursive: true })
    fs.copyFileSync(s, d)
    console.log(`  ✅ ${dest}`)
    n++
}

for (const r of REFS) cp(r, r)
for (const fmt of formats) { for (const f of FORMATS[fmt].files) cp(f.src, f.dest) }

console.log(`\n✅ Installed ${n} files\n`)
