// @ts-check

/**
 * @module massExport utility regression tests
 * Verifies metadata query compatibility for table structure export.
 */

import { assert } from '../base.js'
import esmock from 'esmock'

describe('utils/massExport - metadata query compatibility', function () {
  it('orders TABLE_COLUMNS by POSITION during structure export', async function () {
    /** @type {string[]} */
    const preparedQueries = []

    const mockDb = {
      preparePromisified: async (query) => {
        preparedQueries.push(query)
        return query
      },
      statementExecPromisified: async (statement) => {
        if (statement.includes('FROM TABLES')) {
          return [{ SCHEMA_NAME: 'TEST_SCHEMA', TABLE_NAME: 'TEST_TABLE', COMMENTS: null }]
        }
        if (statement.includes('FROM TABLE_COLUMNS')) {
          return [{ COLUMN_NAME: 'ID', DATA_TYPE_NAME: 'INTEGER', IS_NULLABLE: 'FALSE', COMMENTS: null, DEFAULT_VALUE: null }]
        }
        return []
      }
    }

    const progressBar = {
      startItem: () => {},
      itemDone: () => {},
      stop: () => {}
    }

    const prompts = {
      schema: 'TEST_SCHEMA',
      object: 'TEST_%',
      limit: 1,
      format: 'json',
      folder: 'tests/.tmp/mass-export-regression',
      includeData: false
    }

    const massExport = await esmock('../../utils/massExport.js', {
      '../../utils/base.js': {
        bundle: {
          getText: (key) => key
        },
        debug: () => {},
        dbClass: {
          objectName: (value) => value,
          schemaCalc: async () => 'TEST_SCHEMA'
        },
        getPrompts: () => prompts,
        createDBConnection: async () => mockDb,
        outputTableFancy: () => {},
        terminal: {
          progressBar: () => progressBar
        },
        end: () => undefined,
        error: async (error) => {
          throw error
        }
      },
      fs: {
        promises: {
          mkdir: async () => {},
          writeFile: async () => {}
        }
      }
    })

    await massExport.exportObjects()

    const tableColumnsQuery = preparedQueries.find((query) => query.includes('FROM TABLE_COLUMNS'))
    assert.ok(tableColumnsQuery, 'Expected a TABLE_COLUMNS metadata query to be prepared')
    assert.ok(tableColumnsQuery.includes('ORDER BY POSITION'), 'Expected metadata query to order by POSITION')
    assert.ok(!tableColumnsQuery.includes('COLUMN_POSITION'), 'Expected metadata query not to reference COLUMN_POSITION')
  })
})
