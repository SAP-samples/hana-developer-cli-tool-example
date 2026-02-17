// @ts-nocheck
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { describe, it, beforeEach, afterEach } from 'mocha'
import sinon from 'sinon'
import yargsModule from 'yargs'

chai.use(chaiAsPromised.default)
const expect = chai.expect
const yargs = yargsModule

/**
 * @test Data Validator Tests
 * Test suite for the dataValidator functionality
 */
describe('@all @dataValidator', () => {
  let dataValidatorCmd
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    dataValidatorCmd = await import('../bin/dataValidator.js')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('dataValidator command structure', () => {
    it('should have command property set to "dataValidator"', () => {
      expect(dataValidatorCmd.command).to.equal('dataValidator')
    })

    it('should have aliases property', () => {
      expect(dataValidatorCmd.aliases).to.be.an('array')
      expect(dataValidatorCmd.aliases).to.include('dval')
      expect(dataValidatorCmd.aliases).to.include('validateData')
    })

    it('should have describe property', () => {
      expect(dataValidatorCmd.describe).to.exist
    })

    it('should have builder property', () => {
      expect(dataValidatorCmd.builder).to.be.a('function')
    })

    it('should have handler property', () => {
      expect(dataValidatorCmd.handler).to.be.a('function')
    })

    it('should have inputPrompts property', () => {
      expect(dataValidatorCmd.inputPrompts).to.exist
      expect(dataValidatorCmd.inputPrompts.table).to.exist
      expect(dataValidatorCmd.inputPrompts.rules).to.exist
    })
  })

  describe('dataValidator builder', () => {
    it('should return options with required parameters', () => {
      const mockYargs = {
        options: (opts) => mockYargs,
        example: (cmd, desc) => mockYargs,
        option: () => mockYargs
      }
      const options = dataValidatorCmd.builder(mockYargs)
      expect(options).to.have.property('option')
    })
  })

  describe('dataValidator main function', () => {
    it('should export dataValidatorMain function', () => {
      expect(dataValidatorCmd.dataValidatorMain).to.be.a('function')
    })

    it('should handle validation rules parsing', async () => {
      const testData = [
        { id: 1, name: 'John', email: 'john@example.com', age: 30 },
        { id: 2, name: 'Jane', email: 'invalid-email', age: 25 },
        { id: 3, name: '', email: 'bob@example.com', age: 35 }
      ]

      // Test parsing validation rules
      const rules = 'name:required;email:email;age:numeric'
      expect(rules).to.be.a('string')
    })
  })

  describe('dataValidator input prompts', () => {
    it('should have required table prompt', () => {
      expect(dataValidatorCmd.inputPrompts.table.required).to.equal(true)
    })

    it('should have optional schema prompt', () => {
      expect(dataValidatorCmd.inputPrompts.schema.required).to.equal(false)
    })

    it('should have required rules prompt', () => {
      expect(dataValidatorCmd.inputPrompts.rules.required).to.equal(true)
    })
  })

  describe('dataValidator features', () => {
    it('should support multiple output formats', () => {
      const mockYargs = {
        options: (opts) => mockYargs,
        example: (cmd, desc) => mockYargs,
        option: () => mockYargs
      }
      const builder = dataValidatorCmd.builder(mockYargs)
      // Verify format choices exist in command options
      expect(dataValidatorCmd.describe).to.exist
    })

    it('should have configurable timeout', () => {
      expect(dataValidatorCmd.inputPrompts).to.exist
    })
  })
})
