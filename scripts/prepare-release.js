#!/usr/bin/env node
// @ts-check
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

const PACKAGES = {
  'hana-cli': {
    dir: ROOT,
    tagPrefix: 'v',
    changelogPath: join(ROOT, 'CHANGELOG.json'),
  },
  'agent-instructions': {
    dir: join(ROOT, 'agent-instructions'),
    tagPrefix: 'agent-v',
    changelogPath: null,
  },
  'mcp-server': {
    dir: join(ROOT, 'mcp-server'),
    tagPrefix: 'mcp-v',
    changelogPath: null,
  },
}

function parseArgs(argv) {
  const args = { package: 'hana-cli', version: '', changelogEntries: [], dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--package':
        args.package = argv[++i]
        break
      case '--version':
        args.version = argv[++i]
        break
      case '--changelog-entries':
        try {
          args.changelogEntries = JSON.parse(argv[++i])
        } catch {
          console.error('Error: --changelog-entries must be valid JSON')
          process.exit(1)
        }
        break
      case '--dry-run':
        args.dryRun = true
        break
      case '--help':
        console.log(`Usage: node prepare-release.js [options]
  --package <name>              Package: hana-cli | agent-instructions | mcp-server (default: hana-cli)
  --version <version>           Explicit version. If omitted, auto-calculated from current date.
  --changelog-entries <json>    JSON array of {category, text} objects
  --dry-run                     Preview changes without writing files
  --help                        Show this help`)
        process.exit(0)
      default:
        break
    }
  }
  return args
}

function calculateVersion(currentVersion, explicitVersion) {
  if (explicitVersion) return explicitVersion

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const dateSegment = `${year}${month}`

  const parts = currentVersion.split('.')
  const major = parts[0]
  const currentDateSegment = parts[1]

  if (dateSegment === currentDateSegment) {
    const currentPatch = parseInt(parts[2], 10)
    return `${major}.${dateSegment}.${currentPatch + 1}`
  }
  return `${major}.${dateSegment}.0`
}

function buildChangelogEntry(version, entries) {
  const entry = {
    date: new Date().toISOString().split('T')[0],
    version,
  }

  for (const { category, text } of entries) {
    const key = category || 'Changed'
    if (!entry[key]) entry[key] = []
    entry[key].push(text)
  }

  if (Object.keys(entry).length === 2) {
    entry.Changed = [`Release version ${version}`]
  }

  return entry
}

function run() {
  const args = parseArgs(process.argv.slice(2))
  const pkgConfig = PACKAGES[args.package]

  if (!pkgConfig) {
    console.error(`Error: unknown package "${args.package}". Use: ${Object.keys(PACKAGES).join(', ')}`)
    process.exit(1)
  }

  const pkgPath = join(pkgConfig.dir, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  const currentVersion = pkg.version
  const newVersion = calculateVersion(currentVersion, args.version)

  if (args.dryRun) {
    console.error(`[dry-run] Package: ${args.package}`)
    console.error(`[dry-run] Current version: ${currentVersion}`)
    console.error(`[dry-run] New version: ${newVersion}`)
    console.error(`[dry-run] Tag: ${pkgConfig.tagPrefix}${newVersion}`)
  }

  // Version bump uses npm version which safely updates both package.json and npm-shrinkwrap.json.
  // The version string is either auto-calculated from the current date or explicitly provided by
  // the developer — never from untrusted input.
  if (!args.dryRun) {
    if (newVersion !== currentVersion) {
      execSync(`npm version ${newVersion} --no-git-tag-version`, {
        cwd: pkgConfig.dir,
        stdio: 'pipe',
      })
    }

    if (args.package === 'hana-cli') {
      const mcpPkg = JSON.parse(readFileSync(join(PACKAGES['mcp-server'].dir, 'package.json'), 'utf8'))
      const mcpParts = mcpPkg.version.split('.')
      const mainParts = newVersion.split('.')
      const alignedMcpVersion = `${mcpParts[0]}.${mainParts[1]}.${mainParts[2]}`

      if (alignedMcpVersion !== mcpPkg.version) {
        execSync(`npm version ${alignedMcpVersion} --no-git-tag-version`, {
          cwd: PACKAGES['mcp-server'].dir,
          stdio: 'pipe',
        })
      }

      const serverJsonPath = join(ROOT, 'server.json')
      const serverJson = JSON.parse(readFileSync(serverJsonPath, 'utf8'))
      serverJson.version = newVersion
      if (serverJson.packages?.[0]) {
        serverJson.packages[0].version = newVersion
      }
      writeFileSync(serverJsonPath, JSON.stringify(serverJson, null, 2) + '\n')
    }
  }

  if (pkgConfig.changelogPath) {
    const changelog = JSON.parse(readFileSync(pkgConfig.changelogPath, 'utf8'))
    const newEntry = buildChangelogEntry(newVersion, args.changelogEntries)

    if (args.dryRun) {
      console.error(`[dry-run] New CHANGELOG entry:`)
      console.error(JSON.stringify(newEntry, null, 2))
    } else {
      changelog.unshift(newEntry)
      writeFileSync(pkgConfig.changelogPath, JSON.stringify(changelog, null, 4) + '\n')
      execSync('node CHANGELOG.js', { cwd: ROOT, stdio: 'pipe' })
    }
  }

  const result = {
    version: newVersion,
    tag: `${pkgConfig.tagPrefix}${newVersion}`,
  }
  console.log(JSON.stringify(result))
}

run()
