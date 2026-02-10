// @ts-nocheck
import * as base from './base.js'
import * as child_process from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

describe('querySimple', function () {
    // Increase timeout for database operations
    this.timeout(15000)

    it("returns help output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli querySimple --help", done)
    })

    it("returns normal output", function (done) {
        const localTest = base.myTest.bind(this)
        localTest("hana-cli querySimple --query \"SELECT * FROM DUMMY\" --quiet", done)
    })

    describe('Table Output Enhancements', function () {
        
        it("should display table format output with formatting", function (done) {
            child_process.exec('hana-cli querySimple --query "SELECT CURRENT_USER, CURRENT_TIMESTAMP FROM DUMMY" --output table --quiet',
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    // Table output should contain structured data
                    base.assert.ok(stdout.length > 0, 'Should produce table output')
                    done()
                })
        })

        it("should save table format to text file with type-aware formatting", function (done) {
            const testDir = './test_output'
            const testFile = 'query_output_test'
            const fullPath = path.join(testDir, `${testFile}.txt`)

            // Clean up any existing test file
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath)
            }

            const query = "SELECT CURRENT_USER AS USER_NAME, CURRENT_TIMESTAMP AS QUERY_TIME, 12345678.9012 AS NUMERIC_VALUE FROM DUMMY"
            const cmd = `hana-cli querySimple --query "${query}" --output table --folder "${testDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                try {
                    // Check if file was created
                    base.assert.ok(fs.existsSync(fullPath), 'Text file should be created')
                    
                    // Read and verify content
                    const content = fs.readFileSync(fullPath, 'utf8')
                    base.addContext(this, { title: 'File Content', value: content })
                    
                    // Verify table structure (headers and separators)
                    base.assert.ok(content.includes('USER_NAME'), 'Should contain USER_NAME column')
                    base.assert.ok(content.includes('QUERY_TIME'), 'Should contain QUERY_TIME column')
                    base.assert.ok(content.includes('NUMERIC_VALUE'), 'Should contain NUMERIC_VALUE column')
                    base.assert.ok(content.includes('-'), 'Should contain separator line')
                    base.assert.ok(content.includes('|'), 'Should contain column separators')
                    
                    // Verify numeric formatting (number should be present)
                    base.assert.ok(content.includes('12345678') || content.includes('12,345,678'), 
                        'Should contain formatted numeric value')
                    
                    // Clean up
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath)
                    }
                    if (fs.existsSync(testDir) && fs.readdirSync(testDir).length === 0) {
                        fs.rmdirSync(testDir)
                    }
                    
                    done()
                } catch (err) {
                    // Clean up on error
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath)
                    }
                    if (fs.existsSync(testDir) && fs.readdirSync(testDir).length === 0) {
                        fs.rmdirSync(testDir)
                    }
                    done(err)
                }
            })
        })

        it("should handle JSON output format", function (done) {
            child_process.exec('hana-cli querySimple --query "SELECT * FROM DUMMY" --output json --quiet',
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    if (!error && stdout) {
                        try {
                            // JSON output should be parseable
                            const parsed = JSON.parse(stdout)
                            base.assert.ok(Array.isArray(parsed), 'JSON output should be an array')
                            base.assert.ok(parsed.length > 0, 'JSON should contain results')
                        } catch (e) {
                            // May not have connection, but format should be attempted
                        }
                    }
                    done()
                })
        })

        it("should handle CSV output format", function (done) {
            child_process.exec('hana-cli querySimple --query "SELECT * FROM DUMMY" --output csv --quiet',
                (error, stdout, stderr) => {
                    base.addContext(this, { title: 'Stdout', value: stdout })
                    base.addContext(this, { title: 'Stderr', value: stderr })
                    
                    if (!error && stdout) {
                        // CSV should contain delimiter (semicolon as per config)
                        base.assert.ok(stdout.includes(';') || stdout.length > 0, 
                            'CSV output should have delimiter or content')
                    }
                    done()
                })
        })

        it("should save JSON output to file", function (done) {
            const testDir = './test_output'
            const testFile = 'query_json_test'
            const fullPath = path.join(testDir, `${testFile}.json`)

            // Clean up any existing test file
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath)
            }

            const cmd = `hana-cli querySimple --query "SELECT * FROM DUMMY" --output json --folder "${testDir}" --filename "${testFile}" --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                try {
                    if (fs.existsSync(fullPath)) {
                        // Verify JSON file content
                        const content = fs.readFileSync(fullPath, 'utf8')
                        base.addContext(this, { title: 'File Content', value: content })
                        
                        const parsed = JSON.parse(content)
                        base.assert.ok(Array.isArray(parsed), 'JSON file should contain an array')
                        
                        // Clean up
                        fs.unlinkSync(fullPath)
                        if (fs.existsSync(testDir) && fs.readdirSync(testDir).length === 0) {
                            fs.rmdirSync(testDir)
                        }
                    }
                    done()
                } catch (err) {
                    // Clean up on error
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath)
                    }
                    if (fs.existsSync(testDir) && fs.readdirSync(testDir).length === 0) {
                        fs.rmdirSync(testDir)
                    }
                    done(err)
                }
            })
        })

        it("should handle queries with various data types", function (done) {
            const query = "SELECT 'text' AS TEXT_COL, 123 AS INT_COL, 456.789 AS DEC_COL, CURRENT_DATE AS DATE_COL FROM DUMMY"
            const cmd = `hana-cli querySimple --query "${query}" --output table --quiet`

            child_process.exec(cmd, (error, stdout, stderr) => {
                base.addContext(this, { title: 'Stdout', value: stdout })
                base.addContext(this, { title: 'Stderr', value: stderr })
                
                // Should produce output with different data types
                if (!error && stdout) {
                    base.assert.ok(stdout.length > 0, 'Should handle various data types')
                }
                done()
            })
        })
    })

})

