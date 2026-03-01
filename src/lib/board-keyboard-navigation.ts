import type { KeyboardMoveState } from '$lib/keyboard-move-state.svelte'

export const WEEKEND_START = 5

export function getWeekendColForWeekday(colIndex: number): number {
  return colIndex === 1 || colIndex >= 3 ? WEEKEND_START + 1 : WEEKEND_START
}

export function getWeekdayColForWeekend(colIndex: number): number {
  return colIndex === WEEKEND_START ? 0 : 4
}

export type BoardKeyboardOptions = {
  getColumnOrder: () => string[]
  getTodos: (dateKey: string) => { id: string }[]
  moveTodo: (fromDate: string, toDate: string, todoId: string, toIndex?: number) => void
  getKeyboardMoveState: () => KeyboardMoveState | null
  updateTarget: (dateKey: string, index: number) => void
  exitMoveMode: () => void
}

const NAV_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'j', 'k', 'h', 'l'] as const

function toVimKey(key: string): string {
  return key === 'j'
    ? 'ArrowDown'
    : key === 'k'
      ? 'ArrowUp'
      : key === 'h'
        ? 'ArrowLeft'
        : key === 'l'
          ? 'ArrowRight'
          : key
}

function focusCell(dateKey: string, index: number | 'new'): void {
  if (index === 'new') {
    const el = document.querySelector<HTMLElement>(
      `[data-date-key="${dateKey}"][data-todo-index="new"] input, [data-date-key="${dateKey}"][data-todo-index="new"] button`
    )
    el?.focus()
  } else {
    const el = document.querySelector<HTMLElement>(
      `[data-date-key="${dateKey}"][data-todo-index="${index}"]`
    )
    el?.focus()
  }
}

export function createBoardKeyboardHandler(
  options: BoardKeyboardOptions
): (event: KeyboardEvent) => void {
  const { getColumnOrder, getTodos, moveTodo, getKeyboardMoveState, updateTarget, exitMoveMode } =
    options

  return function handleKeydown(event: KeyboardEvent) {
    const mode = getKeyboardMoveState()
    const columnOrder = getColumnOrder()

    if (mode) {
      const keys = [...NAV_KEYS, 'Enter', ' ', 'Escape']
      if (!keys.includes(event.key as (typeof keys)[number])) return

      event.preventDefault()
      event.stopPropagation()

      if (event.key === 'Escape') {
        exitMoveMode()
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        moveTodo(mode.fromDate, mode.targetDateKey, mode.todoId, mode.targetIndex)
        exitMoveMode()
        return
      }

      const vimKey = toVimKey(event.key)
      const colIndex = columnOrder.indexOf(mode.targetDateKey)
      const maxIndex = getTodos(mode.targetDateKey).length

      if (vimKey === 'ArrowUp') {
        updateTarget(mode.targetDateKey, Math.max(0, mode.targetIndex - 1))
      } else if (vimKey === 'ArrowDown') {
        updateTarget(mode.targetDateKey, Math.min(maxIndex, mode.targetIndex + 1))
      } else if (vimKey === 'ArrowLeft' && colIndex > 0) {
        const prevCol = columnOrder[colIndex - 1]
        const prevMax = getTodos(prevCol).length
        updateTarget(prevCol, Math.min(mode.targetIndex, prevMax))
      } else if (vimKey === 'ArrowRight' && colIndex < columnOrder.length - 1) {
        const nextCol = columnOrder[colIndex + 1]
        const nextMax = getTodos(nextCol).length
        updateTarget(nextCol, Math.min(mode.targetIndex, nextMax))
      }
      return
    }

    const vimKey = toVimKey(event.key)

    if (!NAV_KEYS.includes(event.key as (typeof NAV_KEYS)[number])) return

    const active = document.activeElement as HTMLElement | null
    if (!active) return

    // Don't capture nav keys when user is typing in a text input
    if (
      active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      active.isContentEditable
    ) {
      return
    }

    const newInputWrapper =
      (active.tagName === 'INPUT' || active.tagName === 'BUTTON') &&
      active.closest<HTMLElement>('[data-todo-index="new"]')

    if (newInputWrapper) {
      const dateKey = newInputWrapper.getAttribute('data-date-key')
      if (dateKey) {
        const colIndex = columnOrder.indexOf(dateKey)
        const todos = getTodos(dateKey)
        const index = todos.length

        event.preventDefault()
        event.stopPropagation()

        if (vimKey === 'ArrowUp') {
          if (todos.length > 0) {
            focusCell(dateKey, todos.length - 1)
          } else if (colIndex >= WEEKEND_START) {
            const weekdayCol = getWeekdayColForWeekend(colIndex)
            const weekdayKey = columnOrder[weekdayCol]
            focusCell(weekdayKey, 'new')
          }
        } else if (vimKey === 'ArrowDown' && colIndex < WEEKEND_START) {
          const weekendCol = getWeekendColForWeekday(colIndex)
          const weekendKey = columnOrder[weekendCol]
          focusCell(weekendKey, 'new')
        } else if (vimKey === 'ArrowLeft' && colIndex > 0) {
          const prevCol = columnOrder[colIndex - 1]
          const prevTodos = getTodos(prevCol)
          const targetIndex =
            prevTodos.length > 0
              ? index < prevTodos.length
                ? index
                : prevTodos.length - 1
              : 'new'
          focusCell(prevCol, targetIndex)
        } else if (vimKey === 'ArrowRight' && colIndex < columnOrder.length - 1) {
          const nextCol = columnOrder[colIndex + 1]
          const nextTodos = getTodos(nextCol)
          const targetIndex =
            nextTodos.length > 0
              ? index < nextTodos.length
                ? index
                : nextTodos.length - 1
              : 'new'
          focusCell(nextCol, targetIndex)
        }
      }
      return
    }

    const dateKey = active.getAttribute('data-date-key')
    const indexAttr = active.getAttribute('data-todo-index')
    if (!dateKey || indexAttr === null || indexAttr === 'new') return

    const index = parseInt(indexAttr, 10)
    if (Number.isNaN(index)) return

    event.preventDefault()
    event.stopPropagation()

    const colIndex = columnOrder.indexOf(dateKey)
    const todos = getTodos(dateKey)

    if (vimKey === 'ArrowUp') {
      if (index > 0) {
        focusCell(dateKey, index - 1)
      } else if (colIndex >= WEEKEND_START) {
        const weekdayCol = getWeekdayColForWeekend(colIndex)
        const weekdayKey = columnOrder[weekdayCol]
        const weekdayTodos = getTodos(weekdayKey)
        focusCell(weekdayKey, weekdayTodos.length > 0 ? weekdayTodos.length - 1 : 'new')
      }
    } else if (vimKey === 'ArrowDown') {
      if (index + 1 < todos.length) {
        focusCell(dateKey, index + 1)
      } else {
        focusCell(dateKey, 'new')
      }
    } else if (vimKey === 'ArrowLeft' && colIndex > 0) {
      const prevCol = columnOrder[colIndex - 1]
      const prevTodos = getTodos(prevCol)
      const targetIndex =
        prevTodos.length > 0
          ? (index < prevTodos.length ? index : prevTodos.length - 1)
          : ('new' as const)
      focusCell(prevCol, targetIndex)
    } else if (vimKey === 'ArrowRight' && colIndex < columnOrder.length - 1) {
      const nextCol = columnOrder[colIndex + 1]
      const nextTodos = getTodos(nextCol)
      const targetIndex =
        nextTodos.length > 0
          ? (index < nextTodos.length ? index : nextTodos.length - 1)
          : ('new' as const)
      focusCell(nextCol, targetIndex)
    }
  }
}
