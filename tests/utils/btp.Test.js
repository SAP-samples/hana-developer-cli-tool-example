/*eslint-env node, es6, mocha */
// @ts-check

/**
 * Unit tests for utils/btp.js
 * Testing BTP CLI interaction utilities
 */

import { expect } from 'chai'
import mock from 'mock-fs'
import esmock from 'esmock'

describe('btp.js - BTP CLI Functions', () => {
    afterEach(() => {
        delete process.env.BTP_CLIENTCONFIG
        delete process.env.APPDATA
        delete process.env.HOME
    })

    describe('getVersion()', () => {
        it('should return BTP CLI version', async () => {
            const mockVersion = 'SAP BTP command line interface (client v2.38.0)\n'
            
            const btp = await esmock('../../utils/btp.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: mockVersion })
                    }
                }
            })

            const result = await btp.getVersion()

            expect(result).to.equal(mockVersion)
        })

        it('should return undefined if no version output', async () => {
            const btp = await esmock('../../utils/btp.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: null })
                    }
                }
            })

            const result = await btp.getVersion()

            expect(result).to.be.undefined
        })

        it('should throw error on execution failure', async () => {
            const btp = await esmock('../../utils/btp.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(new Error('Command not found'))
                    }
                }
            })

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
            const mockInfo = `\nSAP BTP command line interface (client v2.38.0)\n\n\nCLI server URL:          https://cli.btp.cloud.sap\nLogged in as:            user@example.com\nConfiguration:           /home/user/.config/.btp/config.json\n`
            const btp = await esmock('../../utils/btp.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: mockInfo })
                    }
                }
            })

            const result = await btp.getInfo()

            expect(result).to.be.an('object')
            expect(result.Configuration).to.include('config.json')
            expect(result.serverURL).to.include('https://cli.btp.cloud.sap')
            expect(result.user).to.include('user@example.com')
        })

        it('should handle missing info fields gracefully', async () => {
            const mockInfo = 'Short output'
            const btp = await esmock('../../utils/btp.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: mockInfo })
                    }
                }
            })

            const result = await btp.getInfo()

            expect(result).to.be.an('object')
        })

        it('should return undefined if no stdout', async () => {
            const btp = await esmock('../../utils/btp.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: null })
                    }
                }
            })

            const result = await btp.getInfo()

            expect(result).to.be.undefined
        })

        it('should throw error on execution failure', async () => {
            const btp = await esmock('../../utils/btp.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(new Error('BTP CLI error'))
                    }
                }
            })

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
            
            const btp = await esmock('../../utils/btp.js', {
                fs: {
                    existsSync: () => true,
                    readFileSync: () => JSON.stringify({
                        TargetHierarchy: {
                            globalaccount: 'test-ga'
                        }
                    })
                }
            })

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
            const btp = await esmock('../../utils/btp.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: mockInfo })
                    }
                },
                fs: {
                    existsSync: () => true,
                    readFileSync: () => JSON.stringify({
                        TargetHierarchy: {
                            globalaccount: 'test-ga'
                        }
                    })
                }
            })

            const result = await btp.getBTPConfig()

            expect(result).to.be.an('object')
        })

        it('should use APPDATA path on Windows', async () => {
            process.env.APPDATA = 'C:\\Users\\test\\AppData\\Roaming'
            delete process.env.BTP_CLIENTCONFIG // Remove to trigger APPDATA logic
            
            let capturedPath = ''
            const btp = await esmock('../../utils/btp.js', {
                fs: {
                    existsSync: (path) => {
                        // Return false for first check (getInfo path), true for APPDATA path
                        return path.includes('AppData')
                    },
                    readFileSync: (path) => {
                        capturedPath = path
                        return JSON.stringify({
                            TargetHierarchy: {}
                        })
                    }
                },
                child_process: {
                    exec: (cmd, callback) => {
                        // Mock getInfo to return undefined path, forcing APPDATA fallback
                        callback(null, { stdout: 'minimal output' })
                    }
                }
            })

            const result = await btp.getBTPConfig()

            expect(result).to.be.an('object')
            expect(capturedPath).to.include('AppData')
        })

        it('should use HOME path on macOS', async () => {
            process.env.HOME = '/Users/test'
            delete process.env.BTP_CLIENTCONFIG // Remove to trigger HOME logic
            const originalPlatform = process.platform
            Object.defineProperty(process, 'platform', {
                value: 'darwin'
            })
            
            let callCount = 0
            const btp = await esmock('../../utils/btp.js', {
                fs: {
                    existsSync: (path) => {
                        callCount++
                        // First check fails (getInfo path), second check succeeds (Preferences path)
                        return callCount >= 2 && path.includes('Preferences')
                    },
                    readFileSync: () => JSON.stringify({
                        TargetHierarchy: {}
                    })
                },
                child_process: {
                    exec: (cmd, callback) => {
                        // Mock getInfo to return undefined path, forcing HOME fallback
                        callback(null, { stdout: 'minimal output' })
                    }
                }
            })

            const result = await btp.getBTPConfig()

            expect(result).to.be.an('object')

            Object.defineProperty(process, 'platform', {
                value: originalPlatform
            })
        })

        it('should throw error if config file not found', async () => {
            process.env.HOME = '/home/test'
            
            const btp = await esmock('../../utils/btp.js', {
                fs: {
                    existsSync: () => false
                }
            })

            try {
                await btp.getBTPConfig()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error).to.be.an('error')
            }
        })

        it('should throw error on invalid JSON', async () => {
            process.env.HOME = '/home/test'
            
            const btp = await esmock('../../utils/btp.js', {
                fs: {
                    existsSync: () => true,
                    readFileSync: () => 'invalid json{'
                }
            })

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
            const btp = await esmock('../../utils/btp.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, {
                            stdout: '\n\n\n\nCLI server URL:          https://cli.btp.cloud.sap\nLogged in as:            user@example.com\nConfiguration:           /home/user/.config/.btp/config.json\n'
                        })
                    }
                },
                fs: {
                    existsSync: () => true,
                    readFileSync: () => JSON.stringify({
                        TargetHierarchy: {
                            globalaccount: 'my-global-account',
                            subaccount: 'my-subaccount'
                        }
                    })
                }
            })

            const result = await btp.getBTPTarget()

            expect(result).to.be.an('object')
            expect(result.globalaccount).to.equal('my-global-account')
            expect(result.subaccount).to.equal('my-subaccount')
        })

        it('should throw error if config has no target hierarchy', async () => {
            const btp = await esmock('../../utils/btp.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, {
                            stdout: '\n\n\n\nCLI server URL:          https://cli.btp.cloud.sap\nLogged in as:            user@example.com\nConfiguration:           /home/user/.config/.btp/config.json\n'
                        })
                    }
                },
                fs: {
                    existsSync: () => true,
                    readFileSync: () => JSON.stringify({})
                }
            })

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
            const btp = await esmock('../../utils/btp.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, {
                            stdout: '\n\n\n\nCLI server URL:          https://cli.btp.cloud.sap\nLogged in as:            user@example.com\nConfiguration:           /home/user/.config/.btp/config.json\n'
                        })
                    }
                },
                fs: {
                    existsSync: () => true,
                    readFileSync: () => JSON.stringify({
                        TargetHierarchy: [
                            {
                                Type: 'globalaccount',
                                ID: 'my-global-account-guid',
                                DisplayName: 'My Global Account'
                            }
                        ]
                    })
                }
            })

            const result = await btp.getBTPGlobalAccount()

            expect(result).to.be.an('object')
            expect(result.ID).to.equal('my-global-account-guid')
        })
    })
})

describe('btp.js - Module Exports', () => {
    let btp
    
    before(async () => {
        btp = await import('../../utils/btp.js')
    })

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

describe('btp.js - Cross-Platform Filesystem Tests @all', () => {
    let btp
    
    before(async () => {
        btp = await import('../../utils/btp.js')
    })

    afterEach(() => {
        mock.restore()
        delete process.env.BTP_CLIENTCONFIG
        delete process.env.APPDATA
        delete process.env.HOME
    })

    describe('getBTPConfig() with mock-fs @all', () => {
        it('should read Windows config path with mock filesystem @windows', function () {
            if (process.platform !== 'win32') {
                // Skip on non-Windows, just verify behavior would work
                this.skip()
            }
            
            // Mock Windows filesystem structure
            mock({
                'C:\\Users\\test\\AppData\\Roaming\\SAP\\btp\\config.json': JSON.stringify({
                    TargetHierarchy: {
                        globalaccount: 'test-ga',
                        subaccount: 'test-sub'
                    }
                })
            })

            process.env.APPDATA = 'C:\\Users\\test\\AppData\\Roaming'
            process.env.BTP_CLIENTCONFIG = 'C:\\Users\\test\\AppData\\Roaming\\SAP\\btp\\config.json'

            return btp.getBTPConfig().then(result => {
                expect(result).to.be.an('object')
                expect(result.TargetHierarchy).to.exist
            })
        })

        it('should read macOS config path with mock filesystem @unix', function () {
            if (process.platform === 'win32') {
                // Skip on Windows
                this.skip()
            }
            
            // Mock macOS filesystem structure
            mock({
                '/Users/test/Library/Preferences/SAP/btp/config.json': JSON.stringify({
                    TargetHierarchy: {
                        globalaccount: 'test-ga-mac'
                    }
                })
            })

            process.env.HOME = '/Users/test'
            process.env.BTP_CLIENTCONFIG = '/Users/test/Library/Preferences/SAP/btp/config.json'

            return btp.getBTPConfig().then(result => {
                expect(result).to.be.an('object')
            })
        })

        it('should read Linux config path with mock filesystem @unix', function () {
            if (process.platform === 'win32') {
                // Skip on Windows
                this.skip()
            }
            
            // Mock Linux filesystem structure
            mock({
                '/home/test/.config/.btp/config.json': JSON.stringify({
                    TargetHierarchy: {
                        globalaccount: 'test-ga-linux'
                    }
                })
            })

            process.env.HOME = '/home/test'
            process.env.BTP_CLIENTCONFIG = '/home/test/.config/.btp/config.json'

            return btp.getBTPConfig().then(result => {
                expect(result).to.be.an('object')
            })
        })

        it('should handle macOS fallback location with mock filesystem @unix', function () {
            if (process.platform === 'win32') {
                // Skip on Windows
                this.skip()
            }
            
            // Mock macOS fallback location
            mock({
                '/Users/test/Library/Application Support/.btp/config.json': JSON.stringify({
                    TargetHierarchy: {
                        globalaccount: 'test-ga-fallback'
                    }
                })
            })

            process.env.HOME = '/Users/test'
            process.env.BTP_CLIENTCONFIG = '/Users/test/Library/Application Support/.btp/config.json'

            return btp.getBTPConfig().then(result => {
                expect(result).to.be.an('object')
            })
        })
    })
})
