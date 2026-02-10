/*eslint-env node, es6, mocha */
// @ts-check

/**
 * Unit tests for utils/cf.js
 * Testing Cloud Foundry CLI interaction utilities
 */

import { expect } from 'chai'
import sinon from 'sinon'
import * as child_process from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as cf from '../../utils/cf.js'

describe('cf.js - Cloud Foundry CLI Functions', () => {
    let execStub, readFileSyncStub, homedirStub

    beforeEach(() => {
        execStub = sinon.stub(child_process, 'exec')
        readFileSyncStub = sinon.stub(fs, 'readFileSync')
        homedirStub = sinon.stub(os, 'homedir').returns('/home/testuser')
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('getVersion()', () => {
        it('should return CF CLI version', async () => {
            const mockVersion = 'cf version 8.5.0+8edc1c0.2022-11-16\n'
            execStub.callsArgWith(1, null, { stdout: mockVersion, stderr: null })

            const result = await cf.getVersion()

            expect(result).to.equal(mockVersion)
            expect(execStub.calledWith('cf -v')).to.be.true
        })

        it('should throw error on stderr output', async () => {
            execStub.callsArgWith(1, null, { stdout: null, stderr: 'Command not found' })

            try {
                await cf.getVersion()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error.message).to.include('Command not found')
            }
        })

        it('should return undefined if no stdout', async () => {
            execStub.callsArgWith(1, null, { stdout: null, stderr: null })

            const result = await cf.getVersion()

            expect(result).to.be.undefined
        })

        it('should throw error on execution failure', async () => {
            execStub.callsArgWith(1, new Error('CF CLI not installed'))

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
            readFileSyncStub.returns(JSON.stringify({
                Target: 'https://api.cf.eu10.hana.ondemand.com',
                OrganizationFields: {
                    Name: 'my-org',
                    GUID: 'org-guid-123'
                },
                SpaceFields: {
                    Name: 'dev',
                    GUID: 'space-guid-456'
                }
            }))

            const result = await cf.getCFConfig()

            expect(result).to.be.an('object')
            expect(result.Target).to.include('api.cf')
            expect(result.OrganizationFields.Name).to.equal('my-org')
            expect(readFileSyncStub.calledWith('/home/testuser/.cf/config.json')).to.be.true
        })

        it('should throw error if config file not found', async () => {
            readFileSyncStub.throws(new Error('ENOENT: no such file'))

            try {
                await cf.getCFConfig()
                expect.fail('Should have thrown error')
            } catch (error) {
                expect(error).to.be.an('error')
            }
        })

        it('should throw error on invalid JSON', async () => {
            readFileSyncStub.returns('invalid json{')

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
            readFileSyncStub.returns(JSON.stringify({
                OrganizationFields: {
                    Name: 'test-org',
                    GUID: 'org-guid-789'
                }
            }))

            const result = await cf.getCFOrg()

            expect(result).to.be.an('object')
            expect(result.Name).to.equal('test-org')
            expect(result.GUID).to.equal('org-guid-789')
        })
    })

    describe('getCFOrgName()', () => {
        it('should return organization name', async () => {
            readFileSyncStub.returns(JSON.stringify({
                OrganizationFields: {
                    Name: 'production-org',
                    GUID: 'org-guid-999'
                }
            }))

            const result = await cf.getCFOrgName()

            expect(result).to.equal('production-org')
        })
    })

    describe('getCFOrgGUID()', () => {
        it('should return organization GUID', async () => {
            readFileSyncStub.returns(JSON.stringify({
                OrganizationFields: {
                    Name: 'my-org',
                    GUID: 'unique-org-guid-123'
                }
            }))

            const result = await cf.getCFOrgGUID()

            expect(result).to.equal('unique-org-guid-123')
        })
    })

    describe('getCFSpace()', () => {
        it('should return space fields from config', async () => {
            readFileSyncStub.returns(JSON.stringify({
                SpaceFields: {
                    Name: 'test-space',
                    GUID: 'space-guid-abc'
                }
            }))

            const result = await cf.getCFSpace()

            expect(result).to.be.an('object')
            expect(result.Name).to.equal('test-space')
            expect(result.GUID).to.equal('space-guid-abc')
        })
    })

    describe('getCFSpaceName()', () => {
        it('should return space name', async () => {
            readFileSyncStub.returns(JSON.stringify({
                SpaceFields: {
                    Name: 'development',
                    GUID: 'space-guid-dev'
                }
            }))

            const result = await cf.getCFSpaceName()

            expect(result).to.equal('development')
        })
    })

    describe('getCFSpaceGUID()', () => {
        it('should return space GUID', async () => {
            readFileSyncStub.returns(JSON.stringify({
                SpaceFields: {
                    Name: 'prod',
                    GUID: 'unique-space-guid-456'
                }
            }))

            const result = await cf.getCFSpaceGUID()

            expect(result).to.equal('unique-space-guid-456')
        })
    })

    describe('getCFTarget()', () => {
        it('should return target URL from config', async () => {
            readFileSyncStub.returns(JSON.stringify({
                Target: 'https://api.cf.us10.hana.ondemand.com'
            }))

            const result = await cf.getCFTarget()

            expect(result).to.equal('https://api.cf.us10.hana.ondemand.com')
        })
    })

    describe('getHANAInstances()', () => {
        it('should execute cf curl to get HANA instances', async () => {
            readFileSyncStub.returns(JSON.stringify({
                SpaceFields: {
                    GUID: 'space-123'
                }
            }))
            
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
            
            execStub.callsArgWith(1, null, { stdout: JSON.stringify(mockResponse), stderr: null })

            const result = await cf.getHANAInstances()

            expect(result).to.be.an('object')
            expect(result.resources).to.be.an('array')
            expect(execStub.called).to.be.true
        })

        it('should handle empty HANA instances', async () => {
            readFileSyncStub.returns(JSON.stringify({
                SpaceFields: {
                    GUID: 'space-456'
                }
            }))
            
            execStub.callsArgWith(1, null, { stdout: '{"resources":[]}', stderr: null })

            const result = await cf.getHANAInstances()

            expect(result.resources).to.be.an('array')
            expect(result.resources.length).to.equal(0)
        })
    })
})

describe('cf.js - Module Exports', () => {
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
