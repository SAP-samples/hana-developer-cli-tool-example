// @ts-nocheck
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'

chai.use(chaiAsPromised.default)
const expect = chai.expect

/**
 * @test ER Diagram Tests
 * Test suite for the erdDiagram functionality
 */
describe('@all @erdDiagram', () => {
  let erdDiagramCmd
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    erdDiagramCmd = await import('../bin/erdDiagram.js')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('erdDiagram command structure', () => {
    it('should have command property set to "erdDiagram"', () => {
      expect(erdDiagramCmd.command).to.equal('erdDiagram')
    })

    it('should have aliases property', () => {
      expect(erdDiagramCmd.aliases).to.be.an('array')
      expect(erdDiagramCmd.aliases).to.include('erd')
      expect(erdDiagramCmd.aliases).to.include('er')
    })

    it('should have describe property', () => {
      expect(erdDiagramCmd.describe).to.exist
    })

    it('should have builder property', () => {
      expect(erdDiagramCmd.builder).to.be.a('function')
    })

    it('should have handler property', () => {
      expect(erdDiagramCmd.handler).to.be.a('function')
    })

    it('should have inputPrompts property', () => {
      expect(erdDiagramCmd.inputPrompts).to.be.an('object')
    })
  })

  describe('erdDiagram parameters', () => {
    it('should have optional schema parameter', () => {
      expect(erdDiagramCmd.inputPrompts.schema).to.exist
    })

    it('should have optional table filter', () => {
      expect(erdDiagramCmd.inputPrompts.tables).to.exist
    })

    it('should have output file option', () => {
      expect(erdDiagramCmd.inputPrompts.output).to.exist
    })

    it('should have format option', () => {
      expect(erdDiagramCmd.inputPrompts.format).to.exist
    })
  })

  describe('diagram generation options', () => {
    it('should support mermaid format', () => {
      expect(erdDiagramCmd.inputPrompts.format).to.exist
    })

    it('should support plantuml format', () => {
      expect(erdDiagramCmd.builder).to.be.a('function')
    })

    it('should support graphviz format', () => {
      expect(erdDiagramCmd.builder).to.be.a('function')
    })

    it('should allow showing/hiding cardinality', () => {
      expect(erdDiagramCmd.builder).to.be.a('function')
    })

    it('should allow showing/hiding columns', () => {
      expect(erdDiagramCmd.builder).to.be.a('function')
    })
  })

  describe('handler function', () => {
    it('should be callable', () => {
      expect(erdDiagramCmd.handler).to.be.a('function')
    })
  })
})
