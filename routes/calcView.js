// @ts-check
/**
 * @module calcView - Routes for calculation view project file operations
 * Provides endpoints for listing, reading, and writing .hdbcalculationview files on disk.
 */

import path from 'path'
import fs from 'fs/promises'
import { glob } from 'glob'

/**
 * @param {import('express').Application} app - Express application instance
 */
export function route(app) {

  /**
   * @swagger
   * /hana/calcview/project/list:
   *   get:
   *     tags: [Calculation Views]
   *     summary: List .hdbcalculationview files in a directory
   *     parameters:
   *       - in: query
   *         name: path
   *         required: true
   *         schema:
   *           type: string
   *         description: Directory path to scan for calculation view files
   *     responses:
   *       200:
   *         description: Array of calculation view file metadata
   *       400:
   *         description: Missing path parameter
   */
  app.get('/hana/calcview/project/list', async (req, res, next) => {
    try {
      const dirPath = req.query.path
      if (!dirPath) {
        return res.status(400).json({ error: 'path parameter is required' })
      }

      const pattern = path.posix.join(String(dirPath).replace(/\\/g, '/'), '**', '*.hdbcalculationview')
      const files = await glob(pattern)

      const results = await Promise.all(files.map(async (filePath) => {
        const stat = await fs.stat(filePath)
        const fileName = path.basename(filePath)
        const name = fileName.replace('.hdbcalculationview', '')
        return {
          name,
          fileName,
          filePath,
          lastModified: stat.mtime.toISOString(),
          size: stat.size
        }
      }))

      res.status(200).json(results)
    } catch (error) {
      next(error)
    }
  })

  /**
   * @swagger
   * /hana/calcview/project/read:
   *   get:
   *     tags: [Calculation Views]
   *     summary: Read a .hdbcalculationview file
   *     parameters:
   *       - in: query
   *         name: file
   *         required: true
   *         schema:
   *           type: string
   *         description: Absolute path to the calculation view file
   *       - in: query
   *         name: base
   *         schema:
   *           type: string
   *         description: Base directory for path traversal protection
   *     responses:
   *       200:
   *         description: XML content of the file
   *       400:
   *         description: Missing file parameter
   *       403:
   *         description: Access denied (wrong extension or path traversal)
   *       404:
   *         description: File not found
   */
  app.get('/hana/calcview/project/read', async (req, res, next) => {
    try {
      const filePath = req.query.file
      const basePath = req.query.base
      if (!filePath) {
        return res.status(400).json({ error: 'file parameter is required' })
      }

      const resolved = path.resolve(String(filePath))
      if (!resolved.endsWith('.hdbcalculationview')) {
        return res.status(403).json({ error: 'Only .hdbcalculationview files can be read' })
      }

      // Path traversal protection: resolved path must be within base directory
      if (basePath) {
        const normalizedBase = path.resolve(String(basePath))
        if (!resolved.startsWith(normalizedBase + path.sep) && resolved !== normalizedBase) {
          return res.status(403).json({ error: 'Access denied: path outside project root' })
        }
      }

      try {
        await fs.access(resolved)
      } catch {
        return res.status(404).json({ error: 'File not found' })
      }

      const xml = await fs.readFile(resolved, 'utf-8')
      res.status(200).json({ xml, filePath: resolved })
    } catch (error) {
      next(error)
    }
  })

  /**
   * @swagger
   * /hana/calcview/project/write:
   *   post:
   *     tags: [Calculation Views]
   *     summary: Write XML to a .hdbcalculationview file
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [file, xml]
   *             properties:
   *               file:
   *                 type: string
   *                 description: Absolute path to the file to write
   *               xml:
   *                 type: string
   *                 description: XML content to write
   *               base:
   *                 type: string
   *                 description: Base directory for path traversal protection
   *     responses:
   *       200:
   *         description: File written successfully
   *       400:
   *         description: Missing file or xml parameter
   *       403:
   *         description: Access denied (wrong extension or path traversal)
   */
  app.post('/hana/calcview/project/write', async (req, res, next) => {
    try {
      const { file, xml, base } = req.body
      if (!file || !xml) {
        return res.status(400).json({ error: 'file and xml are required' })
      }

      const resolved = path.resolve(file)
      if (!resolved.endsWith('.hdbcalculationview')) {
        return res.status(403).json({ error: 'Only .hdbcalculationview files can be written' })
      }

      // Path traversal protection: resolved path must be within base directory
      if (base) {
        const normalizedBase = path.resolve(base)
        if (!resolved.startsWith(normalizedBase + path.sep) && resolved !== normalizedBase) {
          return res.status(403).json({ error: 'Access denied: path outside project root' })
        }
      }

      await fs.writeFile(resolved, xml, 'utf-8')
      res.status(200).json({ success: true, filePath: resolved })
    } catch (error) {
      next(error)
    }
  })
}
