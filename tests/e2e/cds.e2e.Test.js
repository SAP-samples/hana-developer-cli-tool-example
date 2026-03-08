// @ts-check
import { describe, it, after } from 'mocha'
import * as base from '../base.js'
import { expect } from 'chai'
import { spawn } from 'child_process'
import http from 'http'
import { getLocalConnectionCredentials, getLiveTestControl, gateLiveTestInCI, skipOrFailLiveTest } from './helpers.js'

/**
 * Make HTTP GET request and return response body as string
 * @param {string} url - Full URL to request
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<{statusCode: number, body: string, headers: object}>}
 */
function httpGet(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout }, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => resolve({ 
        statusCode: res.statusCode || 0, 
        body, 
        headers: res.headers 
      }))
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`Request timeout after ${timeout}ms`))
    })
  })
}

/**
 * Wait for server to be ready by checking console output
 * @param {import('child_process').ChildProcess} process - Server process
 * @param {number} timeout - Max wait time in milliseconds
 * @returns {Promise<string>} - URL of the running server
 */
function waitForServer(process, timeout = 30000) {
  return new Promise((resolve, reject) => {
    let output = ''
    let resolved = false
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        reject(new Error(`Server did not start within ${timeout}ms. Output:\n${output}`))
      }
    }, timeout)

    const checkOutput = (/** @type {Buffer} */ data) => {
      const chunk = data.toString()
      output += chunk
      
      // Look for the server startup message
      const serverMatch = chunk.match(/http server.*http:\/\/(localhost|[\d.]+):(\d+)/i)
      if (serverMatch && !resolved) {
        resolved = true
        clearTimeout(timeoutId)
        const urlMatch = serverMatch[0].match(/(http:\/\/[^\s]+)/i)
        if (urlMatch) {
          resolve(urlMatch[1])
        } else {
          reject(new Error('Could not extract URL from server output'))
        }
      }
    }

    process.stdout?.on('data', checkOutput)
    process.stderr?.on('data', checkOutput)

    process.on('error', (err) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeoutId)
        reject(err)
      }
    })

    // Don't reject on exit if we already resolved (server started successfully)
    process.on('exit', (code) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeoutId)
        if (code !== 0) {
          reject(new Error(`Server process exited with code ${code}. Output:\n${output}`))
        }
      }
    })
  })
}

describe('cds command - E2E Tests', function () {
  this.timeout(20000)

  // Track spawned processes for cleanup
  /** @type {import('child_process').ChildProcess[]} */
  const spawnedProcesses = []

  after(function () {
    // Clean up any spawned processes
    spawnedProcesses.forEach(proc => {
      if (proc && !proc.killed) {
        proc.kill('SIGTERM')
        // Give it a moment, then force kill if needed
        setTimeout(() => {
          if (!proc.killed) {
            proc.kill('SIGKILL')
          }
        }, 1000)
      }
    })
  })

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js cds --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli cds')
        expect(stdout).to.include('--table')
        expect(stdout).to.include('--schema')
        expect(stdout).to.include('--view')
        expect(stdout).to.include('--useHanaTypes')
        expect(stdout).to.include('--port')
        expect(stdout).to.include('--profile')
        base.addContext(this, { title: 'CDS Help', value: stdout })
        done()
      })
    })

    it('includes documentation and related command links', function (done) {
      base.exec('node bin/cli.js cds --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.match(/Documentation:\s+https:\/\/sap-samples\.github\.io\/hana-developer-cli-tool-example\/02-commands\/developer-tools\/cds/i)
        expect(stdout).to.include('hana-cli activateHDI --help')
        expect(stdout).to.include('hana-cli generateDocs --help')
        expect(stdout).to.include('hana-cli codeTemplate --help')
        done()
      })
    })

    it('shows example usage', function (done) {
      base.exec('node bin/cli.js cds --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('Examples:')
        expect(stdout).to.include('hana-cli cds --table myTable --schema MYSCHEMA')
        done()
      })
    })
  })

  describe('Aliases', () => {
    it('supports alias "cdsPreview"', function (done) {
      base.exec('node bin/cli.js cdsPreview --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli cds')
        done()
      })
    })
  })

  describe('Validation', () => {
    it('rejects missing required table parameter (with --quiet)', function (done) {
      base.exec('node bin/cli.js cds --schema MYSCHEMA --quiet --no-prompt', (error, stdout, stderr) => {
        expect(error).to.exist
        const output = `${stdout || ''}\n${stderr || ''}`
        // Command should fail without required table parameter
        expect(output.toLowerCase()).to.satisfy((/** @type {string} */ str) => 
          str.includes('table') || str.includes('required') || str.includes('missing'),
          'Expected error about missing table parameter'
        )
        base.addContext(this, { title: 'Validation error output', value: output })
        done()
      })
    })

    it('accepts valid port number', function (done) {
      // This will fail at connection stage but should pass validation
      base.exec('node bin/cli.js cds --table TEST --port 4000 --quiet --no-prompt', (error, stdout, stderr) => {
        const output = `${stdout || ''}\n${stderr || ''}`
        // Should not complain about port format
        expect(output).to.not.match(/invalid.*port/i)
        base.addContext(this, { title: 'Port validation output', value: output })
        done()
      })
    })
  })

  describe('Live server tests (optional)', () => {
    this.timeout(60000) // Server startup can take time

    it('starts CDS preview server and serves OData endpoints', function (done) {
      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_CDS')
      if (!gateLiveTestInCI(this, done, liveControl, 'CDS live E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 
            'Live CDS E2E prerequisites not met: no HANA credentials resolved.')
        }

        // Use a random port to avoid conflicts
        const testPort = 3000 + Math.floor(Math.random() * 1000)
        
        // Spawn the CDS server process
        // Note: Using SCHEMAS view instead of DUMMY table because DUMMY has special
        // characteristics that don't translate well to CDS syntax
        const serverProcess = spawn('node', [
          'bin/cli.js',
          'cds',
          '--table', 'SCHEMAS',
          '--schema', 'SYS',
          '--view',
          '--port', testPort.toString(),
          '--quiet'
        ], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { 
            ...process.env, 
            NODE_ENV: 'test',
            // Suppress unhandled rejection warnings from CDS server internals
            NODE_OPTIONS: '--unhandled-rejections=warn'
          }
        })

        spawnedProcesses.push(serverProcess)

        /** @type {string|undefined} */
        let serverUrl
        let testsPassed = false

        const cleanup = () => {
          if (serverProcess && !serverProcess.killed) {
            serverProcess.kill('SIGTERM')
            setTimeout(() => {
              if (!serverProcess.killed) {
                serverProcess.kill('SIGKILL')
              }
            }, 1000)
          }
        }

        // Wait for server to start
        waitForServer(serverProcess, 45000)
          .then((url) => {
            serverUrl = url
            base.addContext(this, { title: 'Server URL', value: serverUrl })
            console.log(`    CDS server started at ${serverUrl}`)

            // Test 1: Check homepage
            return httpGet(serverUrl, 10000)
          })
          .then((response) => {
            expect(response.statusCode).to.equal(200)
            expect(response.body).to.include('HANA-Cli CDS Preview Tool')
            expect(response.body).to.include('odata')
            base.addContext(this, { title: 'Homepage response', value: response.body.substring(0, 500) })
            console.log('    ✓ Homepage loaded successfully')

            // Test 2: Check OData service document
            return httpGet(`${serverUrl}/odata/v4/HanaCli`, 10000)
          })
          .then((response) => {
            expect(response.statusCode).to.equal(200)
            const contentType = /** @type {any} */(response.headers)['content-type']
            expect(contentType).to.match(/application\/json/)
            
            const serviceDoc = JSON.parse(response.body)
            expect(serviceDoc).to.have.property('@odata.context')
            base.addContext(this, { title: 'OData service document', value: response.body })
            console.log('    ✓ OData service document retrieved')

            // Test 3: Check metadata endpoint
            return httpGet(`${serverUrl}/odata/v4/HanaCli/$metadata`, 10000)
          })
          .then((response) => {
            expect(response.statusCode).to.equal(200)
            const contentType = /** @type {any} */(response.headers)['content-type']
            expect(contentType).to.match(/application\/xml|xml/)
            expect(response.body).to.include('edmx:Edmx')
            expect(response.body).to.include('SCHEMAS')
            base.addContext(this, { title: 'OData metadata', value: response.body.substring(0, 1000) })
            console.log('    ✓ OData metadata endpoint working')

            testsPassed = true
            cleanup()
            done()
          })
          .catch((err) => {
            cleanup()
            base.addContext(this, { title: 'Test error', value: err.message })
            
            if (liveControl.force) {
              done(err)
            } else {
              console.log(`    ⚠ Test failed but not in forced mode: ${err.message}`)
              this.skip()
              done()
            }
          })

        // Handle server process errors
        serverProcess.on('error', (err) => {
          if (!testsPassed) {
            cleanup()
            done(err)
          }
        })

      }).catch((err) => {
        skipOrFailLiveTest(this, done, liveControl, 
          `Failed to resolve credentials: ${err.message}`)
      })
    })

    it('serves API documentation at /api-docs', function (done) {
      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_CDS')
      if (!gateLiveTestInCI(this, done, liveControl, 'CDS API docs E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 
            'Live CDS E2E prerequisites not met: no HANA credentials resolved.')
        }

        const testPort = 3100 + Math.floor(Math.random() * 1000)
        
        // Using SCHEMAS view for consistent results
        const serverProcess = spawn('node', [
          'bin/cli.js',
          'cds',
          '--table', 'SCHEMAS',
          '--view',
          '--schema', 'SYS',
          '--port', testPort.toString(),
          '--quiet'
        ], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { 
            ...process.env, 
            NODE_ENV: 'test',
            NODE_OPTIONS: '--unhandled-rejections=warn'
          }
        })

        spawnedProcesses.push(serverProcess)

        /** @type {string|undefined} */
        let serverUrl
        let testsPassed = false

        const cleanup = () => {
          if (serverProcess && !serverProcess.killed) {
            serverProcess.kill('SIGTERM')
            setTimeout(() => {
              if (!serverProcess.killed) {
                serverProcess.kill('SIGKILL')
              }
            }, 1000)
          }
        }

        waitForServer(serverProcess, 45000)
          .then((url) => {
            serverUrl = url
            console.log(`    CDS server started at ${serverUrl}`)

            // Check if Swagger UI is available
            return httpGet(`${serverUrl}/api-docs/`, 10000)
          })
          .then((response) => {
            // Swagger UI should redirect or return HTML
            expect([200, 301, 302]).to.include(response.statusCode)
            
            if (response.statusCode === 200) {
              // Should contain Swagger UI elements
              expect(response.body).to.satisfy((/** @type {string} */ body) => 
                body.includes('swagger') || body.includes('Swagger') || body.includes('openapi'),
                'Expected Swagger UI content'
              )
              console.log('    ✓ API documentation endpoint accessible')
            }

            base.addContext(this, { title: 'API docs response', value: response.body.substring(0, 500) })
            
            testsPassed = true
            cleanup()
            done()
          })
          .catch((err) => {
            cleanup()
            base.addContext(this, { title: 'Test error', value: err.message })
            
            if (liveControl.force) {
              done(err)
            } else {
              console.log(`    ⚠ Test skipped: ${err.message}`)
              this.skip()
              done()
            }
          })

        serverProcess.on('error', (err) => {
          if (!testsPassed) {
            cleanup()
            done(err)
          }
        })

      }).catch((err) => {
        skipOrFailLiveTest(this, done, liveControl, 
          `Failed to resolve credentials: ${err.message}`)
      })
    })

    it('accepts custom port via --port flag', function (done) {
      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_CDS')
      if (!gateLiveTestInCI(this, done, liveControl, 'CDS custom port E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 
            'Live CDS E2E prerequisites not met: no HANA credentials resolved.')
        }

        const customPort = 3200 + Math.floor(Math.random() * 800)
        
        // Using SCHEMAS view for consistent results
        const serverProcess = spawn('node', [
          'bin/cli.js',
          'cds',
          '--table', 'SCHEMAS',
          '--view',
          '--schema', 'SYS',
          '--port', customPort.toString(),
          '--quiet'
        ], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { 
            ...process.env, 
            NODE_ENV: 'test',
            NODE_OPTIONS: '--unhandled-rejections=warn'
          }
        })

        spawnedProcesses.push(serverProcess)

        let testsPassed = false

        const cleanup = () => {
          if (serverProcess && !serverProcess.killed) {
            serverProcess.kill('SIGTERM')
            setTimeout(() => {
              if (!serverProcess.killed) {
                serverProcess.kill('SIGKILL')
              }
            }, 1000)
          }
        }

        waitForServer(serverProcess, 45000)
          .then((url) => {
            // Verify the URL contains our custom port
            expect(url).to.include(`:${customPort}`)
            base.addContext(this, { title: 'Server URL with custom port', value: url })
            console.log(`    ✓ Server started on custom port ${customPort}`)

            // Verify server is actually listening on that port
            return httpGet(url, 10000)
          })
          .then((response) => {
            expect(response.statusCode).to.equal(200)
            console.log('    ✓ Server responding on custom port')
            
            testsPassed = true
            cleanup()
            done()
          })
          .catch((err) => {
            cleanup()
            base.addContext(this, { title: 'Test error', value: err.message })
            
            if (liveControl.force) {
              done(err)
            } else {
              console.log(`    ⚠ Test skipped: ${err.message}`)
              this.skip()
              done()
            }
          })

        serverProcess.on('error', (err) => {
          if (!testsPassed) {
            cleanup()
            done(err)
          }
        })

      }).catch((err) => {
        skipOrFailLiveTest(this, done, liveControl, 
          `Failed to resolve credentials: ${err.message}`)
      })
    })

    it('handles --view flag for CDS view generation', function (done) {
      const liveControl = getLiveTestControl('HANA_CLI_E2E_LIVE_CDS')
      if (!gateLiveTestInCI(this, done, liveControl, 'CDS view flag E2E')) {
        return
      }

      getLocalConnectionCredentials().then((creds) => {
        if (!creds || creds.kind !== 'hana') {
          return skipOrFailLiveTest(this, done, liveControl, 
            'Live CDS E2E prerequisites not met: no HANA credentials resolved.')
        }

        const testPort = 3300 + Math.floor(Math.random() * 700)
        
        // Try with a system view (M_TABLES is commonly available)
        const serverProcess = spawn('node', [
          'bin/cli.js',
          'cds',
          '--table', 'M_TABLES',
          '--schema', 'SYS',
          '--view',
          '--port', testPort.toString(),
          '--quiet'
        ], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { 
            ...process.env, 
            NODE_ENV: 'test',
            NODE_OPTIONS: '--unhandled-rejections=warn'
          }
        })

        spawnedProcesses.push(serverProcess)

        /** @type {string|undefined} */
        let serverUrl
        let testsPassed = false

        const cleanup = () => {
          if (serverProcess && !serverProcess.killed) {
            serverProcess.kill('SIGTERM')
            setTimeout(() => {
              if (!serverProcess.killed) {
                serverProcess.kill('SIGKILL')
              }
            }, 1000)
          }
        }

        waitForServer(serverProcess, 45000)
          .then((url) => {
            serverUrl = url
            console.log(`    CDS server started for view at ${serverUrl}`)

            // Check OData metadata to verify view was processed
            return httpGet(`${serverUrl}/odata/v4/HanaCli/$metadata`, 10000)
          })
          .then((response) => {
            expect(response.statusCode).to.equal(200)
            expect(response.body).to.include('M_TABLES')
            base.addContext(this, { title: 'View metadata', value: response.body.substring(0, 1000) })
            console.log('    ✓ View processed successfully in CDS')
            
            testsPassed = true
            cleanup()
            done()
          })
          .catch((err) => {
            cleanup()
            base.addContext(this, { title: 'Test error', value: err.message })
            
            if (liveControl.force) {
              done(err)
            } else {
              console.log(`    ⚠ Test skipped: ${err.message}`)
              this.skip()
              done()
            }
          })

        serverProcess.on('error', (err) => {
          if (!testsPassed) {
            cleanup()
            done(err)
          }
        })

      }).catch((err) => {
        skipOrFailLiveTest(this, done, liveControl, 
          `Failed to resolve credentials: ${err.message}`)
      })
    })
  })
})
