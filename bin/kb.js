// @ts-check
import { buildDocEpilogue } from '../utils/doc-linker.js'
import * as baseLite from '../utils/base-lite.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const command = 'kb [query...]'
export const aliases = []
export const describe = baseLite.bundle.getText("kbSearch")

export const builder = (yargs) => yargs
  .positional('query', {
    array: true,
    type: 'string',
    describe: 'Search query terms'
  })
  .example('hana-cli kb "import csv"', 'Search for import CSV topics').epilog(buildDocEpilogue('kb', 'developer-tools', ['helpDocu', 'readMe']))
  .example('hana-cli kb data validation', 'Search individual terms')

export async function handler(argv) {
  const base = await import('../utils/base.js')
  await kbSearch(argv)
}

export async function kbSearch(argv) {
  const base = await import('../utils/base.js')
  base.debug('kbSearch')

  // Get query from positional arguments
  let query = ''
  if (argv.query && Array.isArray(argv.query) && argv.query.length > 0) {
    query = argv.query.join(' ')
  } else if (argv.query && typeof argv.query === 'string') {
    query = argv.query
  }
  
  if (!query || query.trim() === '') {
    console.log(baseLite.colors.yellow('Please provide a search query. Example: hana-cli kb "import csv"'))
    process.exit(0)
  }

  try {
    base.startSpinnerInt()
    
    // Load the docs index
    const docsIndexPath = join(__dirname, '../mcp-server/docs-index.json')
    const docsIndexContent = readFileSync(docsIndexPath, 'utf-8')
    const docsIndex = JSON.parse(docsIndexContent)

    base.stopSpinnerInt()

    // Search in the index
    const results = performSearch(docsIndex, query, argv)

    if (results.length === 0) {
      console.log(baseLite.colors.yellow(`No results found for "${query}". Try different keywords.`))
      process.exit(0)
    }

    // Display results
    displayResults(results, query)
  } catch (error) {
    base.stopSpinnerInt()
    console.error(baseLite.colors.red(`Error searching knowledge base: ${error.message}`))
  }
  
  // Explicitly exit the process
  process.exit(0)
}

function performSearch(docsIndex, query, argv) {
  const queryLower = query.toLowerCase()
  const maxResults = argv.limit || 5
  const category = argv.category ? argv.category.toLowerCase() : null
  const isExact = argv.exact || false

  const matchedDocs = new Map()
  const byKeyword = docsIndex.index?.byKeyword || {}
  const documents = docsIndex.documents || []

  // Create a map of document paths to full document info
  const docMap = new Map()
  documents.forEach(doc => {
    docMap.set(doc.path, doc)
  })

  if (isExact) {
    // Exact phrase search - look for keywords that contain the exact phrase
    Object.entries(byKeyword).forEach(([keyword, paths]) => {
      if (keyword.toLowerCase().includes(queryLower)) {
        paths.forEach(path => {
          const doc = docMap.get(path)
          if (doc) {
            const score = keyword.toLowerCase() === queryLower ? 100 : 50
            addResult(matchedDocs, path, doc, score)
          }
        })
      }
    })
  } else {
    // Keyword search - split query into tokens and search for any match
    const queryTokens = queryLower.split(/\s+/).filter(t => t.length > 0)
    
    Object.entries(byKeyword).forEach(([keyword, paths]) => {
      const keywordLower = keyword.toLowerCase()
      let score = 0
      
      // Check if any token matches
      for (const token of queryTokens) {
        if (keywordLower.includes(token)) {
          score += token.length // Longer matches score higher
        }
      }
      
      if (score > 0) {
        paths.forEach(path => {
          const doc = docMap.get(path)
          if (doc) {
            addResult(matchedDocs, path, doc, score)
          }
        })
      }
    })
  }

  // Convert map to array and sort by score
  let results = Array.from(matchedDocs.values())
    .sort((a, b) => b.score - a.score)

  // Filter by category if specified
  if (category) {
    results = results.filter(r => 
      r.category?.toLowerCase() === category
    )
  }

  // Limit results
  return results.slice(0, maxResults)
}

function addResult(matchedDocs, path, doc, score) {
  if (matchedDocs.has(path)) {
    matchedDocs.get(path).score += score
  } else {
    matchedDocs.set(path, {
      path: doc.path,
      title: doc.title,
      category: doc.category,
      excerpt: doc.excerpt,
      score: score
    })
  }
}

function displayResults(results, query) {
  const colors = baseLite.colors
  
  console.log('')
  console.log(colors.cyan(`Found ${results.length} result(s) for "${query}":`))
  console.log('')

  results.forEach((result, index) => {
    console.log(colors.bold(`${index + 1}. ${result.title}`))
    console.log(colors.gray(`   📁 ${result.path}`))
    console.log(colors.gray(`   📂 ${result.category}`))
    
    if (result.excerpt) {
      const truncatedExcerpt = result.excerpt.length > 200 
        ? result.excerpt.substring(0, 200) + '...'
        : result.excerpt
      console.log(colors.white(`   ${truncatedExcerpt}`))
    }
    
    console.log('')
  })

  console.log(colors.dim('💡 Open the file in your editor to read the full documentation.'))
}
