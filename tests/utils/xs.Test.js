/*eslint-env node, es6, mocha */
// @ts-nocheck

/**
 * Unit tests for utils/xs.js
 * Testing XSA CLI interaction utilities
 */

import { expect } from 'chai'
import esmock from 'esmock'

describe('xs.js - XSA CLI Functions', () => {

    describe('getCFConfig()', () => {
        it('should read XSA config from .xsconfig file', async () => {
            const mockConfig = `api=https\\://xs.example.com\\:30030
org=my-org
orgGuid=org-123-456
space=dev
spaceGuid=space-789-abc`
            
            const xs = await esmock('../../utils/xs.js', {
                fs: {
                    readFileSync: () => mockConfig
                },
                os: {
                    homedir: () => '/home/testuser'
                }
            })

            const result = await xs.getCFConfig()

            expect(result).to.be.an('object')
            expect(result.org).to.equal('my-org')
            expect(result.space).to.equal('dev')
        })

        it('should throw error if config file not found', async () => {
            const xs = await esmock('../../utils/xs.js', {
                fs: {
                    readFileSync: () => { throw new Error('ENOENT: no such file') }
                },
                os: {
                    homedir: () => '/home/testuser'
                }
            })

            try {
                await xs.getCFConfig()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error).to.be.an('error')
            }
        })
    })

    describe('getCFOrg()', () => {
        it('should return organization config', async () => {
            const mockConfig = 'org=test-org\norgGuid=org-guid-123'
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await xs.getCFOrg()

            expect(result).to.be.an('object')
            expect(result.org).to.equal('test-org')
        })
    })

    describe('getCFOrgName()', () => {
        it('should return organization name', async () => {
            const mockConfig = 'org=production-org\norgGuid=org-guid-999'
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await xs.getCFOrgName()

            expect(result).to.equal('production-org')
        })
    })

    describe('getCFOrgGUID()', () => {
        it('should return organization GUID', async () => {
            const mockConfig = 'org=my-org\norgGuid=unique-org-guid-456'
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await xs.getCFOrgGUID()

            expect(result).to.equal('unique-org-guid-456')
        })
    })

    describe('getCFSpace()', () => {
        it('should return space config', async () => {
            const mockConfig = 'space=test-space\nspaceGuid=space-guid-abc'
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await xs.getCFSpace()

            expect(result).to.be.an('object')
            expect(result.space).to.equal('test-space')
        })
    })

    describe('getCFSpaceName()', () => {
        it('should return space name', async () => {
            const mockConfig = 'space=development\nspaceGuid=space-guid-dev'
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await xs.getCFSpaceName()

            expect(result).to.equal('development')
        })
    })

    describe('getCFSpaceGUID()', () => {
        it('should return space GUID', async () => {
            const mockConfig = 'space=prod\nspaceGuid=unique-space-guid-789'
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await xs.getCFSpaceGUID()

            expect(result).to.equal('unique-space-guid-789')
        })
    })

    describe('getCFTarget()', () => {
        it('should return target API URL', async () => {
            const mockConfig = 'api=https\\://xs.example.com\\:30030'
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await xs.getCFTarget()

            expect(result).to.include('https://xs.example.com:30030')
        })

        it('should replace escaped colons in URL', async () => {
            const mockConfig = 'api=https\\://localhost\\:30030'
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await xs.getCFTarget()

            expect(result).to.equal('https://localhost:30030')
        })
    })

    describe('getHANAInstances()', () => {
        it('should execute xs curl to get HANA instances', async () => {
            const mockConfig = 'spaceGuid=space-123'
            const mockResponse = {
                serviceInstances: [
                    {
                        name: 'my-hana-db',
                        guid: 'instance-guid-123'
                    }
                ]
            }
            
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' },
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: JSON.stringify(mockResponse), stderr: null })
                    }
                }
            })

            const result = await xs.getHANAInstances()

            expect(result).to.be.an('array')
            expect(result[0].name).to.equal('my-hana-db')
        })

        it('should handle empty service instances', async () => {
            const mockConfig = 'spaceGuid=space-456'
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' },
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: '{"serviceInstances":[]}', stderr: null })
                    }
                }
            })

            const result = await xs.getHANAInstances()

            expect(result).to.be.an('array')
            expect(result.length).to.equal(0)
        })

        it('should throw error on stderr', async () => {
            const mockConfig = 'spaceGuid=space-789'
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' },
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: '{}', stderr: 'Connection failed' })
                    }
                }
            })

            try {
                await xs.getHANAInstances()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error.message).to.include('Connection failed')
            }
        })
    })

    describe('getHANAInstanceByName()', () => {
        it('should get HANA instance by name', async () => {
            const mockConfig = 'spaceGuid=space-abc'
            const mockResponse = {
                serviceInstances: [
                    {
                        name: 'specific-hana-db',
                        guid: 'specific-guid-123'
                    }
                ]
            }
            
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' },
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: JSON.stringify(mockResponse), stderr: null })
                    }
                }
            })

            const result = await xs.getHANAInstanceByName('specific-hana-db')

            expect(result).to.be.an('array')
            expect(result[0].name).to.equal('specific-hana-db')
        })

        it('should return empty array when instance not found', async () => {
            const mockConfig = 'spaceGuid=space-def'
            const xs = await esmock('../../utils/xs.js', {
                fs: { readFileSync: () => mockConfig },
                os: { homedir: () => '/home/testuser' },
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: '{"serviceInstances":[]}', stderr: null })
                    }
                }
            })

            const result = await xs.getHANAInstanceByName('nonexistent-db')

            expect(result).to.be.an('array')
            expect(result.length).to.equal(0)
        })
    })

    describe('getServicePlans()', () => {
        it('should get service plans for a service GUID', async () => {
            const mockResponse = {
                servicePlans: [
                    {
                        name: 'hdi-shared',
                        guid: 'plan-guid-123'
                    },
                    {
                        name: 'hana',
                        guid: 'plan-guid-456'
                    }
                ]
            }
            
            const xs = await esmock('../../utils/xs.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: JSON.stringify(mockResponse), stderr: null })
                    }
                },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await xs.getServicePlans('service-guid-789')

            expect(result).to.be.an('array')
            expect(result.length).to.equal(2)
            expect(result[0].name).to.equal('hdi-shared')
        })

        it('should throw error on stderr', async () => {
            const xs = await esmock('../../utils/xs.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: '{}', stderr: 'Invalid service GUID' })
                    }
                },
                os: { homedir: () => '/home/testuser' }
            })

            try {
                await xs.getServicePlans('invalid-guid')
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error.message).to.include('Invalid service GUID')
            }
        })
    })

    describe('getServices()', () => {
        it('should get all services', async () => {
            const mockResponse = {
                services: [
                    {
                        name: 'hana',
                        guid: 'service-guid-123'
                    },
                    {
                        name: 'xsuaa',
                        guid: 'service-guid-456'
                    }
                ]
            }
            
            const xs = await esmock('../../utils/xs.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: JSON.stringify(mockResponse), stderr: null })
                    }
                },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await xs.getServices()

            expect(result).to.be.an('array')
            expect(result.length).to.equal(2)
            expect(result[0].name).to.equal('hana')
        })

        it('should handle empty services list', async () => {
            const xs = await esmock('../../utils/xs.js', {
                child_process: {
                    exec: (cmd, callback) => {
                        callback(null, { stdout: '{"services":[]}', stderr: null })
                    }
                },
                os: { homedir: () => '/home/testuser' }
            })

            const result = await xs.getServices()

            expect(result).to.be.an('array')
            expect(result.length).to.equal(0)
        })
    })
})

describe('xs.js - Module Exports', () => {
    let xs
    
    before(async () => {
        xs = await import('../../utils/xs.js')
    })

    it('should export getCFConfig function', () => {
        expect(xs.getCFConfig).to.be.a('function')
    })

    it('should export getCFOrg function', () => {
        expect(xs.getCFOrg).to.be.a('function')
    })

    it('should export getCFOrgName function', () => {
        expect(xs.getCFOrgName).to.be.a('function')
    })

    it('should export getCFOrgGUID function', () => {
        expect(xs.getCFOrgGUID).to.be.a('function')
    })

    it('should export getCFSpace function', () => {
        expect(xs.getCFSpace).to.be.a('function')
    })

    it('should export getCFSpaceName function', () => {
        expect(xs.getCFSpaceName).to.be.a('function')
    })

    it('should export getCFSpaceGUID function', () => {
        expect(xs.getCFSpaceGUID).to.be.a('function')
    })

    it('should export getCFTarget function', () => {
        expect(xs.getCFTarget).to.be.a('function')
    })

    it('should export getHANAInstances function', () => {
        expect(xs.getHANAInstances).to.be.a('function')
    })

    it('should export getHANAInstanceByName function', () => {
        expect(xs.getHANAInstanceByName).to.be.a('function')
    })

    it('should export getServicePlans function', () => {
        expect(xs.getServicePlans).to.be.a('function')
    })

    it('should export getServices function', () => {
        expect(xs.getServices).to.be.a('function')
    })
})
