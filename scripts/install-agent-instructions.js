#!/usr/bin/env node
// @ts-check
/**
 * Install hana-cli agent instructions into a target project
 * 
 * Usage:
 *   npx hana-cli-agent-instructions [--format <format>] [--target <path>] [--force] [--list]
 * 
 * Formats: copilot, cursor, claude, windsurf, cline, generic, all
 * 
 * Examples:
 *   npx hana-cli-agent-instructions --format copilot
 *   npx hana-cli-agent-instructions --format all --target ./my-project
 *   npx hana-cli-agent-instructions --list
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const INSTRUCTIONS_DIR = path.join(__dirname, '..') // Relative to scripts/ or root depending on install

// Parse args
const args = process.argv.slice(2)
/** @param {string} name */
function getArg(name) {
    const idx = args.indexOf(`--${name}`)
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
}
/** @param {string} name */
const hasFlag = (name) => args.includes(`--${name}`)

const FORMAT = getArg('format')
const TARGET = getArg('target') || '.'
const FORCE = hasFlag('force')
const LIST = hasFlag('list')
const HELP = hasFlag('help') || hasFlag('h')

/** @type {Record<string, {name: string, detect: string[], files: {src: string, dest: string}[]}>} */
const FORMATS = {
    copilot: {
        name: 'GitHub Copilot',
        detect: ['.github'],
        files: [
            { src: 'copilot/.github/copilot-instructions.md', dest: '.github/copilot-instructions.md' },
            { src: 'copilot/.github/instructions/hana-cli-usage.instructions.md', dest: '.github/instructions/hana-cli-usage.instructions.md' },
            { src: 'copilot/.github/prompts/hana-cli-help.prompt.md', dest: '.github/prompts/hana-cli-help.prompt.md' },
        ],
    },
    cursor: {
        name: 'Cursor',
        detect: ['.cursor', '.cursorrules'],
        files: [
            { src: 'cursor/.cursorrules', dest: '.cursorrules' },
        ],
    },
    claude: {
        name: 'Claude Code',
        detect: ['CLAUDE.md'],
        files: [
            { src: 'claude/CLAUDE.md', dest: 'CLAUDE.md' },
        ],
    },
    windsurf: {
        name: 'Windsurf',
        detect: ['.windsurf', '.windsurfrules'],
        files: [
            { src: 'windsurf/.windsurfrules', dest: '.windsurfrules' },
        ],
    },
    cline: {
        name: 'Cline',
        detect: ['.cline', '.clinerules'],
        files: [
            { src: 'cline/.clinerules', dest: '.clinerules' },
        ],
    },
    generic: {
        name: 'Generic (any agent)',
        detect: [],
        files: [
            { src: 'generic/AGENT_INSTRUCTIONS.md', dest: 'AGENT_INSTRUCTIONS.md' },
        ],
    },
}

// Shared reference files always copied
const REFERENCE_FILES = [
    { src: 'HANA_CLI_REFERENCE.md', dest: 'HANA_CLI_REFERENCE.md' },
    { src: 'HANA_CLI_QUICKSTART.md', dest: 'HANA_CLI_QUICKSTART.md' },
    { src: 'HANA_CLI_EXAMPLES.md', dest: 'HANA_CLI_EXAMPLES.md' },
    { src: 'HANA_CLI_WORKFLOWS.md', dest: 'HANA_CLI_WORKFLOWS.md' },
    { src: 'llms.txt', dest: 'llms.txt' },
]

function findInstructionsDir() {
    // Check several possible locations
    const candidates = [
        path.join(__dirname, '..'),                     // scripts/ → root
        __dirname,                                       // root directly
        path.join(__dirname, '..', 'agent-instructions'), // if run from scripts/
        path.join(__dirname, 'agent-instructions'),      // if run from root
    ]

    for (const dir of candidates) {
        if (fs.existsSync(path.join(dir, 'HANA_CLI_REFERENCE.md'))) {
            return dir
        }
    }

    // npm package structure
    const npmPkg = path.join(__dirname, '..', 'node_modules', 'hana-cli-agent-instructions')
    if (fs.existsSync(path.join(npmPkg, 'HANA_CLI_REFERENCE.md'))) {
        return npmPkg
    }

    return null
}

/** @param {string} targetDir */
function detectFormat(targetDir) {
    for (const [format, info] of Object.entries(FORMATS)) {
        for (const indicator of info.detect) {
            if (fs.existsSync(path.join(targetDir, indicator))) {
                return format
            }
        }
    }
    return 'generic'
}

/**
 * @param {string} srcDir
 * @param {string} srcRel
 * @param {string} destDir
 * @param {string} destRel
 */
function copyFile(srcDir, srcRel, destDir, destRel) {
    const srcPath = path.join(srcDir, srcRel)
    const destPath = path.join(destDir, destRel)

    if (!fs.existsSync(srcPath)) {
        console.warn(`  ⚠️  Source not found: ${srcRel}`)
        return false
    }

    if (fs.existsSync(destPath) && !FORCE) {
        console.log(`  ⏩ Exists (use --force to overwrite): ${destRel}`)
        return false
    }

    const destDirPath = path.dirname(destPath)
    if (!fs.existsSync(destDirPath)) {
        fs.mkdirSync(destDirPath, { recursive: true })
    }

    fs.copyFileSync(srcPath, destPath)
    console.log(`  ✅ ${destRel}`)
    return true
}

function showHelp() {
    console.log(`
hana-cli Agent Instructions Installer

Install hana-cli knowledge into your project so AI coding assistants
can help you work with SAP HANA databases.

Usage:
  npx hana-cli-agent-instructions [options]

Options:
  --format <fmt>   Target format: copilot, cursor, claude, windsurf, cline, generic, all
                   (auto-detected if not specified)
  --target <path>  Target directory (default: current directory)
  --force          Overwrite existing files
  --list           List available formats and exit
  --help           Show this help

Examples:
  npx hana-cli-agent-instructions                        # Auto-detect and install
  npx hana-cli-agent-instructions --format copilot       # Install for GitHub Copilot
  npx hana-cli-agent-instructions --format all           # Install all formats
  npx hana-cli-agent-instructions --format cursor --force  # Overwrite existing
`)
}

function showList() {
    console.log('\nAvailable formats:\n')
    for (const [key, info] of Object.entries(FORMATS)) {
        const files = info.files.map(f => f.dest).join(', ')
        console.log(`  ${key.padEnd(12)} ${info.name}`)
        console.log(`${''.padEnd(14)} Files: ${files}`)
    }
    console.log(`\n  all${''.padEnd(9)} Install all formats`)
    console.log(`\nShared reference files (always copied):`)
    for (const f of REFERENCE_FILES) {
        console.log(`  ${f.dest}`)
    }
}

async function main() {
    if (HELP) {
        showHelp()
        process.exit(0)
    }

    if (LIST) {
        showList()
        process.exit(0)
    }

    const targetDir = path.resolve(TARGET)
    const instructionsDir = findInstructionsDir()

    if (!instructionsDir) {
        console.error('❌ Could not find hana-cli agent instruction files.')
        console.error('   Make sure this is run from the hana-cli repo or install hana-cli-agent-instructions package.')
        process.exit(1)
    }

    const format = FORMAT || detectFormat(targetDir)
    const formats = format === 'all' ? Object.keys(FORMATS) : [format]

    if (format !== 'all' && !FORMATS[format]) {
        console.error(`❌ Unknown format: ${format}`)
        console.error(`   Available: ${Object.keys(FORMATS).join(', ')}, all`)
        process.exit(1)
    }

    console.log(`\n📦 Installing hana-cli agent instructions`)
    console.log(`   Target: ${targetDir}`)
    console.log(`   Format: ${format === 'all' ? 'all formats' : FORMATS[format]?.name || format}`)
    console.log('')

    let copied = 0

    // Copy shared reference files
    console.log('📖 Reference files:')
    for (const ref of REFERENCE_FILES) {
        if (copyFile(instructionsDir, ref.src, targetDir, ref.dest)) copied++
    }

    // Copy format-specific files
    for (const fmt of formats) {
        const info = FORMATS[fmt]
        console.log(`\n🤖 ${info.name} files:`)
        for (const file of info.files) {
            if (copyFile(instructionsDir, file.src, targetDir, file.dest)) copied++
        }
    }

    console.log(`\n✅ Installed ${copied} files`)
    if (!FORCE) {
        console.log(`   Use --force to overwrite existing files`)
    }
    process.exit(0)
}

main().catch(err => {
    console.error('❌ Installation failed:', err.message)
    process.exit(1)
})
