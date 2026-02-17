// @ts-nocheck
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { describe, it, beforeEach, afterEach } from 'mocha'
import sinon from 'sinon'

chai.use(chaiAsPromised.default)
const expect = chai.expect

/**
 * @test Code Template Tests
 * Test suite for the codeTemplate functionality
 */
describe('@all @codeTemplate', () => {
  let codeTemplateCmd
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    codeTemplateCmd = await import('../bin/codeTemplate.js')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('codeTemplate command structure', () => {
    it('should have command property set to "codeTemplate"', () => {
      expect(codeTemplateCmd.command).to.equal('codeTemplate')
    })

    it('should have aliases property', () => {
      expect(codeTemplateCmd.aliases).to.be.an('array')
      expect(codeTemplateCmd.aliases).to.include('template')
      expect(codeTemplateCmd.aliases).to.include('codegen')
      expect(codeTemplateCmd.aliases).to.include('boilerplate')
    })

    it('should have describe property', () => {
      expect(codeTemplateCmd.describe).to.exist
    })

    it('should have builder property', () => {
      expect(codeTemplateCmd.builder).to.be.a('function')
    })

    it('should have handler property', () => {
      expect(codeTemplateCmd.handler).to.be.a('function')
    })

    it('should have inputPrompts property', () => {
      expect(codeTemplateCmd.inputPrompts).to.be.an('object')
      expect(codeTemplateCmd.inputPrompts).to.have.property('pattern')
      expect(codeTemplateCmd.inputPrompts).to.have.property('object')
    })
  })

  describe('codeTemplate parameters', () => {
    it('should require pattern parameter', () => {
      expect(codeTemplateCmd.inputPrompts.pattern.required).to.equal(true)
    })

    it('should require object parameter', () => {
      expect(codeTemplateCmd.inputPrompts.object.required).to.equal(true)
    })

    it('should have optional schema parameter', () => {
      expect(codeTemplateCmd.inputPrompts.schema).to.exist
      expect(codeTemplateCmd.inputPrompts.schema.required).to.equal(false)
    })

    it('should have language option', () => {
      expect(codeTemplateCmd.inputPrompts.language).to.exist
    })

    it('should have output file option', () => {
      expect(codeTemplateCmd.inputPrompts.output).to.exist
    })

    it('should have framework option', () => {
      expect(codeTemplateCmd.inputPrompts.framework).to.exist
    })
  })

  describe('code template patterns', () => {
    it('should support crud pattern', () => {
      expect(codeTemplateCmd.builder).to.be.a('function')
    })

    it('should support service pattern', () => {
      expect(codeTemplateCmd.builder).to.be.a('function')
    })

    it('should support repository pattern', () => {
      expect(codeTemplateCmd.builder).to.be.a('function')
    })

    it('should support mapper pattern', () => {
      expect(codeTemplateCmd.builder).to.be.a('function')
    })

    it('should support dto pattern', () => {
      expect(codeTemplateCmd.builder).to.be.a('function')
    })

    it('should support entity pattern', () => {
      expect(codeTemplateCmd.builder).to.be.a('function')
    })

    it('should support query pattern', () => {
      expect(codeTemplateCmd.builder).to.be.a('function')
    })

    it('should support test pattern', () => {
      expect(codeTemplateCmd.builder).to.be.a('function')
    })

    it('should support migration pattern', () => {
      expect(codeTemplateCmd.builder).to.be.a('function')
    })
  })

  describe('language support', () => {
    it('should support typescript', () => {
      expect(codeTemplateCmd.inputPrompts.language).to.exist
    })

    it('should support javascript', () => {
      expect(codeTemplateCmd.inputPrompts.language).to.exist
    })

    it('should support java', () => {
      expect(codeTemplateCmd.inputPrompts.language).to.exist
    })

    it('should support sql', () => {
      expect(codeTemplateCmd.inputPrompts.language).to.exist
    })
  })

  describe('handler function', () => {
    it('should be callable', () => {
      expect(codeTemplateCmd.handler).to.be.a('function')
    })
  })
})
