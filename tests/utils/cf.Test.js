/*eslint-env node, es6, mocha */
// @ts-check

/**
 * Unit tests for utils/cf.js
 * Testing Cloud Foundry CLI interaction utilities
 */

import { expect } from 'chai'
import esmock from 'esmock'

describe('cf.js - Cloud Foundry CLI Functions', () => {

    describe('getVersion()', () => {
        it('should return CF CLI version', async () => {
            const mockVersion = 'cf version 8.5.0+8edc1c0.2022-11-16\n'
            const cf = await esmock('../../utils/cf.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: mockVersion, stderr: null })
                    }
                }
            })

            const result = await cf.getVersion()

            expect(result).to.equal(mockVersion)
        })

        it('should throw error on stderr output', async () => {
            const cf = await esmock('../../utils/cf.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: null, stderr: 'Command not found' })
                    }
                }
            })

            try {
                await cf.getVersion()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error.message).to.include('Command not found')
            }
        })

        it('should return undefined if no stdout', async () => {
            const cf = await esmock('../../utils/cf.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: null, stderr: null })
                    }
                }
            })

            const result = await cf.getVersion()

            expect(result).to.be.undefined
        })

        it('should throw error on execution failure', async () => {
            const cf = await esmock('../../utils/cf.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(new Error('CF CLI not installed'))
                    }
                }
            })

            try {
                await cf.getVersion()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error.message).to.include('CF CLI not installed')
            }
        })
    })

    describe('getCFConfig()', () => {
        it('should read CF config.json from home directory', async () => {
            const cf = await esmock('../../utils/cf.js', {
                fs: {
                    readFileSync: () => JSON.stringify({
                        Target: 'https://api.cf.eu10.hana.ondemand.com',
                        OrganizationFields: {
                            Name: 'my-org',
                            GUID: 'org-guid-123'
                        },
                        SpaceFields: {
                            Name: 'dev',
                            GUID: 'space-guid-456'
                        }
                    })
                },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await cf.getCFConfig()

            expect(result).to.be.an('object')
            expect(result.Target).to.include('api.cf')
            expect(result.OrganizationFields.Name).to.equal('my-org')
        })

        it('should throw error if config file not found', async () => {
            const cf = await esmock('../../utils/cf.js', {
                fs: {
                    readFileSync: () => { throw new Error('ENOENT: no such file') }
                },
                os: { homedir: () => '/home/testuser' }
            })

            try {
                await cf.getCFConfig()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error).to.be.an('error')
            }
        })

        it('should throw error on invalid JSON', async () => {
            const cf = await esmock('../../utils/cf.js', {
                fs: { readFileSync: () => 'invalid json{' },
                os: { homedir: () => '/home/testuser' }
            })

            try {
                await cf.getCFConfig()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error).to.be.an('error')
            }
        })
    })

    describe('getCFOrg()', () => {
        it('should return organization fields from config', async () => {
            const cf = await esmock('../../utils/cf.js', {
                fs: {
                    readFileSync: () => JSON.stringify({
                        OrganizationFields: {
                            Name: 'test-org',
                            GUID: 'org-guid-789'
                        }
                    })
                },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await cf.getCFOrg()

            expect(result).to.be.an('object')
            expect(result.Name).to.equal('test-org')
            expect(result.GUID).to.equal('org-guid-789')
        })
    })

    describe('getCFOrgName()', () => {
        it('should return organization name', async () => {
            const cf = await esmock('../../utils/cf.js', {
                fs: {
                    readFileSync: () => JSON.stringify({
                        OrganizationFields: {
                            Name: 'production-org',
                            GUID: 'org-guid-999'
                        }
                    })
                },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await cf.getCFOrgName()

            expect(result).to.equal('production-org')
        })
    })

    describe('getCFOrgGUID()', () => {
        it('should return organization GUID', async () => {
            const cf = await esmock('../../utils/cf.js', {
                fs: {
                    readFileSync: () => JSON.stringify({
                        OrganizationFields: {
                            Name: 'my-org',
                            GUID: 'unique-org-guid-123'
                        }
                    })
                },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await cf.getCFOrgGUID()

            expect(result).to.equal('unique-org-guid-123')
        })
    })

    describe('getCFSpace()', () => {
        it('should return space fields from config', async () => {
            const cf = await esmock('../../utils/cf.js', {
                fs: {
                    readFileSync: () => JSON.stringify({
                        SpaceFields: {
                            Name: 'test-space',
                            GUID: 'space-guid-abc'
                        }
                    })
                },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await cf.getCFSpace()

            expect(result).to.be.an('object')
            expect(result.Name).to.equal('test-space')
            expect(result.GUID).to.equal('space-guid-abc')
        })
    })

    describe('getCFSpaceName()', () => {
        it('should return space name', async () => {
            const cf = await esmock('../../utils/cf.js', {
                fs: {
                    readFileSync: () => JSON.stringify({
                        SpaceFields: {
                            Name: 'development',
                            GUID: 'space-guid-dev'
                        }
                    })
                },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await cf.getCFSpaceName()

            expect(result).to.equal('development')
        })
    })

    describe('getCFSpaceGUID()', () => {
        it('should return space GUID', async () => {
            const cf = await esmock('../../utils/cf.js', {
                fs: {
                    readFileSync: () => JSON.stringify({
                        SpaceFields: {
                            Name: 'prod',
                            GUID: 'unique-space-guid-456'
                        }
                    })
                },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await cf.getCFSpaceGUID()

            expect(result).to.equal('unique-space-guid-456')
        })
    })

    describe('getCFTarget()', () => {
        it('should return target URL from config', async () => {
            const cf = await esmock('../../utils/cf.js', {
                fs: {
                    readFileSync: () => JSON.stringify({
                        Target: 'https://api.cf.us10.hana.ondemand.com'
                    })
                },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await cf.getCFTarget()

            expect(result).to.equal('https://api.cf.us10.hana.ondemand.com')
        })
    })

    describe('getHANAInstances()', () => {
        it('should execute cf curl to get HANA instances', async () => {
            const mockResponse = {
                resources: [
                    {
                        entity: {
                            name: 'my-hana-db',
                            service_plan_guid: 'plan-guid-123'
                        }
                    }
                ]
            }
            
            const cf = await esmock('../../utils/cf.js', {
                fs: {
                    readFileSync: () => JSON.stringify({
                        SpaceFields: {
                            GUID: 'space-123'
                        },
                        OrganizationFields: {
                            GUID: 'org-123'
                        }
                    })
                },
                os: { homedir: () => '/home/testuser' },
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: JSON.stringify(mockResponse), stderr: null })
                    }
                }
            })

            const result = await cf.getHANAInstances()

            expect(result).to.be.an('object')
            expect(result.resources).to.be.an('array')
        })

        it('should handle empty HANA instances', async () => {
            const cf = await esmock('../../utils/cf.js', {
                fs: {
                    readFileSync: () => JSON.stringify({
                        SpaceFields: {
                            GUID: 'space-456'
                        },
                        OrganizationFields: {
                            GUID: 'org-456'
                        }
                    })
                },
                os: { homedir: () => '/home/testuser' },
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: '{"resources":[]}', stderr: null })
                    }
                }
            })

            const result = await cf.getHANAInstances()

            expect(result.resources).to.be.an('array')
            expect(result.resources.length).to.equal(0)
        })
    })
})

describe('cf.js - Module Exports', () => {
    let cf
    
    before(async () => {
        cf = await import('../../utils/cf.js')
    })

    it('should export getVersion function', () => {
        expect(cf.getVersion).to.be.a('function')
    })

    it('should export getCFConfig function', () => {
        expect(cf.getCFConfig).to.be.a('function')
    })

    it('should export getCFOrg function', () => {
        expect(cf.getCFOrg).to.be.a('function')
    })

    it('should export getCFOrgName function', () => {
        expect(cf.getCFOrgName).to.be.a('function')
    })

    it('should export getCFOrgGUID function', () => {
        expect(cf.getCFOrgGUID).to.be.a('function')
    })

    it('should export getCFSpace function', () => {
        expect(cf.getCFSpace).to.be.a('function')
    })

    it('should export getCFSpaceName function', () => {
        expect(cf.getCFSpaceName).to.be.a('function')
    })

    it('should export getCFSpaceGUID function', () => {
        expect(cf.getCFSpaceGUID).to.be.a('function')
    })

    it('should export getCFTarget function', () => {
        expect(cf.getCFTarget).to.be.a('function')
    })

    it('should export getHANAInstances function', () => {
        expect(cf.getHANAInstances).to.be.a('function')
    })
})
