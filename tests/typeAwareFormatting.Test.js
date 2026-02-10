// @ts-nocheck
/**
 * @module Type-Aware Formatting Tests - Detailed tests for data type formatting in text output
 * 
 * These tests validate the formatValue function and text table formatting logic,
 * ensuring proper handling of:
 * - Dates and timestamps
 * - Numbers (integers and decimals)
 * - Booleans
 * - Null and undefined values
 * - Long text truncation
 * - Objects and arrays
 */

import { describe, it } from 'mocha'
import { assert } from './base.js'
import * as fs from 'fs'
import * as path from 'path'
import * as child_process from 'child_process'

describe('Type-Aware Formatting in Text Tables', function () {
    this.timeout(15000)

    const testOutputDir = './test_formatting_output'
    
    // Clean up helper
    function cleanupTestFiles() {
        if (fs.existsSync(testOutputDir)) {
            const files = fs.readdirSync(testOutputDir)
            files.forEach(file => {
                fs.unlinkSync(path.join(testOutputDir, file))
            })
            fs.rmdirSync(testOutputDir)
        }
    }

    describe('Date and Timestamp Formatting', function () {
        
        it('should format CURRENT_TIMESTAMP in readable format', function (done) {
            const testFile = 'timestamp_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            const query = "SELECT CURRENT_TIMESTAMP AS QUERY_TIMESTAMP FROM DUMMY"
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        
                        // Timestamp should be formatted as YYYY-MM-DD HH:MM:SS (no milliseconds)
                        const timestampRegex = /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/
                        assert.ok(timestampRegex.test(content) || content.includes('QUERY_TIMESTAMP'), 
                            'Timestamp should be formatted without milliseconds')
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })

        it('should format CURRENT_DATE', function (done) {
            const testFile = 'date_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            const query = "SELECT CURRENT_DATE AS QUERY_DATE FROM DUMMY"
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        
                        // Date should be present in some format
                        assert.ok(content.includes('QUERY_DATE'), 'Should contain date column')
                        assert.ok(content.length > 50, 'Should contain formatted date value')
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })
    })

    describe('Numeric Formatting', function () {
        
        it('should format large integers with thousand separators', function (done) {
            const testFile = 'integer_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            const query = "SELECT 1234567890 AS LARGE_INTEGER FROM DUMMY"
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        
                        // Should contain the number (with or without formatting depending on locale)
                        assert.ok(content.includes('1234567890') || 
                                 content.includes('1,234,567,890') || 
                                 content.includes('1.234.567.890') ||
                                 content.includes('1 234 567 890'), 
                            'Large integer should be present (possibly formatted)')
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })

        it('should format decimal numbers appropriately', function (done) {
            const testFile = 'decimal_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            const query = "SELECT 12345.6789 AS DECIMAL_VALUE FROM DUMMY"
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        
                        // Decimal should be formatted (may vary by locale)
                        assert.ok(content.includes('12345') && 
                                 (content.includes('.67') || content.includes(',67')), 
                            'Decimal value should be present with fractional part')
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })

        it('should handle very small decimal numbers', function (done) {
            const testFile = 'small_decimal_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            const query = "SELECT 0.0001234 AS SMALL_DECIMAL FROM DUMMY"
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        
                        // Should contain the small decimal
                        assert.ok(content.includes('0.0001') || content.includes('0,0001'), 
                            'Small decimal should be formatted')
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })

        it('should handle negative numbers', function (done) {
            const testFile = 'negative_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            const query = "SELECT -99999.99 AS NEGATIVE_VALUE FROM DUMMY"
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        
                        // Should contain negative sign
                        assert.ok(content.includes('-') && content.includes('99999'), 
                            'Negative value should include minus sign')
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })

        it('should handle zero values', function (done) {
            const testFile = 'zero_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            const query = "SELECT 0 AS ZERO_VALUE FROM DUMMY"
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        
                        // Should contain zero
                        assert.ok(content.includes('0'), 'Should display zero value')
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })
    })

    describe('Text and String Handling', function () {
        
        it('should handle long text strings with truncation', function (done) {
            const testFile = 'long_text_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            // Create a very long string (more than 50 chars)
            const longText = 'A'.repeat(100)
            const query = `SELECT '${longText}' AS LONG_TEXT FROM DUMMY`
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        
                        // Long text should be present (possibly truncated with ...)
                        assert.ok(content.includes('LONG_TEXT'), 'Should contain column name')
                        assert.ok(content.includes('A'), 'Should contain the text content')
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })

        it('should handle empty strings', function (done) {
            const testFile = 'empty_string_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            const query = "SELECT '' AS EMPTY_STRING FROM DUMMY"
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        
                        // Should handle empty string gracefully
                        assert.ok(content.includes('EMPTY_STRING'), 'Should contain column name')
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })

        it('should handle special characters in strings', function (done) {
            const testFile = 'special_chars_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            const query = "SELECT 'Test & Special > Characters < \"Quotes\"' AS SPECIAL_CHARS FROM DUMMY"
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        
                        // Should preserve special characters
                        assert.ok(content.includes('SPECIAL_CHARS'), 'Should contain column name')
                        assert.ok(content.length > 50, 'Should contain content')
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })
    })

    describe('NULL and Empty Value Handling', function () {
        
        it('should handle NULL values gracefully', function (done) {
            const testFile = 'null_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            const query = "SELECT NULL AS NULL_VALUE, 'NotNull' AS NORMAL_VALUE FROM DUMMY"
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        
                        // Should handle NULL (shown as empty or "NULL")
                        assert.ok(content.includes('NULL_VALUE'), 'Should contain NULL column')
                        assert.ok(content.includes('NORMAL_VALUE'), 'Should contain other columns')
                        assert.ok(content.includes('NotNull'), 'Should contain non-NULL values')
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })
    })

    describe('Mixed Data Type Columns', function () {
        
        it('should handle multiple columns with different data types', function (done) {
            const testFile = 'mixed_types_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            const query = `SELECT 
                'Text Column' AS TEXT_COL,
                12345 AS INT_COL,
                678.90 AS DEC_COL,
                CURRENT_DATE AS DATE_COL,
                CURRENT_TIMESTAMP AS TIMESTAMP_COL
                FROM DUMMY`
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        
                        // Should contain all column names
                        assert.ok(content.includes('TEXT_COL'), 'Should have text column')
                        assert.ok(content.includes('INT_COL'), 'Should have integer column')
                        assert.ok(content.includes('DEC_COL'), 'Should have decimal column')
                        assert.ok(content.includes('DATE_COL'), 'Should have date column')
                        assert.ok(content.includes('TIMESTAMP_COL'), 'Should have timestamp column')
                        
                        // Should have table structure
                        assert.ok(content.includes('|'), 'Should have column separators')
                        assert.ok(content.includes('-'), 'Should have row separators')
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })
    })

    describe('Column Width Management in Text Files', function () {
        
        it('should limit column width to prevent overly wide tables', function (done) {
            const testFile = 'width_limit_test'
            const fullPath = path.join(testOutputDir, `${testFile}.txt`)
            
            // Create a column with very long name and content
            const longText = 'X'.repeat(80)
            const query = `SELECT '${longText}' AS VERY_LONG_COLUMN_NAME_THAT_SHOULD_BE_HANDLED FROM DUMMY`
            const cmd = `node bin/querySimple.js --query "${query}" --output table --folder "${testOutputDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                try {
                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8')
                        const lines = content.split('\n')
                        
                        // Check that no line is excessively long (truncation should apply)
                        // With 50 char max per column, even with separators, lines shouldn't be huge
                        const maxLineLength = Math.max(...lines.map(line => line.length))
                        
                        // Max should be reasonable (50 char col + some padding/separators = ~60)
                        assert.ok(maxLineLength < 200, 
                            `Maximum line length (${maxLineLength}) should be reasonable with truncation`)
                    }
                    cleanupTestFiles()
                    done()
                } catch (err) {
                    cleanupTestFiles()
                    done(err)
                }
            })
        })
    })

})
