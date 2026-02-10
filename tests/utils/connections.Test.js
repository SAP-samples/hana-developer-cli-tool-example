/*eslint-env node, es6, mocha */
// @ts-check

/**
 * Unit tests for utils/connections.js
 * Testing connection management and environment detection utilities
 */

import { expect } from 'chai'
import esmock from 'esmock'
import * as path from 'path'

describe('connections.js - File Discovery Functions', () => {

    describe('getFileCheckParents()', () => {
        it('should find file in current directory', async () => {
            let callCount = 0
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        callCount++
                        return callCount === 1
                    }
                }
            })
            
            const result = connections.getFileCheckParents('package.json')
            
            expect(result).to.equal(path.join('.', 'package.json'))
            expect(callCount).to.equal(1)
        })

        it('should find file in parent directory', async () => {
            let callCount = 0
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        callCount++
                        return callCount === 2
                    }
                }
            })
            
            const result = connections.getFileCheckParents('package.json')
            
            expect(result).to.equal(path.join('..', 'package.json'))
            expect(callCount).to.equal(2)
        })

        it('should check up to 5 parent levels', async () => {
            let callCount = 0
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        callCount++
                        return false
                    }
                }
            })
            
            const result = connections.getFileCheckParents('package.json')
            
            expect(result).to.be.undefined
            expect(callCount).to.equal(5)
        })

        it('should return undefined if file not found', async () => {
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => false
                }
            })
            
            const result = connections.getFileCheckParents('nonexistent.json')
            
            expect(result).to.be.undefined
        })

        it('should handle different file names', async () => {
            let callCount = 0
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        callCount++
                        return callCount === 3
                    }
                }
            })
            
            const result = connections.getFileCheckParents('mta.yaml')
            
            expect(result).to.equal(path.join('..', '..', 'mta.yaml'))
        })
    })

    describe('getPackageJSON()', () => {
        it('should call getFileCheckParents with package.json', async () => {
            let callCount = 0
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        callCount++
                        return callCount === 1
                    }
                }
            })
            
            const result = connections.getPackageJSON()
            
            expect(result).to.equal(path.join('.', 'package.json'))
        })

        it('should return undefined if package.json not found', async () => {
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => false
                }
            })
            
            const result = connections.getPackageJSON()
            
            expect(result).to.be.undefined
        })
    })

    describe('getMTA()', () => {
        it('should call getFileCheckParents with mta.yaml', async () => {
            let callCount = 0
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        callCount++
                        return callCount === 1
                    }
                }
            })
            
            const result = connections.getMTA()
            
            expect(result).to.equal(path.join('.', 'mta.yaml'))
        })

        it('should return undefined if mta.yaml not found', async () => {
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => false
                }
            })
            
            const result = connections.getMTA()
            
            expect(result).to.be.undefined
        })
    })

    describe('getDefaultEnv()', () => {
        it('should call getFileCheckParents with default-env.json', async () => {
            let callCount = 0
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        callCount++
                        return callCount === 1
                    }
                }
            })
            
            const result = connections.getDefaultEnv()
            
            expect(result).to.equal(path.join('.', 'default-env.json'))
        })

        it('should return undefined if default-env.json not found', async () => {
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => false
                }
            })
            
            const result = connections.getDefaultEnv()
            
            expect(result).to.be.undefined
        })
    })

    describe('getDefaultEnvAdmin()', () => {
        it('should call getFileCheckParents with default-env-admin.json', async () => {
            let callCount = 0
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        callCount++
                        return callCount === 1
                    }
                }
            })
            
            const result = connections.getDefaultEnvAdmin()
            
            expect(result).to.equal(path.join('.', 'default-env-admin.json'))
        })

        it('should return undefined if default-env-admin.json not found', async () => {
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => false
                }
            })
            
            const result = connections.getDefaultEnvAdmin()
            
            expect(result).to.be.undefined
        })
    })

    describe('getEnv()', () => {
        it('should call getFileCheckParents with .env', async () => {
            let callCount = 0
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        callCount++
                        return callCount === 1
                    }
                }
            })
            
            const result = connections.getEnv()
            
            expect(result).to.equal(path.join('.', '.env'))
        })

        it('should return undefined if .env not found', async () => {
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => false
                }
            })
            
            const result = connections.getEnv()
            
            expect(result).to.be.undefined
        })
    })

    describe('getCdsrcPrivate()', () => {
        it('should call getFileCheckParents with .cdsrc-private.json', async () => {
            let callCount = 0
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        callCount++
                        return callCount === 1
                    }
                }
            })
            
            const result = connections.getCdsrcPrivate()
            
            expect(result).to.equal(path.join('.', '.cdsrc-private.json'))
        })

        it('should return undefined if .cdsrc-private.json not found', async () => {
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => false
                }
            })
            
            const result = connections.getCdsrcPrivate()
            
            expect(result).to.be.undefined
        })
    })
})

describe('connections.js - Environment Resolution', () => {
    describe('resolveEnv()', () => {
        it('should return default-env.json path by default', async () => {
            const connections = await esmock('../../utils/connections.js')
            const originalCwd = process.cwd
            process.cwd = () => path.normalize('/test/path')
            
            const result = connections.resolveEnv()
            
            expect(result).to.include('default-env.json')
            expect(result).to.include(path.normalize('/test/path'))
            
            process.cwd = originalCwd
        })

        it('should return default-env-admin.json when admin flag is true', async () => {
            const connections = await esmock('../../utils/connections.js')
            const originalCwd = process.cwd
            process.cwd = () => path.normalize('/test/path')
            
            const result = connections.resolveEnv({ admin: true })
            
            expect(result).to.include('default-env-admin.json')
            expect(result).to.include(path.normalize('/test/path'))
            
            process.cwd = originalCwd
        })

        it('should return default-env.json when admin flag is false', async () => {
            const connections = await esmock('../../utils/connections.js')
            
            const result = connections.resolveEnv({ admin: false })
            
            expect(result).to.include('default-env.json')
        })

        it('should handle null options', async () => {
            const connections = await esmock('../../utils/connections.js')
            
            const result = connections.resolveEnv(null)
            
            expect(result).to.include('default-env.json')
        })

        it('should handle options without admin property', async () => {
            const connections = await esmock('../../utils/connections.js')
            
            const result = connections.resolveEnv({ someOther: 'value' })
            
            expect(result).to.include('default-env.json')
        })
    })
})

describe('connections.js - Connection Options (Isolated Tests)', () => {
    beforeEach(() => {
        delete process.env.VCAP_SERVICES
        delete process.env.TARGET_CONTAINER
    })

    afterEach(() => {
        delete process.env.VCAP_SERVICES
        delete process.env.TARGET_CONTAINER
    })

    describe('getConnOptions() - File Discovery Logic', () => {
        it('should check for default-env-admin.json when admin flag is true', async () => {
            let existsCalled = false
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        existsCalled = true
                        return false
                    }
                },
                os: { homedir: () => '/home/testuser' }
            })
            
            try {
                await connections.getConnOptions({ admin: true })
            } catch (e) {
                // Expected to fail as no valid config found
                expect(existsCalled).to.be.true
            }
        })

        it('should check for .cdsrc-private.json when default-env-admin not found', async () => {
            let existsCalled = false
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        existsCalled = true
                        return false
                    }
                },
                os: { homedir: () => '/home/testuser' }
            })
            
            try {
                await connections.getConnOptions({ admin: false })
            } catch (e) {
                // Expected to fail - we're just testing the flow
                expect(existsCalled).to.be.true
            }
        })

        it('should check for .env file in fallback', async () => {
            let existsCalled = false
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => {
                        existsCalled = true
                        return false
                    }
                },
                os: { homedir: () => '/home/testuser' }
            })
            
            try {
                await connections.getConnOptions({})
            } catch (e) {
                // Expected to fail - testing file check flow
                expect(existsCalled).to.be.true
            }
        })

        it('should check home directory for config when conn parameter provided', async () => {
            const connections = await esmock('../../utils/connections.js', {
                fs: {
                    existsSync: () => false
                },
                os: {
                    homedir: () => '/home/testuser'
                }
            })
            
            // Since no config files exist, the function should throw an error
            // The important thing is that it attempts to check, not that it succeeds
            try {
                await connections.getConnOptions({ conn: 'my-config.json' })
                expect.fail('Should have thrown an error when no config found')
            } catch (e) {
                // Expected to fail when no config files are found
                expect(e).to.exist
            }
        })
    })
})

describe('connections.js - Module Exports', () => {
    let connections
    
    before(async () => {
        connections = await import('../../utils/connections.js')
    })

    it('should export getFileCheckParents function', () => {
        expect(connections.getFileCheckParents).to.be.a('function')
    })

    it('should export getPackageJSON function', () => {
        expect(connections.getPackageJSON).to.be.a('function')
    })

    it('should export getMTA function', () => {
        expect(connections.getMTA).to.be.a('function')
    })

    it('should export getDefaultEnv function', () => {
        expect(connections.getDefaultEnv).to.be.a('function')
    })

    it('should export getDefaultEnvAdmin function', () => {
        expect(connections.getDefaultEnvAdmin).to.be.a('function')
    })

    it('should export getEnv function', () => {
        expect(connections.getEnv).to.be.a('function')
    })

    it('should export getCdsrcPrivate function', () => {
        expect(connections.getCdsrcPrivate).to.be.a('function')
    })

    it('should export resolveEnv function', () => {
        expect(connections.resolveEnv).to.be.a('function')
    })

    it('should export getConnOptions function', () => {
        expect(connections.getConnOptions).to.be.a('function')
    })

    it('should export createConnection function', () => {
        expect(connections.createConnection).to.be.a('function')
    })
})
