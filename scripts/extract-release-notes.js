#!/usr/bin/env node
// @ts-check
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

const args = process.argv.slice(2)
const versionIdx = args.indexOf('--version')
const targetVersion = versionIdx >= 0 ? args[versionIdx + 1] : null

const changelog = JSON.parse(readFileSync(join(ROOT, 'CHANGELOG.json'), 'utf8'))

const entry = targetVersion
  ? changelog.find(e => e.version === targetVersion)
  : changelog[0]

if (!entry) {
  console.log(`No changelog entry found${targetVersion ? ` for version ${targetVersion}` : ''}`)
  process.exit(0)
}

const categories = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security']
let md = `## What's New in v${entry.version}\n\nRelease date: ${entry.date}\n`

for (const cat of categories) {
  if (entry[cat] && entry[cat].length > 0) {
    md += `\n### ${cat}\n\n`
    for (const item of entry[cat]) {
      md += `- ${item}\n`
    }
  }
}

console.log(md)
