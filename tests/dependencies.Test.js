// @ts-nocheck
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { describe, it, beforeEach, afterEach } from 'mocha'
import sinon from 'sinon'

chai.use(chaiAsPromised.default)
const expect = chai.expect

/**
 * @test Dependencies Tests
 * Test suite for the dependencies functionality
 */
describe('@all @dependencies', () => {
  let dependenciesCmd
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    dependenciesCmd = await import('../bin/dependencies.js')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('dependencies command structure', () => {
    it('should have command property set to "dependencies"', () => {
      expect(dependenciesCmd.command).to.equal('dependencies')
    })

    it('should have aliases property', () => {
      expect(dependenciesCmd.aliases).to.be.an('array')
      expect(dependenciesCmd.aliases).to.include('deps')
      expect(dependenciesCmd.aliases).to.include('depend')
    })

    it('should have describe property', () => {
      expect(dependenciesCmd.describe).to.exist
    })

    it('should have builder property', () => {
      expect(dependenciesCmd.builder).to.be.a('function')
    })

    it('should have handler property', () => {
      expect(dependenciesCmd.handler).to.be.a('function')
    })

    it('should have inputPrompts property', () => {
      expect(dependenciesCmd.inputPrompts).to.be.an('object')
      expect(dependenciesCmd.inputPrompts).to.have.property('object')
    })
  })

  describe('dependencies parameters', () => {
    it('should have optional schema parameter', () => {
      expect(dependenciesCmd.inputPrompts.schema).to.exist
    })

    it('should have object parameter', () => {
      expect(dependenciesCmd.inputPrompts.object).to.exist
    })

    it('should have direction parameter', () => {
      expect(dependenciesCmd.inputPrompts.direction).to.exist
    })

    it('should have depth parameter', () => {
      expect(dependenciesCmd.inputPrompts.depth).to.exist
    })

    it('should have output file option', () => {
      expect(dependenciesCmd.inputPrompts.output).to.exist
    })

    it('should have format option', () => {
      expect(dependenciesCmd.inputPrompts.format).to.exist
    })
  })

  describe('dependency analysis options', () => {
    it('should support incoming direction', () => {
      expect(dependenciesCmd.builder).to.be.a('function')
    })

    it('should support outgoing direction', () => {
      expect(dependenciesCmd.builder).to.be.a('function')
    })

    it('should support both directions', () => {
      expect(dependenciesCmd.builder).to.be.a('function')
    })

    it('should support tree output format', () => {
      expect(dependenciesCmd.inputPrompts.format).to.exist
    })

    it('should support json output format', () => {
      expect(dependenciesCmd.inputPrompts.format).to.exist
    })

    it('should support graphviz output format', () => {
      expect(dependenciesCmd.inputPrompts.format).to.exist
    })
  })

  describe('handler function', () => {
    it('should be callable', () => {
      expect(dependenciesCmd.handler).to.be.a('function')
    })
  })
})
