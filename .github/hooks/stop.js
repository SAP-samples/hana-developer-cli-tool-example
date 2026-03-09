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

async function main() {
    await readStdin()

    const repoRoot = findRepoRoot(path.join(__dirname, '..', '..'))
    const changedFiles = getChangedFiles(repoRoot)

    if (changedFiles.length === 0) {
        process.stdout.write(JSON.stringify({}))
        return
    }

    const reminders = []

    if (changedFiles.some(file => file.startsWith('docs/') || file.startsWith('docs\\'))) {
        reminders.push('Docs changed — consider running `node scripts/build-docs-index.js`')
    }

    if (changedFiles.some(file => file.startsWith('_i18n/') || file.startsWith('_i18n\\'))) {
        reminders.push('i18n files changed — consider running `node scripts/validate-i18n.js`')
    }

    if (changedFiles.includes('package.json')) {
        reminders.push('package.json changed — consider running tests or coverage checks')
    }

    if (changedFiles.some(file => file.startsWith('.github/workflows/') || file.startsWith('.github\\workflows\\'))) {
        reminders.push('workflow files changed — consider validating YAML and permissions')
    }

    if (reminders.length === 0) {
        process.stdout.write(JSON.stringify({}))
        return
    }

    process.stdout.write(
        JSON.stringify({
            systemMessage: `Before you finish, consider:\n- ${reminders.join('\n- ')}`
        })
    )
}

main().catch(() => {
    process.stdout.write(JSON.stringify({}))
})
