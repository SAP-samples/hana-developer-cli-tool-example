#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function readStdin() {
    return new Promise(resolve => {
        let data = ''
        process.stdin.setEncoding('utf8')
        process.stdin.on('data', chunk => {
            data += chunk
        })
        process.stdin.on('end', () => resolve(data))
        process.stdin.on('error', () => resolve(''))
    })
}

function parseJson(input) {
    if (!input) return null
    try {
        return JSON.parse(input)
    } catch {
        return null
    }
}

function findRepoRoot(startDir) {
    let current = startDir
    while (current && current !== path.dirname(current)) {
        if (fs.existsSync(path.join(current, '.git'))) {
            return current
        }
        current = path.dirname(current)
    }
    return startDir
}

function runCommand(command, args, cwd) {
    const result = spawnSync(command, args, {
        cwd,
        stdio: 'pipe',
        encoding: 'utf8'
    })

    return {
        status: result.status ?? 0,
        stdout: result.stdout || '',
        stderr: result.stderr || ''
    }
}

function getChangedFiles(repoRoot) {
    const result = runCommand('git', ['status', '--porcelain'], repoRoot)
    if (result.status !== 0) {
        return []
    }

    return result.stdout
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => line.slice(3))
}

function matchesAny(filePath, prefixes) {
    return prefixes.some(prefix => filePath.startsWith(prefix))
}

function loadCache(cachePath) {
    if (!fs.existsSync(cachePath)) return {}
    try {
        return JSON.parse(fs.readFileSync(cachePath, 'utf8'))
    } catch {
        return {}
    }
}

function saveCache(cachePath, cache) {
    fs.mkdirSync(path.dirname(cachePath), { recursive: true })
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8')
}

async function main() {
    const input = await readStdin()
    const payload = parseJson(input) || {}
    const toolName = payload?.toolName || payload?.tool?.name || payload?.name || ''

    if (!['apply_patch', 'create_file', 'edit_notebook_file', 'run_in_terminal'].includes(toolName)) {
        process.stdout.write(JSON.stringify({}))
        return
    }

    const repoRoot = findRepoRoot(path.join(__dirname, '..', '..'))
    const changedFiles = getChangedFiles(repoRoot)

    if (changedFiles.length === 0) {
        process.stdout.write(JSON.stringify({}))
        return
    }

    const cachePath = path.join(repoRoot, '.github', 'hooks', '.cache.json')
    const cache = loadCache(cachePath)
    const cacheKey = changedFiles.sort().join('|')
    if (cache.lastRunKey === cacheKey) {
        process.stdout.write(JSON.stringify({}))
        return
    }

    const scriptsToRun = []
    const notes = []

    if (changedFiles.some(file => matchesAny(file, ['docs/', 'docs\\']))) {
        scriptsToRun.push({
            name: 'build-docs-index',
            command: 'node',
            args: ['scripts/build-docs-index.js']
        })
    }

    if (changedFiles.some(file => matchesAny(file, ['_i18n/', '_i18n\\']))) {
        scriptsToRun.push({
            name: 'validate-i18n',
            command: 'node',
            args: ['scripts/validate-i18n.js', '--quiet']
        })
    }

    if (changedFiles.some(file => file === 'package.json')) {
        notes.push('package.json changed — consider running npm test or npm run coverage:check')
    }

    if (changedFiles.some(file => matchesAny(file, ['.github/workflows/', '.github\\workflows\\']))) {
        notes.push('workflow files changed — consider validating YAML and permissions')
    }

    const failures = []

    for (const script of scriptsToRun) {
        const result = runCommand(script.command, script.args, repoRoot)
        if (result.status !== 0) {
            failures.push(`${script.name} failed (exit ${result.status})`)
        }
    }

    cache.lastRunKey = cacheKey
    cache.lastRunAt = new Date().toISOString()
    saveCache(cachePath, cache)

    const messages = []

    if (scriptsToRun.length > 0) {
        messages.push(`Auto-ran checks: ${scriptsToRun.map(s => s.name).join(', ')}`)
    }

    if (failures.length > 0) {
        messages.push(`Failures: ${failures.join('; ')}`)
    }

    if (notes.length > 0) {
        messages.push(`Notes: ${notes.join(' | ')}`)
    }

    if (messages.length === 0) {
        process.stdout.write(JSON.stringify({}))
        return
    }

    process.stdout.write(
        JSON.stringify({
            systemMessage: messages.join('\n')
        })
    )
}

main().catch(() => {
    process.stdout.write(JSON.stringify({}))
})
