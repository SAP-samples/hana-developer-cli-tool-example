// @ts-check
import { buildDocEpilogue } from '../utils/doc-linker.js'
import * as baseLite from '../utils/base-lite.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { marked } from 'marked'
import { markedTerminal } from 'marked-terminal'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const command = 'viewDocs [topic]'
export const aliases = ['docs', 'doc', 'documentation']
export const describe = baseLite.bundle.getText("viewDocs")

// Topic mapping - maps simple topic names to actual file paths
const topicMap = {
  // Getting Started
  'installation': '01-getting-started/installation.md',
  'install': '01-getting-started/installation.md',
  'quick-start': '01-getting-started/quick-start.md',
  'quickstart': '01-getting-started/quick-start.md',
  'getting-started': '01-getting-started/quick-start.md',
  
  // Commands - Data Tools
  'import': '02-commands/data-tools/import.md',
  'export': '02-commands/data-tools/export.md',
  'dataProfile': '02-commands/data-tools/data-profile.md',
  'data-profile': '02-commands/data-tools/data-profile.md',
  'dataValidator': '02-commands/data-tools/data-validator.md',
  'data-validator': '02-commands/data-tools/data-validator.md',
  'duplicateDetection': '02-commands/data-tools/duplicate-detection.md',
  'duplicate-detection': '02-commands/data-tools/duplicate-detection.md',
  'compareData': '02-commands/data-tools/compare-data.md',
  'compare-data': '02-commands/data-tools/compare-data.md',
  
  // Commands - Schema Tools
  'compareSchema': '02-commands/schema-tools/compare-schema.md',
  'compare-schema': '02-commands/schema-tools/compare-schema.md',
  'schemaClone': '02-commands/schema-tools/schema-clone.md',
  'schema-clone': '02-commands/schema-tools/schema-clone.md',
  'tables': '02-commands/schema-tools/tables.md',
  'views': '02-commands/schema-tools/views.md',
  'schemas': '02-commands/schema-tools/schemas.md',
  
  // Commands - Object Inspection
  'inspectTable': '02-commands/object-inspection/inspect-table.md',
  'inspect-table': '02-commands/object-inspection/inspect-table.md',
  'inspectView': '02-commands/object-inspection/inspect-view.md',
  'inspect-view': '02-commands/object-inspection/inspect-view.md',
  'inspectProcedure': '02-commands/object-inspection/inspect-procedure.md',
  'inspect-procedure': '02-commands/object-inspection/inspect-procedure.md',
  'inspectFunction': '02-commands/object-inspection/inspect-function.md',
  'inspect-function': '02-commands/object-inspection/inspect-function.md',
  
  // Commands - Performance
  'expensiveStatements': '02-commands/performance-monitoring/expensive-statements.md',
  'expensive-statements': '02-commands/performance-monitoring/expensive-statements.md',
  'blocking': '02-commands/performance-monitoring/blocking.md',
  'longRunning': '02-commands/performance-monitoring/long-running.md',
  'long-running': '02-commands/performance-monitoring/long-running.md',
  'memoryAnalysis': '02-commands/performance-monitoring/memory-analysis.md',
  'memory-analysis': '02-commands/performance-monitoring/memory-analysis.md',
  'healthCheck': '02-commands/performance-monitoring/health-check.md',
  'health-check': '02-commands/performance-monitoring/health-check.md',
  
  // Features
  'interactive': '03-features/interactive-mode.md',
  'interactive-mode': '03-features/interactive-mode.md',
  'web-ui': '03-features/web-ui/index.md',
  'webui': '03-features/web-ui/index.md',
  'api': '03-features/web-ui/api-server.md',
  'api-server': '03-features/web-ui/api-server.md',
  'mcp': '03-features/mcp-integration.md',
  'mcp-integration': '03-features/mcp-integration.md',
  'knowledge-base': '03-features/knowledge-base.md',
  'kb': '03-features/knowledge-base.md',
  
  // Troubleshooting
  'troubleshooting': 'troubleshooting/index.md',
  'trouble': 'troubleshooting/index.md',
  'help': 'troubleshooting/index.md',
  'mcp-troubleshooting': 'troubleshooting/mcp.md',
  
  // Other
  'index': 'index.md',
  'home': 'index.md'
}

export const builder = (yargs) => yargs
  .positional('topic', {
    type: 'string',
    describe: 'Documentation topic to view'
  })
  .option('list', {
    alias: 'l',
    type: 'boolean',
    default: false,
    describe: 'List all available topics'
  })
  .option('search', {
    alias: 's',
    type: 'string',
    describe: 'Search for topics by keyword'
  })
  .option('raw', {
    alias: 'r',
    type: 'boolean',
    default: false,
    describe: 'Show raw markdown without formatting'
  })
  .example('hana-cli viewDocs', 'Show documentation index')
  .example('hana-cli viewDocs --list', 'List all available topics')
  .example('hana-cli viewDocs import', 'View import command documentation')
  .example('hana-cli viewDocs troubleshooting', 'View troubleshooting guide')
  .example('hana-cli viewDocs --search "import csv"', 'Search documentation')
  .epilog(buildDocEpilogue('viewDocs', 'developer-tools', ['kb', 'helpDocu', 'examples']))

export async function handler(argv) {
  const base = await import('../utils/base.js')
  await viewDocumentation(argv)
}

export async function viewDocumentation(argv) {
  const base = await import('../utils/base.js')
  base.debug('viewDocumentation')

  try {
    const docsRoot = join(__dirname, '../docs')

    // Handle list option
    if (argv.list) {
      showTopicList()
      process.exit(0)
    }

    // Handle search option
    if (argv.search) {
      await searchDocumentation(argv.search, docsRoot)
      process.exit(0)
    }

    // Determine which doc to show
    let docPath
    if (argv.topic) {
      const topicLower = argv.topic.toLowerCase()
      if (topicMap[topicLower]) {
        docPath = join(docsRoot, topicMap[topicLower])
      } else {
        // Try to find the file directly
        const possiblePaths = [
          join(docsRoot, `${argv.topic}.md`),
          join(docsRoot, `02-commands/${argv.topic}.md`),
          join(docsRoot, `03-features/${argv.topic}.md`)
        ]
        
        for (const path of possiblePaths) {
          if (existsSync(path)) {
            docPath = path
            break
          }
        }
        
        if (!docPath) {
          console.log(baseLite.colors.yellow(`Topic "${argv.topic}" not found.`))
          console.log(baseLite.colors.cyan('\nTry one of these options:'))
          console.log('  • Run ' + baseLite.colors.bold('hana-cli viewDocs --list') + ' to see all topics')
          console.log('  • Run ' + baseLite.colors.bold('hana-cli kb "' + argv.topic + '"') + ' to search the knowledge base')
          console.log('  • Run ' + baseLite.colors.bold('hana-cli helpDocu') + ' to open online documentation')
          process.exit(1)
        }
      }
    } else {
      // Default to index
      docPath = join(docsRoot, 'index.md')
    }

    // Read and display the documentation
    if (!existsSync(docPath)) {
      console.error(baseLite.colors.red(`Documentation file not found: ${docPath}`))
      process.exit(1)
    }

    const content = readFileSync(docPath, 'utf-8')
    
    // Display header
    console.log(baseLite.colors.cyan('\n' + '═'.repeat(80)))
    console.log(baseLite.colors.cyan.bold(`  📖 ${argv.topic || 'HANA CLI Documentation'}`))
    console.log(baseLite.colors.cyan('═'.repeat(80) + '\n'))

    // Display content
    if (argv.raw) {
      console.log(content)
    } else {
      displayFormattedMarkdown(content)
    }

    console.log(baseLite.colors.cyan('\n' + '═'.repeat(80)))
    console.log(baseLite.colors.dim('💡 Tip: Use --list to see all topics, --search to search, or --raw for plain markdown'))
    console.log(baseLite.colors.cyan('═'.repeat(80) + '\n'))

  } catch (error) {
    console.error(baseLite.colors.red(`Error viewing documentation: ${error.message}`))
    process.exit(1)
  }

  process.exit(0)
}

function showTopicList() {
  console.log(baseLite.colors.cyan.bold('\n📚 Available Documentation Topics\n'))
  
  const categories = {
    'Getting Started': ['installation', 'quick-start'],
    'Data Tools': ['import', 'export', 'dataProfile', 'dataValidator', 'duplicateDetection', 'compareData'],
    'Schema Tools': ['compareSchema', 'schemaClone', 'tables', 'views', 'schemas'],
    'Object Inspection': ['inspectTable', 'inspectView', 'inspectProcedure', 'inspectFunction'],
    'Performance Monitoring': ['expensiveStatements', 'blocking', 'longRunning', 'memoryAnalysis', 'healthCheck'],
    'Features': ['interactive', 'web-ui', 'api-server', 'mcp-integration', 'knowledge-base'],
    'Other': ['troubleshooting', 'index']
  }

  for (const [category, topics] of Object.entries(categories)) {
    console.log(baseLite.colors.green.bold(`  ${category}:`))
    topics.forEach(topic => {
      console.log(`    • ${baseLite.colors.white(topic.padEnd(25))} ${baseLite.colors.gray('hana-cli viewDocs ' + topic)}`)
    })
    console.log()
  }

  console.log(baseLite.colors.blue('💡 Examples:'))
  console.log('  hana-cli viewDocs import')
  console.log('  hana-cli viewDocs troubleshooting')
  console.log('  hana-cli viewDocs --search "csv import"')
  console.log()
}

async function searchDocumentation(query, docsRoot) {
  console.log(baseLite.colors.cyan(`\n🔍 Searching documentation for: "${query}"\n`))
  
  const queryLower = query.toLowerCase()
  const results = []

  // Search through topic map
  for (const [topic, filePath] of Object.entries(topicMap)) {
    if (topic.includes(queryLower)) {
      const fullPath = join(docsRoot, filePath)
      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, 'utf-8')
        const lines = content.split('\n')
        const title = lines.find(line => line.startsWith('#'))?.replace(/^#+\s*/, '') || topic
        
        results.push({
          topic,
          title,
          path: filePath,
          score: topic === queryLower ? 10 : 5
        })
      }
    }
  }

  // Search file contents for unique files only
  const searchedFiles = new Set(results.map(r => r.path))
  const allFiles = findMarkdownFiles(docsRoot)
  
  for (const file of allFiles) {
    const relativePath = file.replace(docsRoot, '').replace(/\\/g, '/').substring(1)
    
    if (searchedFiles.has(relativePath)) continue
    
    try {
      const content = readFileSync(file, 'utf-8')
      if (content.toLowerCase().includes(queryLower)) {
        const lines = content.split('\n')
        const title = lines.find(line => line.startsWith('#'))?.replace(/^#+\s*/, '') || relativePath
        
        // Find a relevant excerpt
        const matchingLines = lines.filter(line => line.toLowerCase().includes(queryLower))
        const excerpt = matchingLines[0]?.substring(0, 100) || ''
        
        results.push({
          topic: relativePath.replace('.md', '').replace(/\//g, ' > '),
          title,
          path: relativePath,
          excerpt,
          score: 1
        })
        
        searchedFiles.add(relativePath)
      }
    } catch (err) {
      // Skip files that can't be read
    }
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score)

  if (results.length === 0) {
    console.log(baseLite.colors.yellow('No results found.'))
    console.log(baseLite.colors.dim('\n💡 Try using the kb command: hana-cli kb "' + query + '"'))
  } else {
    console.log(baseLite.colors.green(`Found ${results.length} result(s):\n`))
    
    results.slice(0, 10).forEach((result, idx) => {
      console.log(baseLite.colors.bold(`${idx + 1}. ${result.title}`))
      console.log(baseLite.colors.gray(`   Topic: ${result.topic}`))
      if (result.excerpt) {
        console.log(baseLite.colors.dim(`   "${result.excerpt}..."`))
      }
      console.log()
    })
    
    console.log(baseLite.colors.dim('💡 To view a topic: hana-cli viewDocs <topic>'))
  }
  
  console.log()
}

function findMarkdownFiles(dir, fileList = []) {
  const files = readdirSync(dir)
  
  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (file === 'node_modules' || file.startsWith('.')) continue
      findMarkdownFiles(filePath, fileList)
    } else if (file.endsWith('.md')) {
      fileList.push(filePath)
    }
  }
  
  return fileList
}

function displayFormattedMarkdown(content) {
  // Configure marked-terminal for better terminal output
  marked.use(markedTerminal({
    showSectionPrefix: false,
    reflowText: true,
    width: 80,
    emoji: true,
    tableOptions: {
      style: {
        head: ['cyan'],
        border: ['grey']
      }
    },
    codespan: baseLite.colors.yellow,
    code: (code) => {
      // Use basic code highlighting
      const { default: highlight } = require('cli-highlight')
      try {
        return highlight(code, { ignoreIllegals: true, theme: 'ansi' })
      } catch (e) {
        return code
      }
    }
  }))

  try {
    console.log(marked(content))
  } catch (error) {
    // Fallback to raw display if rendering fails
    console.log(content)
  }
}
