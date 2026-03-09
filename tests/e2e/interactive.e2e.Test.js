// @ts-check
import * as base from '../base.js'
import { expect } from 'chai'
import { spawn } from 'child_process'
import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'

const interactiveStatePath = join(process.cwd(), '.interactive-state.json')

const ansiPattern = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><]/g

/**
 * @param {string} text
 * @returns {string}
 */
function normalizeOutput(text) {
  return text.replace(/\r/g, '').replace(ansiPattern, '')
}

/**
 * @param {string} inputSequence
 * @param {string[]} [args]
 * @param {number} [timeoutMs]
 * @returns {Promise<{ code: number | null, stdout: string, stderr: string }>} 
 */
function runInteractive(inputSequence, args = [], timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['bin/cli.js', 'interactive', ...args], {
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    const timer = setTimeout(() => {
      if (!child.killed) {
        child.kill('SIGTERM')
      }
      reject(new Error(`Interactive session timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    child.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })

    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ code, stdout, stderr })
    })

    if (inputSequence) {
      child.stdin?.write(inputSequence)
    }
    child.stdin?.end()
  })
}

/**
 * Skip interactive tests when the prompt runner rejects non-TTY input.
 * @param {Mocha.Context} testContext
 * @param {{ code: number | null, stdout: string, stderr: string }} result
 * @returns {boolean}
 */
function skipIfNonTty(testContext, result) {
  if (result.code === 13) {
    const output = normalizeOutput(`${result.stdout}\n${result.stderr}`)
    base.addContext(testContext, { title: 'Non-TTY Output', value: output })
    testContext.skip()
    return true
  }
  return false
}

describe('interactive command - E2E Tests', function () {
  this.timeout(20000)

  afterEach(() => {
    if (existsSync(interactiveStatePath)) {
      unlinkSync(interactiveStatePath)
    }
  })

  describe('Help output', () => {
    it('shows help with --help flag', function (done) {
      base.exec('node bin/cli.js interactive --help', (error, stdout) => {
        expect(error).to.be.null
        expect(stdout).to.include('hana-cli interactive')
        expect(stdout).to.include('--category')
        expect(stdout).to.include('--preset')
        base.addContext(this, { title: 'Help Output', value: stdout })
        done()
      })
    })
  })

  describe('Menu-driven command discovery', () => {
    it('shows main menu and handles empty search results', async function () {
      const inputSequence = '\nnope-command\nn\n'
      const { code, stdout, stderr } = await runInteractive(inputSequence)
      const output = normalizeOutput(`${stdout}\n${stderr}`)

      if (skipIfNonTty(this, { code, stdout, stderr })) {
        return
      }

      expect(code).to.equal(0)
      expect(output).to.include('HANA CLI Interactive Mode')
      expect(output).to.include('What would you like to do?')
      expect(output).to.include('Search for a command:')
      expect(output).to.include('No commands found matching "nope-command"')
      expect(output).to.include('Thanks for using hana-cli interactive mode')

      base.addContext(this, { title: 'Interactive Output', value: output })
    })

    it('searches and executes a command from the menu', async function () {
      const inputSequence = '\nversion\n\n\nn\n'
      const { code, stdout, stderr } = await runInteractive(inputSequence, [], 18000)
      const output = normalizeOutput(`${stdout}\n${stderr}`)

      if (skipIfNonTty(this, { code, stdout, stderr })) {
        return
      }

      expect(code).to.equal(0)
      expect(output).to.include('Search for a command:')
      expect(output).to.match(/Executing:\s+version/)
      expect(output).to.include('Command completed successfully')
      expect(output).to.include('Thanks for using hana-cli interactive mode')

      base.addContext(this, { title: 'Interactive Output', value: output })
    })
  })
})
