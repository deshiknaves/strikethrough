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
  getTodos: (dateKey: string) => { id: string; completed: boolean }[]
  moveTodo: (fromDate: string, toDate: string, todoId: string, toIndex?: number) => void
  getKeyboardMoveState: () => KeyboardMoveState | null
  updateTarget: (dateKey: string, index: number) => void
  exitMoveMode: () => void
  onNextWeek?: () => void
  onPreviousWeek?: () => void
  onWeekView?: () => void
  onDayView?: () => void
  /** When provided, returns the dateKey to focus when starting navigation (today when viewing current week, else first column). */
  getInitialFocusDateKey?: () => string
  /** When provided, pressing 'n' opens the new todo modal. */
  onNewTodo?: () => void
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
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  } else {
    const el = document.querySelector<HTMLElement>(
      `[data-date-key="${dateKey}"][data-todo-index="${index}"]`
    )
    el?.focus()
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
}

function isActiveOnBoard(active: HTMLElement | null): boolean {
  if (!active) return false
  const inNewInput = active.closest<HTMLElement>('[data-date-key][data-todo-index="new"]')
  if (inNewInput) return true
  const dateKey = active.getAttribute('data-date-key')
  const indexAttr = active.getAttribute('data-todo-index')
  if (!dateKey || indexAttr === null || indexAttr === 'new') return false
  const index = parseInt(indexAttr, 10)
  return !Number.isNaN(index)
}

export function createBoardKeyboardHandler(
  options: BoardKeyboardOptions
): (event: KeyboardEvent) => void {
  const {
    getColumnOrder,
    getTodos,
    moveTodo,
    getKeyboardMoveState,
    updateTarget,
    exitMoveMode,
    onNextWeek,
    onPreviousWeek,
    onWeekView,
    onDayView,
    getInitialFocusDateKey,
    onNewTodo,
  } = options

  return function handleKeydown(event: KeyboardEvent) {
    const active = document.activeElement as HTMLElement | null
    const isTyping =
      active &&
      (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)

    if (!isTyping) {
      if (
        (event.key === 'n' || event.key === 'N') &&
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        onNewTodo &&
        !active?.closest('[role="dialog"]') &&
        !getKeyboardMoveState()
      ) {
        event.preventDefault()
        event.stopPropagation()
        onNewTodo()
        return
      }
      if (event.shiftKey && !getKeyboardMoveState() && !active?.closest('[role="dialog"]')) {
        if ((event.key === 'W' || event.key === 'w') && onWeekView) {
          event.preventDefault()
          event.stopPropagation()
          onWeekView()
          return
        }
        if ((event.key === 'D' || event.key === 'd') && onDayView) {
          event.preventDefault()
          event.stopPropagation()
          onDayView()
          return
        }
      }
      if (event.shiftKey) {
        if ((event.key === 'N' || event.key === 'n') && onNextWeek) {
          event.preventDefault()
          event.stopPropagation()
          onNextWeek()
          return
        }
        if ((event.key === 'P' || event.key === 'p') && onPreviousWeek) {
          event.preventDefault()
          event.stopPropagation()
          onPreviousWeek()
          return
        }
      }
      if (event.ctrlKey || event.metaKey) {
        if (
          (event.key === 'n' || event.key === 'N' || event.key === 'l' || event.key === 'L') &&
          onNextWeek
        ) {
          event.preventDefault()
          event.stopPropagation()
          onNextWeek()
          return
        }
        if (
          (event.key === 'p' || event.key === 'P' || event.key === 'h' || event.key === 'H') &&
          onPreviousWeek
        ) {
          event.preventDefault()
          event.stopPropagation()
          onPreviousWeek()
          return
        }
      }
    }

    const mode = getKeyboardMoveState()
    const columnOrder = getColumnOrder()

    if (mode) {
      const keys = [...NAV_KEYS, 'Enter', ' ', 'Escape']
      if (!keys.includes(event.key as (typeof keys)[number])) return

      event.preventDefault()
      event.stopPropagation()

      if (event.key === 'Escape') {
        const { fromDate, todoId } = mode
        exitMoveMode()
        const todos = getTodos(fromDate)
        const index = todos.findIndex((t) => t.id === todoId)
        if (index >= 0) {
          requestAnimationFrame(() => focusCell(fromDate, index))
        }
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        const { targetDateKey, targetIndex } = mode
        moveTodo(mode.fromDate, targetDateKey, mode.todoId, targetIndex)
        exitMoveMode()
        requestAnimationFrame(() => {
          focusCell(targetDateKey, targetIndex)
        })
        return
      }

      const vimKey = toVimKey(event.key)
      const colIndex = columnOrder.indexOf(mode.targetDateKey)
      const maxIndex = getTodos(mode.targetDateKey).length

      function scrollKeyboardMoveTargetIntoView() {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document
              .querySelector<HTMLElement>('[data-keyboard-move-target]')
              ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          })
        })
      }

      if (vimKey === 'ArrowUp') {
        updateTarget(mode.targetDateKey, Math.max(0, mode.targetIndex - 1))
        scrollKeyboardMoveTargetIntoView()
      } else if (vimKey === 'ArrowDown') {
        updateTarget(mode.targetDateKey, Math.min(maxIndex, mode.targetIndex + 1))
        scrollKeyboardMoveTargetIntoView()
      } else if (vimKey === 'ArrowLeft' && colIndex > 0) {
        const prevCol = columnOrder[colIndex - 1]
        const prevMax = getTodos(prevCol).length
        updateTarget(prevCol, Math.min(mode.targetIndex, prevMax))
        scrollKeyboardMoveTargetIntoView()
      } else if (vimKey === 'ArrowRight' && colIndex < columnOrder.length - 1) {
        const nextCol = columnOrder[colIndex + 1]
        const nextMax = getTodos(nextCol).length
        updateTarget(nextCol, Math.min(mode.targetIndex, nextMax))
        scrollKeyboardMoveTargetIntoView()
      }
      return
    }

    const vimKey = toVimKey(event.key)

    if (!NAV_KEYS.includes(event.key as (typeof NAV_KEYS)[number])) return

    // Don't capture nav keys when user is typing in a text input
    if (
      active?.tagName === 'INPUT' ||
      active?.tagName === 'TEXTAREA' ||
      active?.isContentEditable
    ) {
      return
    }

    // When nothing on board is focused, focus initial cell (today or first column)
    if (!active || !isActiveOnBoard(active)) {
      if (!active?.closest('[role="dialog"]') && getInitialFocusDateKey) {
        const targetDateKey = getInitialFocusDateKey()
        if (columnOrder.includes(targetDateKey)) {
          const todos = getTodos(targetDateKey)
          event.preventDefault()
          event.stopPropagation()
          focusCell(targetDateKey, todos.length > 0 ? 0 : 'new')
        }
      }
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

        const activeCount = todos.filter((t) => !t.completed).length
        if (vimKey === 'ArrowUp') {
          if (activeCount > 0) {
            focusCell(dateKey, activeCount - 1)
          } else if (colIndex >= WEEKEND_START) {
            const weekdayCol = getWeekdayColForWeekend(colIndex)
            const weekdayKey = columnOrder[weekdayCol]
            focusCell(weekdayKey, 'new')
          }
        } else if (vimKey === 'ArrowDown') {
          if (todos.length > activeCount) {
            focusCell(dateKey, activeCount)
          } else if (colIndex < WEEKEND_START) {
            const weekendCol = getWeekendColForWeekday(colIndex)
            const weekendKey = columnOrder[weekendCol]
            focusCell(weekendKey, 'new')
          }
        } else if (vimKey === 'ArrowLeft' && colIndex > 0) {
          const prevCol = columnOrder[colIndex - 1]
          const prevTodos = getTodos(prevCol)
          const targetIndex =
            prevTodos.length > 0 ? (index < prevTodos.length ? index : prevTodos.length - 1) : 'new'
          focusCell(prevCol, targetIndex)
        } else if (vimKey === 'ArrowRight' && colIndex < columnOrder.length - 1) {
          const nextCol = columnOrder[colIndex + 1]
          const nextTodos = getTodos(nextCol)
          const targetIndex =
            nextTodos.length > 0 ? (index < nextTodos.length ? index : nextTodos.length - 1) : 'new'
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

    const activeCount = todos.filter((t) => !t.completed).length
    if (vimKey === 'ArrowUp') {
      if (index === activeCount && activeCount < todos.length) {
        focusCell(dateKey, 'new')
      } else if (index > 0) {
        focusCell(dateKey, index - 1)
      } else if (colIndex >= WEEKEND_START) {
        const weekdayCol = getWeekdayColForWeekend(colIndex)
        const weekdayKey = columnOrder[weekdayCol]
        const weekdayTodos = getTodos(weekdayKey)
        const weekdayActiveCount = weekdayTodos.filter((t) => !t.completed).length
        focusCell(weekdayKey, weekdayActiveCount > 0 ? weekdayActiveCount - 1 : 'new')
      }
    } else if (vimKey === 'ArrowDown') {
      if (index === activeCount - 1) {
        focusCell(dateKey, 'new')
      } else if (index + 1 < todos.length) {
        focusCell(dateKey, index + 1)
      } else {
        focusCell(dateKey, 'new')
      }
    } else if (vimKey === 'ArrowLeft' && colIndex > 0) {
      const prevCol = columnOrder[colIndex - 1]
      const prevTodos = getTodos(prevCol)
      const targetIndex =
        prevTodos.length > 0
          ? index < prevTodos.length
            ? index
            : prevTodos.length - 1
          : ('new' as const)
      focusCell(prevCol, targetIndex)
    } else if (vimKey === 'ArrowRight' && colIndex < columnOrder.length - 1) {
      const nextCol = columnOrder[colIndex + 1]
      const nextTodos = getTodos(nextCol)
      const targetIndex =
        nextTodos.length > 0
          ? index < nextTodos.length
            ? index
            : nextTodos.length - 1
          : ('new' as const)
      focusCell(nextCol, targetIndex)
    }
  }
}

export type FocusFirstCellOptions = {
  getColumnOrder: () => string[]
  getTodos: (dateKey: string) => { id: string; completed: boolean }[]
  getInitialFocusDateKey?: () => string
}

export function focusFirstCell(options: FocusFirstCellOptions): void {
  const { getColumnOrder, getTodos, getInitialFocusDateKey } = options
  const columnOrder = getColumnOrder()
  const targetDateKey = getInitialFocusDateKey?.() ?? columnOrder[0]
  if (columnOrder.includes(targetDateKey)) {
    const todos = getTodos(targetDateKey)
    focusCell(targetDateKey, todos.length > 0 ? 0 : 'new')
  }
}
