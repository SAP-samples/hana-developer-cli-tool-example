/*eslint-env node, es6, mocha */
// @ts-check

/**
 * Unit tests for utils/btp.js
 * Testing BTP CLI interaction utilities
 */

import { expect } from 'chai'
import sinon from 'sinon'
import * as child_process from 'child_process'
import * as fs from 'fs'
import * as btp from '../../utils/btp.js'

describe('btp.js - BTP CLI Functions', () => {
    let execStub, readFileSyncStub, existsSyncStub

    beforeEach(() => {
        execStub = sinon.stub(child_process, 'exec')
        readFileSyncStub = sinon.stub(fs, 'readFileSync')
        existsSyncStub = sinon.stub(fs, 'existsSync')
    })

    afterEach(() => {
        sinon.restore()
        delete process.env.BTP_CLIENTCONFIG
        delete process.env.APPDATA
        delete process.env.HOME
    })

    describe('getVersion()', () => {
        it('should return BTP CLI version', async () => {
            const mockVersion = 'SAP BTP command line interface (client v2.38.0)\n'
            execStub.callsArgWith(1, null, { stdout: mockVersion })

            const result = await btp.getVersion()

            expect(result).to.equal(mockVersion)
            expect(execStub.calledWith('btp --version')).to.be.true
        })

        it('should return undefined if no version output', async () => {
            execStub.callsArgWith(1, null, { stdout: null })

            const result = await btp.getVersion()

            expect(result).to.be.undefined
        })

        it('should throw error on execution failure', async () => {
            execStub.callsArgWith(1, new Error('Command not found'))

            try {
                await btp.getVersion()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error.message).to.include('Command not found')
            }
        })
    })

    describe('getInfo()', () => {
        it('should parse BTP CLI info output', async () => {
            const mockInfo = `
SAP BTP command line interface (client v2.38.0)
CLI server URL:          https://cli.btp.cloud.sap
Logged in as:            user@example.com
Configuration:           /home/user/.config/.btp/config.json
`
            execStub.callsArgWith(1, null, { stdout: mockInfo })

            const result = await btp.getInfo()

            expect(result).to.be.an('object')
            expect(result.Configuration).to.include('config.json')
            expect(result.serverURL).to.include('https://cli.btp.cloud.sap')
            expect(result.user).to.include('user@example.com')
        })

        it('should handle missing info fields gracefully', async () => {
            const mockInfo = 'Short output'
            execStub.callsArgWith(1, null, { stdout: mockInfo })

            const result = await btp.getInfo()

            expect(result).to.be.an('object')
        })

        it('should return undefined if no stdout', async () => {
            execStub.callsArgWith(1, null, { stdout: null })

            const result = await btp.getInfo()

            expect(result).to.be.undefined
        })

        it('should throw error on execution failure', async () => {
            execStub.callsArgWith(1, new Error('BTP CLI error'))

            try {
                await btp.getInfo()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error.message).to.include('BTP CLI error')
            }
        })
    })

    describe('getBTPConfig()', () => {
        it('should read config from BTP_CLIENTCONFIG env var', async () => {
            process.env.BTP_CLIENTCONFIG = '/custom/config.json'
            existsSyncStub.returns(true)
            readFileSyncStub.returns(JSON.stringify({
                TargetHierarchy: {
                    globalaccount: 'test-ga'
                }
            }))

            const result = await btp.getBTPConfig()

            expect(result).to.be.an('object')
            expect(result.TargetHierarchy).to.exist
        })

        it('should read config from getInfo() if BTP_CLIENTCONFIG not set', async () => {
            const mockInfo = `
SAP BTP command line interface (client v2.38.0)
CLI server URL:          https://cli.btp.cloud.sap
Logged in as:            user@example.com
Configuration:           /home/user/.config/.btp/config.json
`
            execStub.callsArgWith(1, null, { stdout: mockInfo })
            existsSyncStub.returns(true)
            readFileSyncStub.returns(JSON.stringify({
                TargetHierarchy: {
                    globalaccount: 'test-ga'
                }
            }))

            const result = await btp.getBTPConfig()

            expect(result).to.be.an('object')
        })

        it('should use APPDATA path on Windows', async () => {
            process.env.APPDATA = 'C:\\Users\\test\\AppData\\Roaming'
            existsSyncStub.returns(true)
            readFileSyncStub.returns(JSON.stringify({
                TargetHierarchy: {}
            }))

            const result = await btp.getBTPConfig()

            expect(result).to.be.an('object')
            expect(readFileSyncStub.firstCall.args[0]).to.include('AppData')
        })

        it('should use HOME path on macOS', async () => {
            process.env.HOME = '/Users/test'
            const originalPlatform = process.platform
            Object.defineProperty(process, 'platform', {
                value: 'darwin'
            })
            existsSyncStub.onFirstCall().returns(false)
            existsSyncStub.onSecondCall().returns(true)
            readFileSyncStub.returns(JSON.stringify({
                TargetHierarchy: {}
            }))

            const result = await btp.getBTPConfig()

            expect(result).to.be.an('object')

            Object.defineProperty(process, 'platform', {
                value: originalPlatform
            })
        })

        it('should throw error if config file not found', async () => {
            existsSyncStub.returns(false)
            process.env.HOME = '/home/test'

            try {
                await btp.getBTPConfig()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error).to.be.an('error')
            }
        })

        it('should throw error on invalid JSON', async () => {
            process.env.HOME = '/home/test'
            existsSyncStub.returns(true)
            readFileSyncStub.returns('invalid json{')

            try {
                await btp.getBTPConfig()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error).to.be.an('error')
            }
        })
    })

    describe('getBTPTarget()', () => {
        it('should return target hierarchy from config', async () => {
            execStub.callsArgWith(1, null, {
                stdout: '\n\n\n\nCLI server URL:          https://cli.btp.cloud.sap\nLogged in as:            user@example.com\nConfiguration:           /home/user/.config/.btp/config.json\n'
            })
            existsSyncStub.returns(true)
            readFileSyncStub.returns(JSON.stringify({
                TargetHierarchy: {
                    globalaccount: 'my-global-account',
                    subaccount: 'my-subaccount'
                }
            }))

            const result = await btp.getBTPTarget()

            expect(result).to.be.an('object')
            expect(result.globalaccount).to.equal('my-global-account')
            expect(result.subaccount).to.equal('my-subaccount')
        })

        it('should throw error if config has no target hierarchy', async () => {
            execStub.callsArgWith(1, null, {
                stdout: '\n\n\n\nCLI server URL:          https://cli.btp.cloud.sap\nLogged in as:            user@example.com\nConfiguration:           /home/user/.config/.btp/config.json\n'
            })
            existsSyncStub.returns(true)
            readFileSyncStub.returns(JSON.stringify({}))

            try {
                await btp.getBTPTarget()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error).to.be.an('error')
            }
        })
    })

    describe('getBTPGlobalAccount()', () => {
        it('should return global account from target', async () => {
            execStub.callsArgWith(1, null, {
                stdout: '\n\n\n\nCLI server URL:          https://cli.btp.cloud.sap\nLogged in as:            user@example.com\nConfiguration:           /home/user/.config/.btp/config.json\n'
            })
            existsSyncStub.returns(true)
            readFileSyncStub.returns(JSON.stringify({
                TargetHierarchy: {
                    globalaccount: 'my-global-account-guid'
                }
            }))

            const result = await btp.getBTPGlobalAccount()

            expect(result).to.equal('my-global-account-guid')
        })
    })
})

describe('btp.js - Module Exports', () => {
    it('should export getVersion function', () => {
        expect(btp.getVersion).to.be.a('function')
    })

    it('should export getInfo function', () => {
        expect(btp.getInfo).to.be.a('function')
    })

    it('should export getBTPConfig function', () => {
        expect(btp.getBTPConfig).to.be.a('function')
    })

    it('should export getBTPTarget function', () => {
        expect(btp.getBTPTarget).to.be.a('function')
    })

    it('should export getBTPGlobalAccount function', () => {
        expect(btp.getBTPGlobalAccount).to.be.a('function')
    })
})
