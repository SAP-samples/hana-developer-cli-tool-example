// @ts-check
import * as baseLite from '../utils/base-lite.js'
import { buildDocEpilogue } from '../utils/doc-linker.js'
import { commandMap } from './commandMap.js'
import { commandMetadata } from './commandMetadata.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const command = 'interactive'
export const aliases = ['i', 'repl', 'shell']
export const describe = baseLite.bundle.getText("interactive")

export const builder = (yargs) => yargs
  .option('preset', {
    alias: 'p',
    type: 'string',
    describe: baseLite.bundle.getText('presetOption')
  })
  .option('category', {
    alias: 'cat',
    type: 'string',
    describe: baseLite.bundle.getText('categoryOption')
  })
  .example('hana-cli interactive', baseLite.bundle.getText('interactiveExample1'))
  .example('hana-cli interactive --category data-tools', baseLite.bundle.getText('interactiveExample2'))
  .example('hana-cli interactive --preset myimport', baseLite.bundle.getText('interactiveExample3'))
  .epilog(buildDocEpilogue('interactive', 'developer-tools', ['helpDocu', 'examples', 'kb']))

export async function handler(argv) {
  const base = await import('../utils/base.js')
  await runInteractiveMode(argv)
}

/**
 * Main interactive mode function
 * @param {any} argv
 */
async function runInteractiveMode(argv) {
  const base = await import('../utils/base.js')
  const { select, input, confirm } = await import('@inquirer/prompts')
  const chalk = (await import('chalk')).default
  const bundle = baseLite.bundle
  
  // Load interactive state (history, presets)
  const interactiveState = loadInteractiveState()
  
  // Show welcome banner
  showWelcomeBanner(chalk, bundle)
  
  try {
    let continueLoop = true
    
    while (continueLoop) {
      console.log('\n' + chalk.cyan('═'.repeat(80)))
      
      // Main menu
      const action = await select({
        message: chalk.bold(bundle.getText('mainMenuPrompt')),
        choices: [
          { name: bundle.getText('mainMenuSearch'), value: 'search' },
          { name: bundle.getText('mainMenuCategory'), value: 'category' },
          { name: bundle.getText('mainMenuRecent'), value: 'recent', disabled: interactiveState.history.length === 0 ? bundle.getText('noHistoryYet') : false },
          { name: bundle.getText('mainMenuPreset'), value: 'preset', disabled: Object.keys(interactiveState.presets).length === 0 ? bundle.getText('noPresetsSaved') : false },
          { name: bundle.getText('mainMenuWorkflow'), value: 'workflow' },
          { name: bundle.getText('mainMenuExit'), value: 'exit' }
        ],
        pageSize: 10
      })
      
      if (action === 'exit') {
        continueLoop = false
        continue
      }
      
      let commandToRun = null
      let params = null
      
      switch (action) {
        case 'search':
          ({ command: commandToRun, params } = await searchAndSelectCommand(select, input, confirm, chalk, base, bundle))
          break
        case 'category':
          ({ command: commandToRun, params } = await browseByCategory(select, chalk, base, bundle, argv.category))
          break
        case 'recent':
          ({ command: commandToRun, params } = await selectFromRecent(select, confirm, chalk, interactiveState, bundle))
          break
        case 'preset':
          ({ command: commandToRun, params } = await loadPreset(select, chalk, interactiveState, bundle))
          break
        case 'workflow':
          ({ command: commandToRun, params } = await guidedWorkflow(select, input, confirm, chalk, base, bundle))
          break
      }
      
      if (commandToRun && params) {
        // Execute the command
        const success = await executeCommand(commandToRun, params, chalk, base, bundle)
        
        // Update history if successful
        if (success) {
          addToHistory(interactiveState, commandToRun, params)
          
          // Offer to save as preset
          const savePreset = await confirm({
            message: bundle.getText('presetSavePrompt'),
            default: false
          })
          
          if (savePreset) {
            const presetName = await input({
              message: bundle.getText('presetNamePrompt'),
              validate: (value) => value.trim().length > 0 || bundle.getText('presetNameValidation')
            })
            
            interactiveState.presets[presetName] = { command: commandToRun, params }
            saveInteractiveState(interactiveState)
            console.log(chalk.green(bundle.getText('presetSaved', [presetName])))
          }
        }
      }
      
      // Ask to continue
      if (continueLoop) {
        const again = await confirm({
          message: chalk.bold(bundle.getText('runAnother')),
          default: true
        })
        continueLoop = again
      }
    }
    
    console.log(chalk.cyan('\n' + bundle.getText('exitingMessage') + '\n'))
    // Return normally to let yargs handle the exit
    
  } catch (error) {
    if (error.message?.includes('User force closed')) {
      console.log(chalk.yellow('\n\n' + bundle.getText('exitingInterrupt') + '\n'))
      // Return normally for user-initiated exit (Ctrl+C)
      return
    }
    // Re-throw the error to let the CLI error handler deal with it
    throw error
  }
}

/**
 * Show welcome banner
 * @param {any} chalk
 * @param {any} bundle
 */
function showWelcomeBanner(chalk, bundle) {
  console.log(chalk.cyan('\n╔═══════════════════════════════════════════════════════════════════════════════╗'))
  console.log(chalk.cyan('║') + chalk.bold.white('              🚀 ' + bundle.getText('welcomeBanner') + ' 🚀                              ') + chalk.cyan('║'))
  console.log(chalk.cyan('╚═══════════════════════════════════════════════════════════════════════════════╝'))
  console.log(chalk.white('\n  ' + bundle.getText('welcomeMessage')))
  console.log(chalk.gray('  ' + bundle.getText('welcomeFeature1')))
  console.log(chalk.gray('  ' + bundle.getText('welcomeFeature2')))
  console.log(chalk.gray('  ' + bundle.getText('welcomeFeature3') + '\n'))
}

/**
 * Search and select a command
 * @param {any} select
 * @param {any} input
 * @param {any} confirm
 * @param {any} chalk
 * @param {any} base
 * @param {any} bundle
 */
async function searchAndSelectCommand(select, input, confirm, chalk, base, bundle) {
  const searchTerm = await input({
    message: bundle.getText('searchPrompt'),
    validate: (value) => value.trim().length > 0 || bundle.getText('searchValidation')
  })
  
  // Filter commands by search term
  const searchLower = searchTerm.toLowerCase()
  const matchingCommands = Object.entries(commandMap)
    .filter(([cmd, _]) => {
      // Exclude aliases - only show primary commands
      const cmdLower = cmd.toLowerCase()
      return cmdLower.includes(searchLower) && 
             !cmd.includes('UI') && 
             cmd.length > 2 // Filter out single/double letter aliases
    })
    .reduce((acc, [cmd, path]) => {
      // Deduplicate by file path
      if (!acc.find(item => item.path === path)) {
        acc.push({ name: cmd, path })
      }
      return acc
    }, [])
  
  if (matchingCommands.length === 0) {
    console.log(chalk.yellow(bundle.getText('searchNoResults', [searchTerm])))
    return { command: null, params: null }
  }
  
  // Get command descriptions
  const commandChoices = await Promise.all(matchingCommands.map(async ({ name, path }) => {
    try {
      const cmdModule = await import(path)
      const description = cmdModule.describe || name
      return { name: `${name} - ${description}`, value: name, short: name }
    } catch {
      return { name: name, value: name, short: name }
    }
  }))
  
  const selectedCommand = await select({
    message: bundle.getText('searchFoundCommands', [commandChoices.length]),
    choices: commandChoices,
    pageSize: 15
  })
  
  // Collect parameters for the command
  const params = await collectCommandParameters(selectedCommand, select, input, confirm, chalk, base, bundle)
  
  return { command: selectedCommand, params }
}

/**
 * Browse commands by category
 * @param {any} select
 * @param {any} chalk
 * @param {any} base
 * @param {any} bundle
 * @param {string} [initialCategory]
 */
async function browseByCategory(select, chalk, base, bundle, initialCategory = null) {
  // Group commands by category
  const categories = {}
  
  for (const [cmd, metadata] of Object.entries(commandMetadata)) {
    if (!metadata.category) continue
    if (!categories[metadata.category]) {
      categories[metadata.category] = []
    }
    // Avoid duplicates
    if (!categories[metadata.category].includes(cmd)) {
      categories[metadata.category].push(cmd)
    }
  }
  
  let selectedCategory = initialCategory
  
  if (!selectedCategory || !categories[selectedCategory]) {
    const categoryChoices = Object.keys(categories)
      .sort()
      .map(cat => ({
        name: `${formatCategoryName(cat)} (${bundle.getText('categoryCommands', [categories[cat].length])})`,
        value: cat
      }))
    
    selectedCategory = await select({
      message: bundle.getText('categorySelectPrompt'),
      choices: categoryChoices,
      pageSize: 15
    })
  }
  
  const commandsInCategory = categories[selectedCategory] || []
  
  if (commandsInCategory.length === 0) {
    console.log(chalk.yellow(bundle.getText('categoryNoCommands')))
    return { command: null, params: null }
  }
  
  // Get command descriptions
  const commandChoices = await Promise.all(commandsInCategory.map(async (cmd) => {
    try {
      const cmdPath = commandMap[cmd]
      if (!cmdPath) return null
      const cmdModule = await import(cmdPath)
      const description = cmdModule.describe || cmd
      return { name: `${cmd} - ${description}`, value: cmd, short: cmd }
    } catch {
      return { name: cmd, value: cmd, short: cmd }
    }
  }))
  
  const validChoices = commandChoices.filter(c => c !== null)
  
  const selectedCommand = await select({
    message: bundle.getText('categorySelectCommand', [formatCategoryName(selectedCategory)]),
    choices: validChoices,
    pageSize: 15
  })
  
  // Collect parameters
  const { select: selectFn, input: inputFn, confirm: confirmFn } = await import('@inquirer/prompts')
  const params = await collectCommandParameters(selectedCommand, selectFn, inputFn, confirmFn, chalk, base, bundle)
  
  return { command: selectedCommand, params }
}

/**
 * Select from recent commands
 * @param {any} select
 * @param {any} confirm
 * @param {any} chalk
 * @param {any} state
 * @param {any} bundle
 */
async function selectFromRecent(select, confirm, chalk, state, bundle) {
  const recentChoices = state.history
    .slice(-10)
    .reverse()
    .map((entry, idx) => ({
      name: `${entry.command} ${formatParamsPreview(entry.params)}`,
      value: idx
    }))
  
  const selectedIndex = await select({
    message: bundle.getText('recentSelectPrompt'),
    choices: recentChoices
  })
  
  const historyEntry = state.history[state.history.length - 1 - selectedIndex]
  
  const useExisting = await confirm({
    message: bundle.getText('recentUseSameParams'),
    default: true
  })
  
  if (useExisting) {
    return { command: historyEntry.command, params: historyEntry.params }
  }
  
  // Re-collect parameters
  const { select: selectFn, input: inputFn, confirm: confirmFn } = await import('@inquirer/prompts')
  const params = await collectCommandParameters(historyEntry.command, selectFn, inputFn, confirmFn, chalk, await import('../utils/base.js'), bundle)
  return { command: historyEntry.command, params }
}

/**
 * Load a saved preset
 * @param {any} select
 * @param {any} chalk
 * @param {any} state
 * @param {any} bundle
 */
async function loadPreset(select, chalk, state, bundle) {
  const presetChoices = Object.entries(state.presets).map(([name, preset]) => ({
    name: `${name}: ${preset.command} ${formatParamsPreview(preset.params)}`,
    value: name
  }))
  
  presetChoices.push({ name: chalk.red(bundle.getText('presetDelete')), value: '__delete__' })
  
  const selectedPreset = await select({
    message: bundle.getText('presetSelectPrompt'),
    choices: presetChoices
  })
  
  if (selectedPreset === '__delete__') {
    const presetToDelete = await select({
      message: bundle.getText('presetSelectToDelete'),
      choices: Object.keys(state.presets).map(name => ({ name, value: name }))
    })
    
    delete state.presets[presetToDelete]
    saveInteractiveState(state)
    console.log(chalk.green(bundle.getText('presetDeleted', [presetToDelete])))
    return { command: null, params: null }
  }
  
  const preset = state.presets[selectedPreset]
  
  const { confirm } = await import('@inquirer/prompts')
  const usePreset = await confirm({
    message: bundle.getText('presetUseConfig'),
    default: true
  })
  
  if (usePreset) {
    return { command: preset.command, params: preset.params }
  }
  
  return { command: null, params: null }
}

/**
 * Guided workflow for common tasks
 * @param {any} select
 * @param {any} input
 * @param {any} confirm
 * @param {any} chalk
 * @param {any} base
 * @param {any} bundle
 */
async function guidedWorkflow(select, input, confirm, chalk, base, bundle) {
  const workflows = [
    { name: bundle.getText('workflowImport'), value: 'import' },
    { name: bundle.getText('workflowExport'), value: 'export' },
    { name: bundle.getText('workflowAnalysis'), value: 'analysis' },
    { name: bundle.getText('workflowSchema'), value: 'schema' },
    { name: bundle.getText('workflowDiagnostics'), value: 'diagnostics' }
  ]
  
  const workflow = await select({
    message: bundle.getText('workflowSelectPrompt'),
    choices: workflows
  })
  
  switch (workflow) {
    case 'import':
      return await importWorkflow(select, input, confirm, chalk, base, bundle)
    case 'export':
      return await exportWorkflow(select, input, confirm, chalk, base, bundle)
    case 'analysis':
      return await analysisWorkflow(select, input, confirm, chalk, base, bundle)
    case 'schema':
      return await schemaWorkflow(select, input, confirm, chalk, base, bundle)
    case 'diagnostics':
      return await diagnosticsWorkflow(select, input, confirm, chalk, base, bundle)
    default:
      return { command: null, params: null }
  }
}

/**
 * Import data workflow
 * @param {any} select
 * @param {any} input
 * @param {any} confirm
 * @param {any} chalk
 * @param {any} base
 * @param {any} bundle
 */
async function importWorkflow(select, input, confirm, chalk, base, bundle) {
  console.log(chalk.cyan('\n' + bundle.getText('importWorkflowTitle')))
  console.log(chalk.gray(bundle.getText('importWorkflowDesc') + '\n'))
  
  const filename = await input({
    message: bundle.getText('importFilePrompt'),
    validate: (value) => value.trim().length > 0 || bundle.getText('importFileValidation')
  })
  
  const output = await select({
    message: bundle.getText('importFormatPrompt'),
    choices: [{name: 'csv', value: 'csv'}, {name: 'excel', value: 'excel'}],
    default: 'csv'
  })
  
  const table = await input({
    message: bundle.getText('importTablePrompt'),
    validate: (value) => value.trim().length > 0 || bundle.getText('importTableValidation')
  })
  
  const schema = await input({
    message: bundle.getText('importSchemaPrompt'),
    default: '**CURRENT_SCHEMA**'
  })
  
  const matchMode = await select({
    message: bundle.getText('importMatchModePrompt'),
    choices: [{name: 'auto', value: 'auto'}, {name: 'name', value: 'name'}, {name: 'order', value: 'order'}],
    default: 'auto'
  })
  
  const truncate = await confirm({
    message: bundle.getText('importTruncatePrompt'),
    default: false
  })
  
  const dryRun = await confirm({
    message: bundle.getText('importDryRunPrompt'),
    default: false
  })
  
  return { command: 'import', params: { filename, output, table, schema, matchMode, truncate, dryRun } }
}

/**
 * Export data workflow
 * @param {any} select
 * @param {any} input
 * @param {any} confirm
 * @param {any} chalk
 * @param {any} base
 * @param {any} bundle
 */
async function exportWorkflow(select, input, confirm, chalk, base, bundle) {
  console.log(chalk.cyan('\n' + bundle.getText('exportWorkflowTitle')))
  console.log(chalk.gray(bundle.getText('exportWorkflowDesc') + '\n'))
  
  const query = await input({
    message: bundle.getText('exportQueryPrompt'),
    validate: (value) => value.trim().length > 0 || bundle.getText('exportQueryValidation')
  })
  
  const output = await select({
    message: bundle.getText('exportFormatPrompt'),
    choices: [{name: 'csv', value: 'csv'}, {name: 'excel', value: 'excel'}, {name: 'json', value: 'json'}],
    default: 'csv'
  })
  
  const filename = await input({
    message: bundle.getText('exportFilePrompt'),
    validate: (value) => value.trim().length > 0 || bundle.getText('importFileValidation')
  })
  
  let includeHeader = true
  if (output === 'csv') {
    includeHeader = await confirm({
      message: bundle.getText('exportHeaderPrompt'),
      default: true
    })
  }
  
  return { command: 'export', params: { query, output, filename, includeHeader } }
}

/**
 * Data analysis workflow
 * @param {any} select
 * @param {any} input
 * @param {any} confirm
 * @param {any} chalk
 * @param {any} base
 * @param {any} bundle
 */
async function analysisWorkflow(select, input, confirm, chalk, base, bundle) {
  console.log(chalk.cyan('\n' + bundle.getText('analysisWorkflowTitle')))
  console.log(chalk.gray(bundle.getText('analysisWorkflowDesc') + '\n'))
  
  const tool = await select({
    message: bundle.getText('analysisToolPrompt'),
    choices: [
      { name: bundle.getText('analysisDataProfile'), value: 'dataProfile' },
      { name: bundle.getText('analysisDuplicates'), value: 'duplicateDetection' },
      { name: bundle.getText('analysisValidator'), value: 'dataValidator' },
      { name: bundle.getText('analysisLineage'), value: 'dataLineage' }
    ]
  })
  
  const params = await collectCommandParameters(tool, select, input, confirm, chalk, base, bundle)
  return { command: tool, params }
}

/**
 * Schema workflow
 * @param {any} select
 * @param {any} input
 * @param {any} confirm
 * @param {any} chalk
 * @param {any} base
 * @param {any} bundle
 */
async function schemaWorkflow(select, input, confirm, chalk, base, bundle) {
  console.log(chalk.cyan('\n' + bundle.getText('schemaWorkflowTitle')))
  console.log(chalk.gray(bundle.getText('schemaWorkflowDesc') + '\n'))
  
  const action = await select({
    message: bundle.getText('schemaActionPrompt'),
    choices: [
      { name: bundle.getText('schemaCompare'), value: 'compareSchema' },
      { name: bundle.getText('schemaClone'), value: 'schemaClone' },
      { name: bundle.getText('schemaErd'), value: 'erdDiagram' }
    ]
  })
  
  const params = await collectCommandParameters(action, select, input, confirm, chalk, base, bundle)
  return { command: action, params }
}

/**
 * Diagnostics workflow
 * @param {any} select
 * @param {any} input
 * @param {any} confirm
 * @param {any} chalk
 * @param {any} base
 * @param {any} bundle
 */
async function diagnosticsWorkflow(select, input, confirm, chalk, base, bundle) {
  console.log(chalk.cyan('\n' + bundle.getText('diagnosticsWorkflowTitle')))
  console.log(chalk.gray(bundle.getText('diagnosticsWorkflowDesc') + '\n'))
  
  const tool = await select({
    message: bundle.getText('diagnosticsToolPrompt'),
    choices: [
      { name: bundle.getText('diagnosticsHealth'), value: 'healthCheck' },
      { name: bundle.getText('diagnosticsBlocking'), value: 'blocking' },
      { name: bundle.getText('diagnosticsLongRunning'), value: 'longRunning' },
      { name: bundle.getText('diagnosticsMemory'), value: 'memoryAnalysis' },
      { name: bundle.getText('diagnosticsExpensive'), value: 'expensiveStatements' }
    ]
  })
  
  const params = await collectCommandParameters(tool, select, input, confirm, chalk, base, bundle)
  return { command: tool, params }
}

/**
 * Collect parameters for a command by introspecting its builder
 * @param {string} commandName
 * @param {any} select
 * @param {any} input
 * @param {any} confirm
 * @param {any} chalk
 * @param {any} base
 * @param {any} bundle
 */
async function collectCommandParameters(commandName, select, input, confirm, chalk, base, bundle) {
  const cmdPath = commandMap[commandName]
  if (!cmdPath) {
    console.log(chalk.red(bundle.getText('commandNotFound', [commandName])))
    return null
  }
  
  try {
    const cmdModule = await import(cmdPath)
    
    if (!cmdModule.builder) {
      console.log(chalk.yellow(bundle.getText('noConfigurableParams')))
      return {}
    }
    
    // Create a mock yargs object to capture options
    const capturedOptions = {}
    const mockYargs = {
      options: (opts) => {
        Object.assign(capturedOptions, opts)
        return mockYargs
      },
      option: (name, opts) => {
        capturedOptions[name] = opts
        return mockYargs
      },
      positional: (name, opts) => {
        capturedOptions[name] = { ...opts, positional: true }
        return mockYargs
      },
      example: () => mockYargs,
      epilog: () => mockYargs,
      wrap: () => mockYargs,
      demandOption: () => mockYargs,
      implies: () => mockYargs,
      conflicts: () => mockYargs
    }
    
    cmdModule.builder(mockYargs)
    
    // Convert options to inquirer prompts
    const prompts = []
    const params = {}
    
    for (const [key, opts] of Object.entries(capturedOptions)) {
      // Skip internal options
      if (['admin', 'conn', 'debug', 'disableVerbose'].includes(key)) {
        continue
      }
      
      const prompt = {
        name: key,
        message: opts.desc || opts.describe || key
      }
      
      if (opts.type === 'boolean') {
        prompt.type = 'confirm'
        prompt.default = opts.default !== undefined ? opts.default : false
      } else if (opts.choices && Array.isArray(opts.choices)) {
        prompt.type = 'list'
        prompt.choices = opts.choices
        prompt.default = opts.default
      } else {
        prompt.type = 'input'
        if (opts.default !== undefined && opts.default !== '**CURRENT_SCHEMA**') {
          prompt.default = String(opts.default)
        }
      }
      
      // Add validation for required fields
      if (opts.demandOption || opts.required) {
        prompt.validate = (input) => {
          if (!input || (typeof input === 'string' && input.trim().length === 0)) {
            return 'This field is required'
          }
          return true
        }
      }
      
      prompts.push(prompt)
    }
    
    if (prompts.length === 0) {
      console.log(chalk.gray(bundle.getText('noParameters')))
      return {}
    }
    
    console.log(chalk.cyan('\n' + bundle.getText('configureCommand', [commandName]) + '\n'))
    
    // Execute prompts sequentially
    const answers = {}
    for (const prompt of prompts) {
      if (prompt.type === 'confirm') {
        answers[prompt.name] = await confirm({
          message: prompt.message,
          default: prompt.default
        })
      } else if (prompt.type === 'list') {
        answers[prompt.name] = await select({
          message: prompt.message,
          choices: prompt.choices.map(c => typeof c === 'string' ? { name: c, value: c } : c),
          default: prompt.default
        })
      } else {
        answers[prompt.name] = await input({
          message: prompt.message,
          default: prompt.default,
          validate: prompt.validate
        })
      }
    }
    
    return answers
    
  } catch (error) {
    console.log(chalk.red(bundle.getText('executionFailed', [error.message])))
    return null
  }
}

/**
 * Execute a command with parameters
 * @param {string} commandName
 * @param {any} params
 * @param {any} chalk
 * @param {any} base
 * @param {any} bundle
 */
async function executeCommand(commandName, params, chalk, base, bundle) {
  const cmdPath = commandMap[commandName]
  if (!cmdPath) {
    console.log(chalk.red(bundle.getText('commandNotFound', [commandName])))
    return false
  }
  
  try {
    console.log(chalk.cyan('\n' + bundle.getText('executeCommand', [commandName])))
    console.log(chalk.gray('─'.repeat(80)))
    
    const cmdModule = await import(cmdPath)
    
    if (!cmdModule.handler) {
      console.log(chalk.red(bundle.getText('commandNoHandler')))
      return false
    }
    
    // Execute the command
    await cmdModule.handler(params)
    
    console.log(chalk.gray('─'.repeat(80)))
    console.log(chalk.green(bundle.getText('executionSuccess')))
    
    return true
    
  } catch (error) {
    console.log(chalk.gray('─'.repeat(80)))
    console.log(chalk.red(bundle.getText('executionFailed', [error.message])))
    base.debug(error.stack)
    return false
  }
}

/**
 * Format category name for display
 * @param {string} category
 */
function formatCategoryName(category) {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format parameters for preview
 * @param {any} params
 */
function formatParamsPreview(params) {
  const keys = Object.keys(params).slice(0, 3)
  if (keys.length === 0) return ''
  const preview = keys.map(k => `${k}=${params[k]}`).join(' ')
  return `(${preview}${Object.keys(params).length > 3 ? '...' : ''})`
}

/**
 * Add command to history
 * @param {any} state
 * @param {string} command
 * @param {any} params
 */
function addToHistory(state, command, params) {
  state.history.push({
    command,
    params,
    timestamp: new Date().toISOString()
  })
  
  // Keep only last 50 entries
  if (state.history.length > 50) {
    state.history = state.history.slice(-50)
  }
  
  saveInteractiveState(state)
}

/**
 * Load interactive state from disk
 */
function loadInteractiveState() {
  const statePath = join(__dirname, '..', '.interactive-state.json')
  
  if (existsSync(statePath)) {
    try {
      const content = readFileSync(statePath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      // If parsing fails, return default state
    }
  }
  
  return {
    history: [],
    presets: {},
    lastUsed: null
  }
}

/**
 * Save interactive state to disk
 * @param {any} state
 */
function saveInteractiveState(state) {
  const statePath = join(__dirname, '..', '.interactive-state.json')
  
  try {
    state.lastUsed = new Date().toISOString()
    writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8')
  } catch (error) {
    // Silently fail if we can't save state
  }
}
