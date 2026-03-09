#!/usr/bin/env node

import fs from 'node:fs'

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

function getToolName(payload) {
    return payload?.toolName || payload?.tool?.name || payload?.name || ''
}

function getCommand(payload) {
    return (
        payload?.toolInput?.command ||
        payload?.tool?.input?.command ||
        payload?.arguments?.command ||
        payload?.input?.command ||
        ''
    )
}

function isRiskyCommand(command) {
    const normalized = command.toLowerCase()
    const riskyPatterns = [
        /\bnpm\s+(install|i)\b/,
        /\bnpm\s+ci\b/,
        /\bnpm\s+publish\b/,
        /\bnpm\s+uninstall\b/,
        /\bnpm\s+remove\b/,
        /\bnpm\s+link\b/,
        /\byarn\s+add\b/,
        /\byarn\s+remove\b/,
        /\bpnpm\s+add\b/,
        /\bpnpm\s+install\b/,
        /\bgit\s+push\b/,
        /\bgit\s+reset\s+--hard\b/,
        /\bgit\s+clean\s+-[fdx]{1,3}\b/,
        /\brm\s+-rf\b/,
        /\brmdir\s+\/s\b/,
        /\bdel\s+\/s\b/,
        /\bremove-item\b.*-recurse.*-force/,
        /\bformat\b.*\bdrive\b/
    ]

    return riskyPatterns.some(pattern => pattern.test(normalized))
}

async function main() {
    const input = await readStdin()
    const payload = parseJson(input) || {}
    const toolName = getToolName(payload)

    if (toolName !== 'run_in_terminal') {
        process.stdout.write(JSON.stringify({}))
        return
    }

    const command = getCommand(payload)

    if (!command || !isRiskyCommand(command)) {
        process.stdout.write(JSON.stringify({}))
        return
    }

    const output = {
        hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'ask',
            permissionDecisionReason: 'Potentially risky command detected. Confirm before running.'
        },
        systemMessage: 'This command may modify the workspace or environment. Please confirm before proceeding.'
    }

    process.stdout.write(JSON.stringify(output))
}

main().catch(() => {
    process.stdout.write(JSON.stringify({}))
})
