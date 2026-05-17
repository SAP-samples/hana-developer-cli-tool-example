import { describe, it, expect } from 'vitest'
import { createUndoRedoStack } from '../../../composables/calcview/useCalcViewUndoRedo'
import type { Command } from '../../../composables/calcview/useCalcViewUndoRedo'

function mockCommand(tracker: string[]): Command {
  return {
    type: 'test',
    description: 'Test command',
    execute() { tracker.push('execute') },
    undo() { tracker.push('undo') }
  }
}

describe('useCalcViewUndoRedo', () => {
  describe('createUndoRedoStack', () => {
    it('starts empty with no undo/redo', () => {
      const stack = createUndoRedoStack()
      expect(stack.canUndo.value).toBe(false)
      expect(stack.canRedo.value).toBe(false)
      expect(stack.isDirty.value).toBe(false)
    })

    it('push executes command and enables undo', () => {
      const stack = createUndoRedoStack()
      const tracker: string[] = []
      stack.push(mockCommand(tracker))
      expect(tracker).toEqual(['execute'])
      expect(stack.canUndo.value).toBe(true)
      expect(stack.canRedo.value).toBe(false)
    })

    it('undo reverses command and enables redo', () => {
      const stack = createUndoRedoStack()
      const tracker: string[] = []
      stack.push(mockCommand(tracker))
      stack.undo()
      expect(tracker).toEqual(['execute', 'undo'])
      expect(stack.canUndo.value).toBe(false)
      expect(stack.canRedo.value).toBe(true)
    })

    it('redo re-executes undone command', () => {
      const stack = createUndoRedoStack()
      const tracker: string[] = []
      stack.push(mockCommand(tracker))
      stack.undo()
      stack.redo()
      expect(tracker).toEqual(['execute', 'undo', 'execute'])
      expect(stack.canUndo.value).toBe(true)
      expect(stack.canRedo.value).toBe(false)
    })

    it('push after undo discards redo history', () => {
      const stack = createUndoRedoStack()
      const tracker1: string[] = []
      const tracker2: string[] = []
      stack.push(mockCommand(tracker1))
      stack.undo()
      stack.push(mockCommand(tracker2))
      expect(stack.canRedo.value).toBe(false)
    })

    it('dirty state tracks pointer vs savedPointer', () => {
      const stack = createUndoRedoStack()
      const tracker: string[] = []
      expect(stack.isDirty.value).toBe(false)
      stack.push(mockCommand(tracker))
      expect(stack.isDirty.value).toBe(true)
      stack.markSaved()
      expect(stack.isDirty.value).toBe(false)
      stack.push(mockCommand(tracker))
      expect(stack.isDirty.value).toBe(true)
      stack.undo()
      expect(stack.isDirty.value).toBe(false)
    })
  })
})
