// @ts-nocheck
import { assert } from './base.js'
import { serializeCSV, serializeJSON, serializeExcel } from '../bin/export.js'

describe('Export Serializers', function () {
  const rows = [
    { ID: 1, NAME: 'Alice', NOTE: 'a,b' },
    { ID: 2, NAME: 'Bob', NOTE: null }
  ]

  describe('serializeCSV', function () {
    it('includes headers by default and escapes delimiters', function () {
      const csv = serializeCSV(rows, {})
      const lines = csv.trim().split('\n')
      assert.strictEqual(lines[0], 'ID,NAME,NOTE')
      assert.strictEqual(lines[1], '1,Alice,"a,b"')
    })

    it('omits headers when includeHeaders is false', function () {
      const csv = serializeCSV(rows, { includeHeaders: false })
      assert.strictEqual(csv.trim().split('\n')[0], '1,Alice,"a,b"')
    })

    it('uses custom delimiter and nullValue', function () {
      const csv = serializeCSV(rows, { delimiter: ';', nullValue: 'NULL' })
      const lines = csv.trim().split('\n')
      assert.strictEqual(lines[0], 'ID;NAME;NOTE')
      assert.strictEqual(lines[2], '2;Bob;NULL')
    })

    it('returns empty string for no rows', function () {
      assert.strictEqual(serializeCSV([], {}), '')
    })

    it('null field renders as empty string with default options', function () {
      const csv = serializeCSV(rows, {})
      const lines = csv.trim().split('\n')
      // Bob row: ID=2, NAME=Bob, NOTE=null → trailing empty cell
      assert.strictEqual(lines[2], '2,Bob,')
    })

    it('custom delimiter field is quoted when it contains the delimiter', function () {
      const csv = serializeCSV([{ A: 'a;b' }], { delimiter: ';' })
      // The value 'a;b' must be quoted because it contains the active delimiter ';'
      assert.ok(csv.includes('"a;b"'), `Expected quoted field in: ${csv}`)
      // Must NOT appear as an unquoted split: two separate cells 'a' and 'b'
      const dataLine = csv.trim().split('\n')[1]
      assert.ok(!dataLine.includes(';a;') && dataLine !== 'a;b', `Field must be quoted, got: ${dataLine}`)
    })
  })

  describe('serializeJSON', function () {
    it('serializes rows as a JSON array with null preserved', function () {
      const parsed = JSON.parse(serializeJSON(rows, {}))
      assert.strictEqual(parsed.length, 2)
      assert.strictEqual(parsed[1].NOTE, null)
    })

    it('returns [] for no rows', function () {
      assert.strictEqual(serializeJSON([], {}), '[]')
    })
  })

  describe('serializeExcel', function () {
    it('returns a non-empty Buffer', async function () {
      const buf = await serializeExcel(rows, { sheetName: 'Test' })
      assert.ok(Buffer.isBuffer(buf))
      assert.ok(buf.length > 0)
    })
  })
})
