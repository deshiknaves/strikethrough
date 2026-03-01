import { describe, expect, it } from 'vitest'
import {
  getKeyboardMoveState,
  enterMoveMode,
  updateTarget,
  exitMoveMode,
} from '$lib/keyboard-move-state.svelte'

describe('keyboard-move-state', () => {
  it('returns null when not in move mode', () => {
    expect(getKeyboardMoveState()).toBeNull()
  })

  it('enters move mode with initial target', () => {
    enterMoveMode('todo-1', '2025-02-24', 0)

    const state = getKeyboardMoveState()
    expect(state).toEqual({
      todoId: 'todo-1',
      fromDate: '2025-02-24',
      targetDateKey: '2025-02-24',
      targetIndex: 0,
    })

    exitMoveMode()
  })

  it('updates target date and index', () => {
    enterMoveMode('todo-1', '2025-02-24', 1)
    updateTarget('2025-02-25', 0)

    const state = getKeyboardMoveState()
    expect(state).toEqual({
      todoId: 'todo-1',
      fromDate: '2025-02-24',
      targetDateKey: '2025-02-25',
      targetIndex: 0,
    })

    exitMoveMode()
  })

  it('exits move mode', () => {
    enterMoveMode('todo-1', '2025-02-24', 0)
    exitMoveMode()

    expect(getKeyboardMoveState()).toBeNull()
  })
})
