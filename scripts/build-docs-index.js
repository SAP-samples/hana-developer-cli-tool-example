#!/usr/bin/env node

/**
 * Documentation Index Builder
 * 
 * Scans all markdown files in the docs directory and builds a searchable index
 * with metadata including titles, categories, keywords, and content excerpts.
 * 
 * Output: mcp-server/docs-index.json
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const OUTPUT_FILE = path.join(__dirname, '..', 'mcp-server', 'docs-index.json');

/**
 * Extract title from markdown content
 */
function extractTitle(content, filePath) {
  // Try frontmatter title first
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const titleMatch = frontmatterMatch[1].match(/title:\s*["']?(.+?)["']?\s*$/m);
    if (titleMatch) {
      return titleMatch[1];
    }
  }
  
  // Try first # heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1];
  }
  
  // Use filename as fallback
  const filename = path.basename(filePath, '.md');
  return filename
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Extract category from file path
 */
function extractCategory(filePath) {
  const relativePath = path.relative(DOCS_DIR, filePath);
  const parts = relativePath.split(path.sep);
  
  if (parts[0].match(/^\d+-/)) {
    // Numbered directories like 01-getting-started
    return parts[0].replace(/^\d+-/, '').replace(/-/g, '-');
  }
  
  if (parts.length > 1) {
    return parts[0];
  }
  
  return 'general';
}

/**
 * Extract keywords from content
 */
function extractKeywords(content, title) {
  const keywords = new Set();
  
  // Add title words
  title.toLowerCase().split(/\s+/).forEach(word => {
    if (word.length > 3) keywords.add(word);
  });
  
  // Extract code blocks (likely commands or important terms)
  const codeMatches = content.matchAll(/`([^`]+)`/g);
  for (const match of codeMatches) {
    const code = match[1].trim();
    if (code.length > 2 && code.length < 50) {
      keywords.add(code.toLowerCase());
    }
  }
  
  // Extract headings
  const headingMatches = content.matchAll(/^#{1,6}\s+(.+)$/gm);
  for (const match of headingMatches) {
    match[1].split(/\s+/).forEach(word => {
      const clean = word.toLowerCase().replace(/[^\w-]/g, '');
      if (clean.length > 3) keywords.add(clean);
    });
  }
  
  // Extract bold text (often important terms)
  const boldMatches = content.matchAll(/\*\*([^*]+)\*\*/g);
  for (const match of boldMatches) {
    const term = match[1].trim().toLowerCase();
    if (term.length > 3 && term.length < 30) {
      keywords.add(term);
    }
  }
  
  return Array.from(keywords).slice(0, 30); // Limit to 30 keywords
}

/**
 * Create content excerpt for search results
 */
function createExcerpt(content, maxLength = 500) {
  // Remove frontmatter
  content = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  
  // Remove code blocks
  content = content.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code
  content = content.replace(/`[^`]+`/g, '');
  
  // Remove markdown links
  content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove headings markers
  content = content.replace(/^#{1,6}\s+/gm, '');
  
  // Remove empty lines and trim
  content = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(' ');
  
  // Truncate to maxLength
  if (content.length > maxLength) {
    content = content.substring(0, maxLength) + '...';
  }
  
  return content;
}

/**
 * Extract all headings for navigation
 */
function extractHeadings(content) {
  const headings = [];
  const headingMatches = content.matchAll(/^(#{1,6})\s+(.+)$/gm);
  
  for (const match of headingMatches) {
    const level = match[1].length;
    const text = match[2];
    const anchor = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    headings.push({
      level,
      text,
      anchor
    });
  }
  
  return headings;
}

/**
 * Find related documents based on cross-references
 */
function extractLinks(content) {
  const links = [];
  const linkMatches = content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  
  for (const match of linkMatches) {
    const url = match[2];
    // Only internal markdown links
    if (url.endsWith('.md') || (url.startsWith('/') && !url.startsWith('http'))) {
      links.push({
        text: match[1],
        url: url
      });
    }
  }
  
  return links;
}

/**
 * Recursively scan directory for markdown files
 */
async function scanDirectory(dir) {
  const files = [];
  const entries = await readdir(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      // Skip certain directories
      if (entry === 'node_modules' || entry === '.vitepress' || entry === 'dist') {
        continue;
      }
      const subFiles = await scanDirectory(fullPath);
      files.push(...subFiles);
    } else if (entry.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Process a single markdown file
 */
async function processMarkdownFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const relativePath = path.relative(DOCS_DIR, filePath).replace(/\\/g, '/');
  
  const title = extractTitle(content, filePath);
  const category = extractCategory(filePath);
  const keywords = extractKeywords(content, title);
  const excerpt = createExcerpt(content);
  const headings = extractHeadings(content);
  const links = extractLinks(content);
  
  // Determine document type
  let docType = 'general';
  if (relativePath.includes('getting-started')) docType = 'tutorial';
  else if (relativePath.includes('commands') || relativePath.includes('COMMAND.md')) docType = 'command';
  else if (relativePath.includes('api-reference')) docType = 'api';
  else if (relativePath.includes('features')) docType = 'feature';
  else if (relativePath.includes('troubleshooting')) docType = 'troubleshooting';
  else if (relativePath.includes('developer-notes')) docType = 'development';
  
  return {
    path: relativePath,
    title,
    category,
    docType,
    keywords,
    excerpt,
    headings,
    links: links.slice(0, 10), // Limit to 10 links
    size: content.length,
    lastModified: (await stat(filePath)).mtime.toISOString()
  };
}

/**
 * Build the complete documentation index
 */
async function buildIndex() {
  console.log('📚 Building documentation index...');
  console.log(`📂 Scanning: ${DOCS_DIR}`);
  
  const startTime = Date.now();
  
  // Find all markdown files
  const markdownFiles = await scanDirectory(DOCS_DIR);
  console.log(`📄 Found ${markdownFiles.length} markdown files`);
  
  // Process each file
  const documents = [];
  for (const filePath of markdownFiles) {
    try {
      const doc = await processMarkdownFile(filePath);
      documents.push(doc);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n⚠️  Error processing ${filePath}:`, error.message);
    }
  }
  console.log('\n');
  
  // Build category index
  const categories = {};
  documents.forEach(doc => {
    if (!categories[doc.category]) {
      categories[doc.category] = [];
    }
    categories[doc.category].push(doc.path);
  });
  
  // Build keyword index for faster searches
  const keywordIndex = {};
  documents.forEach(doc => {
    doc.keywords.forEach(keyword => {
      if (!keywordIndex[keyword]) {
        keywordIndex[keyword] = [];
      }
      keywordIndex[keyword].push(doc.path);
    });
  });
  
  // Build the final index
  const index = {
    version: '1.0.0',
    buildDate: new Date().toISOString(),
    totalDocuments: documents.length,
    categories: Object.keys(categories).sort(),
    index: {
      byCategory: categories,
      byKeyword: keywordIndex,
      byType: documents.reduce((acc, doc) => {
        if (!acc[doc.docType]) acc[doc.docType] = [];
        acc[doc.docType].push(doc.path);
        return acc;
      }, {})
    },
    documents
  };
  
  // Write to output file
  await writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf-8');
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Documentation index built successfully!`);
  console.log(`📊 Statistics:`);
  console.log(`   - Documents: ${documents.length}`);
  console.log(`   - Categories: ${Object.keys(categories).length}`);
  console.log(`   - Keywords: ${Object.keys(keywordIndex).length}`);
  console.log(`   - Build time: ${duration}s`);
  console.log(`📁 Output: ${OUTPUT_FILE}`);
}

// Run the builder
buildIndex().catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
