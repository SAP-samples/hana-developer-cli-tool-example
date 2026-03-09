#!/usr/bin/env node
/**
 * Generate proper sidebar configuration for 02-commands
 * Accounts for base path in VitePress config
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = path.join(__dirname, 'docs', '02-commands')
const BASE_PATH = '/hana-developer-cli-tool-example'

function toTitleCase(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

function getFileLabel(filename) {
  return filename.replace('.md', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function generateSidebarConfig() {
  const config = []

  // Add reference links at top
  config.push(`        {
          text: 'Commands Reference',
          items: [
            { text: '📋 All Commands A-Z', link: '${BASE_PATH}/02-commands/all-commands' },
            { text: 'Commands Overview', link: '${BASE_PATH}/02-commands/' },
          ]
        },`)

  // Get all categories and sort them
  const categories = fs.readdirSync(DOCS_DIR)
    .filter(name => {
      const fullPath = path.join(DOCS_DIR, name)
      return fs.statSync(fullPath).isDirectory()
    })
    .sort()

  // Generate config for each category
  for (const category of categories) {
    const categoryPath = path.join(DOCS_DIR, category)
    const docFiles = fs.readdirSync(categoryPath)
      .filter(f => f.endsWith('.md'))
      .sort()

    if (docFiles.length === 0) continue

    const categoryTitle = toTitleCase(category)
    const items = docFiles
      .map(file => {
        const link = `${BASE_PATH}/02-commands/${category}/${file.replace('.md', '')}`
        const label = getFileLabel(file)
        return `            { text: '${label}', link: '${link}' }`
      })
      .join(',\n')

    config.push(`        {
          text: '${categoryTitle}',
          items: [
${items}
          ]
        },`)
  }

  return config.join('\n')
}

try {
  const config = generateSidebarConfig()
  const output = `'/02-commands/': [\n${config}\n      ],`
  
  console.log('Generated VitePress sidebar configuration with base path:')
  console.log('=========================================\n')
  console.log(output)
  
  // Write to temp file for easy copying
  fs.writeFileSync('vitepress-commands-config-fixed.txt', output)
  console.log('\n\n✅ Configuration written to vitepress-commands-config-fixed.txt')

} catch (error) {
  console.error('Error generating config:', error)
  process.exit(1)
}
