// @ts-check

import * as path from 'path'
import * as fs from 'fs'
import express from 'express'
import * as base from '../utils/base.js'
// @ts-ignore
const __dirname = import.meta.dirname

let commandDocsIndex = null

function buildCommandDocsIndex() {
    const docsDir = path.join(__dirname, '../docs/02-commands')
    const index = new Map()
    if (!fs.existsSync(docsDir)) return index

    function scan(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.isDirectory()) {
                scan(path.join(dir, entry.name))
            } else if (entry.name.endsWith('.md') && entry.name !== 'index.md' && entry.name !== 'all-commands.md') {
                const filePath = path.join(dir, entry.name)
                try {
                    const firstLine = fs.readFileSync(filePath, 'utf8').split('\n')[0]
                    const match = firstLine.match(/^#\s+(.+)/)
                    if (match) {
                        const cmdName = match[1].trim()
                        if (!index.has(cmdName)) {
                            index.set(cmdName, filePath)
                        }
                    }
                } catch { /* skip unreadable */ }
            }
        }
    }
    scan(docsDir)
    return index
}

function getCommandDocsIndex() {
    if (!commandDocsIndex) {
        commandDocsIndex = buildCommandDocsIndex()
    }
    return commandDocsIndex
}

export function route (app) {
    base.debug('Static Route')

    app.use('/ui', express.static(path.join(__dirname, '../app/vue/dist'), {
        // Hashed assets (index-<hash>.js/.css) are immutable and safe to cache
        // forever, but index.html holds the pointers to those hashes and MUST
        // be revalidated so a rebuild's new hashes are always picked up.
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('index.html')) {
                res.setHeader('Cache-Control', 'no-cache')
            }
        }
    }))

    app.get('/ui/{*splat}', (req, res, next) => {
        // SPA fallback for client-side navigation routes only. A request that
        // reaches here with a file extension (e.g. a missing /ui/assets/*.js)
        // is a genuinely absent file — fall through to the 404 handler rather
        // than returning index.html, which would be served as text/html and
        // trigger a "MIME type text/html" module-script error in the browser.
        if (path.extname(req.path)) {
            return next()
        }
        res.setHeader('Cache-Control', 'no-cache')
        res.sendFile(path.join(__dirname, '../app/vue/dist/index.html'))
    })

    app.use('/i18n', express.static(path.join(__dirname, '../_i18n')))

    app.get('/api/changelog', (req, res) => {
      res.sendFile(path.join(__dirname, '../changelog.json'))
    })

    app.get('/api/docs/:command', (req, res) => {
      const index = getCommandDocsIndex()
      const filePath = index.get(req.params.command)
      if (!filePath) {
        res.status(404).json({ error: 'No documentation found' })
        return
      }
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        res.type('text/markdown').send(content)
      } catch {
        res.status(500).json({ error: 'Failed to read documentation' })
      }
    })

    app.use('/favicon.ico', express.static(path.join(__dirname, '../app/vue/dist/favicon.ico')))
}
