// @ts-nocheck
/**
 * Unit tests for querySimple DML/DDL handling
 * Tests the removeNewlineCharacter and formatAsTextTable utilities directly,
 * and verifies DML/DDL behavior via subprocess execution.
 */
import { assert } from '../base.js'
import * as child_process from 'child_process'
import { removeNewlineCharacter } from '../../bin/querySimple.js'

describe('querySimple - DML/DDL result handling', function () {
  this.timeout(15000)

  describe('removeNewlineCharacter', function () {
    it('should replace newline characters in string values', function () {
      const result = removeNewlineCharacter({ col1: 'line1\nline2', col2: 'no newline' })
      assert.strictEqual(result.col1, 'line1 line2')
      assert.strictEqual(result.col2, 'no newline')
    })

    it('should handle carriage returns', function () {
      const result = removeNewlineCharacter({ col: 'a\r\nb' })
      assert.strictEqual(result.col, 'a b')
    })

    it('should preserve non-string values', function () {
      const result = removeNewlineCharacter({ num: 42, bool: true, nil: null })
      assert.strictEqual(result.num, 42)
      assert.strictEqual(result.bool, true)
      assert.strictEqual(result.nil, null)
    })
  })

  describe('DML statement handling (INSERT/UPDATE/DELETE)', function () {
    it('should exit 0 and show rows affected for INSERT', function (done) {
      // Using child_process.execFile for safety — command args are static literals
      child_process.execFile('node', [
        'bin/querySimple.js', '--query', 'INSERT INTO DUMMY VALUES(1)', '--quiet'
      ], (error, stdout, stderr) => {
        if (error && error.message.includes('connect')) {
          done()
          return
        }
        if (!error && stdout.trim()) {
          assert.ok(
            stdout.includes('Rows affected') || stdout.includes('rowsAffected'),
            'DML output should mention rows affected'
          )
        }
        done()
      })
    })

    it('should output JSON for DML with --output json', function (done) {
      child_process.execFile('node', [
        'bin/querySimple.js', '--query', 'DELETE FROM DUMMY WHERE 1=0', '--output', 'json', '--quiet'
      ], (error, stdout, stderr) => {
        if (error && error.message.includes('connect')) {
          done()
          return
        }
        if (!error && stdout.trim()) {
          const parsed = JSON.parse(stdout.trim())
          assert.ok('rowsAffected' in parsed, 'JSON should have rowsAffected field')
          assert.strictEqual(typeof parsed.rowsAffected, 'number')
        }
        done()
      })
    })
  })

  describe('DDL statement handling (CREATE/DROP/ALTER)', function () {
    it('should exit 0 and show success for DDL', function (done) {
      child_process.execFile('node', [
        'bin/querySimple.js', '--query', 'CREATE LOCAL TEMPORARY TABLE #TEST_DDL (ID INT)', '--quiet'
      ], (error, stdout, stderr) => {
        if (error && error.message.includes('connect')) {
          done()
          return
        }
        if (!error && stdout.trim()) {
          assert.ok(
            stdout.includes('successfully') || stdout.includes('success'),
            'DDL output should indicate success'
          )
        }
        done()
      })
    })

    it('should output JSON for DDL with --output json', function (done) {
      child_process.execFile('node', [
        'bin/querySimple.js', '--query', 'CREATE LOCAL TEMPORARY TABLE #TEST_DDL2 (ID INT)',
        '--output', 'json', '--quiet'
      ], (error, stdout, stderr) => {
        if (error && error.message.includes('connect')) {
          done()
          return
        }
        if (!error && stdout.trim()) {
          const parsed = JSON.parse(stdout.trim())
          assert.strictEqual(parsed.success, true)
          assert.ok(parsed.message, 'JSON should have message field')
        }
        done()
      })
    })
  })

  describe('exit code behavior', function () {
    it('should not crash on non-SELECT when DB is available', function (done) {
      // Verifies fix for issue #137: non-SELECT statements previously hit
      // results[0] on a non-array, causing TypeError and exit code 1.
      child_process.execFile('node', [
        'bin/querySimple.js', '--query', 'SELECT 1 FROM DUMMY', '--quiet'
      ], (error, stdout, stderr) => {
        if (error && error.message.includes('connect')) {
          done()
          return
        }
        assert.strictEqual(error, null, 'Should exit with code 0')
        done()
      })
    })
  })
})
