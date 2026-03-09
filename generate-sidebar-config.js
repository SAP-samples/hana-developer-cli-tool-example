#!/usr/bin/env node
/**
 * Generate VitePress sidebar configuration for all command categories
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = path.join(__dirname, 'docs', '02-commands')

function toTitleCase(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

function getFileLabel(filename) {
  // Remove .md and convert from kebab-case to Title Case
  return filename.replace('.md', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function generateSidebarConfig() {
  const config = []

  // Add reference links at top
  config.push(`        {
          text: 'Commands Reference',
          items: [
            { text: '📋 All Commands A-Z', link: '/02-commands/all-commands' },
            { text: 'Commands Overview', link: '/02-commands/' },
          ]
        },`)

  // Get all categories and sort them
  const categories = fs.readdirSync(DOCS_DIR)
    .filter(name => fs.statSync(path.join(DOCS_DIR, name)).isDirectory())
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
        const link = `/02-commands/${category}/${file.replace('.md', '')}`
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
  
  console.log('Generated VitePress sidebar configuration:')
  console.log('=========================================\n')
  console.log(output)
  
  // Write to temp file for easy copying
  fs.writeFileSync('vitepress-commands-config.txt', output)
  console.log('\n\n✅ Configuration written to vitepress-commands-config.txt')

} catch (error) {
  console.error('Error generating config:', error)
  process.exit(1)
}
