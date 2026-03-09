// @ts-check
import { buildDocEpilogue } from '../utils/doc-linker.js'
import * as baseLite from '../utils/base-lite.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const command = 'examples [command] [query...]'
export const aliases = ['example']
export const describe = baseLite.bundle.getText("examplesCommand")

export const builder = (yargs) => yargs
  .positional('command', {
    type: 'string',
    describe: 'Command name to show examples for (optional)'
  })
  .positional('query', {
    array: true,
    type: 'string',
    describe: 'Search terms for examples'
  })
  .option('search', {
    alias: 's',
    type: 'boolean',
    default: false,
    describe: 'Search examples by keyword'
  })
  .option('limit', {
    alias: 'l',
    type: 'number',
    default: 10,
    describe: 'Maximum number of results'
  })
  .option('format', {
    alias: 'f',
    choices: ['text', 'json'],
    default: 'text',
    describe: 'Output format'
  })
  .example('hana-cli examples', 'Show all examples')
  .example('hana-cli example import', 'Show examples for import command')
  .example('hana-cli examples search "duplicate"', 'Search examples by keyword')
  .example('hana-cli examples --search csv', 'Search for CSV-related examples')
  .epilog(buildDocEpilogue('examples', 'developer-tools', ['helpDocu', 'readMe']))

export async function handler(argv) {
  const base = await import('../utils/base.js')
  await showExamples(argv)
}

export async function showExamples(argv) {
  const base = await import('../utils/base.js')
  base.debug('showExamples')

  try {
    // Load examples data
    const examplesPath = join(__dirname, '../data/examples.json')
    const examplesContent = readFileSync(examplesPath, 'utf-8')
    const examplesData = JSON.parse(examplesContent)

    // Determine mode: list all, show specific, or search
    let result
    
    if (argv.command === 'search' || argv.search) {
      // Search mode
      const searchTerms = argv.query && argv.query.length > 0 ? argv.query.join(' ') : argv.command
      if (!searchTerms) {
        console.log(baseLite.colors.yellow('Please provide search terms. Example: hana-cli examples search "duplicate"'))
        process.exit(0)
      }
      result = searchExamples(examplesData, searchTerms, argv.limit || 10)
    } else if (argv.command) {
      // Show examples for specific command
      result = getCommandExamples(examplesData, argv.command)
    } else {
      // List all examples
      result = listAllExamples(examplesData)
    }

    // Display based on format
    if (argv.format === 'json') {
      console.log(JSON.stringify(result, null, 2))
    } else {
      displayResults(result, argv.command)
    }

  } catch (error) {
    console.error(baseLite.colors.red(`Error loading examples: ${error.message}`))
    process.exit(1)
  }

  process.exit(0)
}

function listAllExamples(examplesData) {
  return examplesData.examples.map(ex => ({
    command: ex.command,
    aliases: ex.aliases.join(', '),
    description: ex.description,
    exampleCount: ex.examples.length
  }))
}

function getCommandExamples(examplesData, commandName) {
  const commandLower = commandName.toLowerCase()
  const found = examplesData.examples.find(ex => 
    ex.command.toLowerCase() === commandLower || 
    ex.aliases.some(alias => alias.toLowerCase() === commandLower)
  )

  if (!found) {
    return null
  }

  return found
}

function searchExamples(examplesData, searchTerms, limit) {
  const terms = searchTerms.toLowerCase().split(' ')
  
  const results = examplesData.examples
    .map(ex => {
      // Calculate match score
      let score = 0
      const textToSearch = (
        `${ex.command} ${ex.aliases.join(' ')} ${ex.title} ${ex.description} ` +
        ex.examples.map(e => `${e.usage} ${e.description}`).join(' ')
      ).toLowerCase()

      terms.forEach(term => {
        if (textToSearch.includes(term)) {
          score += 1
          // Boost score if term is in command name
          if (ex.command.toLowerCase().includes(term)) score += 2
          if (ex.title.toLowerCase().includes(term)) score += 1
        }
      })

      return { ...ex, matchScore: score }
    })
    .filter(ex => ex.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
    .map(({ matchScore, ...rest }) => rest)

  return results
}

function displayResults(results, commandName) {
  if (!results) {
    console.log(baseLite.colors.yellow(`No examples found for command "${commandName}"`))
    process.exit(0)
  }

  if (Array.isArray(results)) {
    // List view (all or search results)
    if (results.length === 0) {
      console.log(baseLite.colors.yellow('No examples found.'))
      process.exit(0)
    }

    if (commandName === 'search' || results[0].exampleCount !== undefined) {
      // Show list of commands
      console.log(baseLite.colors.cyan.bold('\n📚 Available Commands with Examples:\n'))
      
      results.forEach(cmd => {
        console.log(baseLite.colors.green(`  ${cmd.command}`))
        if (cmd.aliases) {
          console.log(`    Aliases: ${cmd.aliases}`)
        }
        if (cmd.description) {
          console.log(`    ${cmd.description}`)
        }
        if (cmd.exampleCount !== undefined) {
          console.log(`    ${baseLite.colors.blue(`${cmd.exampleCount} examples available`)}`)
        }
        console.log()
      })
    } else {
      // Show search results
      console.log(baseLite.colors.cyan.bold(`\n🔍 Examples matching your search:\n`))
      
      results.forEach((cmd, idx) => {
        console.log(baseLite.colors.green(`${idx + 1}. ${cmd.command}`))
        console.log(`   ${cmd.description}`)
        console.log()
      })
    }
  } else {
    // Detail view (specific command)
    const cmd = results
    console.log(baseLite.colors.cyan.bold(`\n📖 ${cmd.title}\n`))
    console.log(baseLite.colors.gray(cmd.description))
    console.log()

    if (cmd.aliases && cmd.aliases.length > 0) {
      console.log(baseLite.colors.blue(`Aliases: ${cmd.aliases.join(', ')}`))
      console.log()
    }

    console.log(baseLite.colors.yellow.bold('Examples:'))
    console.log()

    cmd.examples.forEach((example, idx) => {
      console.log(baseLite.colors.green(`  ${idx + 1}. ${example.description}`))
      console.log(baseLite.colors.blue(`     $ ${example.usage}`))
      console.log()
    })

    // Show related commands
    const relatedCmds = cmd.aliases.slice(0, 2).join(', ')
    if (relatedCmds) {
      console.log(baseLite.colors.gray(`Also try: hana-cli ${relatedCmds}`))
      console.log()
    }
  }
}
