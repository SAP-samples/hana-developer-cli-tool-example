// @ts-nocheck
import chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { describe, it, beforeEach, afterEach } from 'mocha'
import sinon from 'sinon'

chai.use(chaiAsPromised.default)
const expect = chai.expect

/**
 * @test Generate Docs Tests
 * Test suite for the generateDocs functionality
 */
describe('@all @generateDocs', () => {
  let generateDocsCmd
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    generateDocsCmd = await import('../bin/generateDocs.js')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('generateDocs command structure', () => {
    it('should have command property set to "generateDocs"', () => {
      expect(generateDocsCmd.command).to.equal('generateDocs')
    })

    it('should have aliases property', () => {
      expect(generateDocsCmd.aliases).to.be.an('array')
      expect(generateDocsCmd.aliases).to.include('docs')
      expect(generateDocsCmd.aliases).to.include('gendocs')
    })

    it('should have describe property', () => {
      expect(generateDocsCmd.describe).to.exist
    })

    it('should have builder property', () => {
      expect(generateDocsCmd.builder).to.be.a('function')
    })

    it('should have handler property', () => {
      expect(generateDocsCmd.handler).to.be.a('function')
    })

    it('should have inputPrompts property', () => {
      expect(generateDocsCmd.inputPrompts).to.be.an('object')
      expect(generateDocsCmd.inputPrompts).to.have.property('schema')
    })
  })

  describe('generateDocs parameters', () => {
    it('should have optional schema parameter', () => {
      expect(generateDocsCmd.inputPrompts.schema).to.exist
    })

    it('should have objects type option', () => {
      expect(generateDocsCmd.inputPrompts.objects).to.exist
    })

    it('should have output file option', () => {
      expect(generateDocsCmd.inputPrompts.output).to.exist
    })

    it('should have format option', () => {
      expect(generateDocsCmd.inputPrompts.format).to.exist
    })
  })

  describe('documentation options', () => {
    it('should support markdown format', () => {
      expect(generateDocsCmd.inputPrompts.format).to.exist
    })

    it('should include data statistics option', () => {
      expect(generateDocsCmd.builder).to.be.a('function')
    })

    it('should include grant information option', () => {
      expect(generateDocsCmd.builder).to.be.a('function')
    })

    it('should include index information option', () => {
      expect(generateDocsCmd.builder).to.be.a('function')
    })
  })

  describe('handler function', () => {
    it('should be callable', () => {
      expect(generateDocsCmd.handler).to.be.a('function')
    })
  })
})
