import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import userEvent from '@testing-library/user-event'
import { Temporal } from 'temporal-polyfill'
import Page from './+page.svelte'
import { addTodo, getTodos, resetTodos } from '$lib/todos.svelte'
import { exitMoveMode, getKeyboardMoveState } from '$lib/keyboard-move-state.svelte'
import { VIEW_MODE_STORAGE_KEY } from '$lib/components/ViewPicker.svelte'

vi.mock('$app/environment', () => ({ browser: true }))

function getColumnOrder(): string[] {
  const groups = document.querySelectorAll<HTMLElement>('[role="group"][data-date-key]')
  return Array.from(groups)
    .map((el) => el.getAttribute('data-date-key'))
    .filter((key): key is string => key !== null)
}

function createLocalStorageMock() {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k])
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length
    },
  }
}

describe('/+page.svelte', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should render h1', () => {
    render(Page)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  describe('view mode persistence', () => {
    it('defaults to week view', () => {
      render(Page)

      expect(screen.getByRole('button', { name: 'Week' })).toHaveAttribute('data-state', 'active')
      expect(screen.getByRole('button', { name: 'Day' })).toHaveAttribute('data-state', 'inactive')
    })

    it('restores day view from localStorage', () => {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'day')
      render(Page)

      expect(screen.getByRole('button', { name: 'Day' })).toHaveAttribute('data-state', 'active')
      expect(screen.getByRole('button', { name: 'Week' })).toHaveAttribute('data-state', 'inactive')
    })

    it('saves view to localStorage when changed', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      await user.click(screen.getByRole('button', { name: 'Day' }))
      flushSync()

      expect(localStorage.getItem(VIEW_MODE_STORAGE_KEY)).toBe('day')
    })
  })

  describe('week navigation', () => {
    it('renders previous and next week buttons', () => {
      render(Page)

      expect(screen.getByRole('button', { name: 'Previous week' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Next week' })).toBeInTheDocument()
    })

    it('navigates to next week when Next week button is clicked', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      const initialOrder = getColumnOrder()
      const initialMonday = Temporal.PlainDate.from(initialOrder[0])

      await user.click(screen.getByRole('button', { name: 'Next week' }))
      await act()

      const newOrder = getColumnOrder()
      const newMonday = Temporal.PlainDate.from(newOrder[0])
      expect(newMonday.until(initialMonday).days).toBe(-7)
    })

    it('navigates to previous week when Previous week button is clicked', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      const initialOrder = getColumnOrder()
      const initialMonday = Temporal.PlainDate.from(initialOrder[0])

      await user.click(screen.getByRole('button', { name: 'Previous week' }))
      await act()

      const newOrder = getColumnOrder()
      const newMonday = Temporal.PlainDate.from(newOrder[0])
      expect(initialMonday.until(newMonday).days).toBe(-7)
    })

    it('returns to initial week when navigating next then previous', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      const initialOrder = getColumnOrder()

      await user.click(screen.getByRole('button', { name: 'Next week' }))
      await act()

      await user.click(screen.getByRole('button', { name: 'Previous week' }))
      await act()

      const orderAfterRoundTrip = getColumnOrder()
      expect(orderAfterRoundTrip).toEqual(initialOrder)
    })

    it('navigates to next week when Shift+N is pressed', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      const initialOrder = getColumnOrder()
      const initialMonday = Temporal.PlainDate.from(initialOrder[0])

      await user.click(screen.getByRole('heading', { level: 1 }))
      await user.keyboard('{Shift>}n{/Shift}')
      await act()

      const newOrder = getColumnOrder()
      const newMonday = Temporal.PlainDate.from(newOrder[0])
      expect(newMonday.until(initialMonday).days).toBe(-7)
    })

    it('navigates to previous week when Shift+P is pressed', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      const initialOrder = getColumnOrder()
      const initialMonday = Temporal.PlainDate.from(initialOrder[0])

      await user.click(screen.getByRole('heading', { level: 1 }))
      await user.keyboard('{Shift>}p{/Shift}')
      await act()

      const newOrder = getColumnOrder()
      const newMonday = Temporal.PlainDate.from(newOrder[0])
      expect(initialMonday.until(newMonday).days).toBe(-7)
    })

    it('does not navigate when N is pressed without Shift', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      const initialOrder = getColumnOrder()

      await user.keyboard('n')
      await act()

      const orderAfterN = getColumnOrder()
      expect(orderAfterN).toEqual(initialOrder)
    })

    it('navigates to next week when Ctrl+L is pressed', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      const initialOrder = getColumnOrder()
      const initialMonday = Temporal.PlainDate.from(initialOrder[0])

      await user.click(screen.getByRole('heading', { level: 1 }))
      await user.keyboard('{Control>}l{/Control}')
      await act()

      const newOrder = getColumnOrder()
      const newMonday = Temporal.PlainDate.from(newOrder[0])
      expect(newMonday.until(initialMonday).days).toBe(-7)
    })

    it('navigates to next week when Ctrl+N is pressed', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      const initialOrder = getColumnOrder()
      const initialMonday = Temporal.PlainDate.from(initialOrder[0])

      await user.click(screen.getByRole('heading', { level: 1 }))
      await user.keyboard('{Control>}n{/Control}')
      await act()

      const newOrder = getColumnOrder()
      const newMonday = Temporal.PlainDate.from(newOrder[0])
      expect(newMonday.until(initialMonday).days).toBe(-7)
    })

    it('navigates to previous week when Ctrl+P is pressed', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      const initialOrder = getColumnOrder()
      const initialMonday = Temporal.PlainDate.from(initialOrder[0])

      await user.click(screen.getByRole('heading', { level: 1 }))
      await user.keyboard('{Control>}p{/Control}')
      await act()

      const newOrder = getColumnOrder()
      const newMonday = Temporal.PlainDate.from(newOrder[0])
      expect(initialMonday.until(newMonday).days).toBe(-7)
    })

    it('navigates to previous week when Ctrl+H is pressed', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      const initialOrder = getColumnOrder()
      const initialMonday = Temporal.PlainDate.from(initialOrder[0])

      await user.click(screen.getByRole('heading', { level: 1 }))
      await user.keyboard('{Control>}h{/Control}')
      await act()

      const newOrder = getColumnOrder()
      const newMonday = Temporal.PlainDate.from(newOrder[0])
      expect(initialMonday.until(newMonday).days).toBe(-7)
    })

    it('focuses first element when navigating to a week that is not the current week', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      await user.click(screen.getByRole('button', { name: 'Next week' }))
      await act()

      const columnOrder = getColumnOrder()
      const firstColumnKey = columnOrder[0]
      const firstCell = document.querySelector<HTMLElement>(
        `[data-date-key="${firstColumnKey}"][data-todo-index="0"], [data-date-key="${firstColumnKey}"][data-todo-index="new"] input, [data-date-key="${firstColumnKey}"][data-todo-index="new"] button`
      )
      expect(firstCell).toHaveFocus()
    })
  })

  describe('view switching shortcuts', () => {
    beforeEach(() => {
      resetTodos()
    })

    afterEach(() => {
      exitMoveMode()
    })

    it('switches to day view when Shift+D is pressed', async () => {
      const user = userEvent.setup()
      render(Page)
      await act()

      await user.click(screen.getByRole('heading', { level: 1 }))
      await user.keyboard('{Shift>}d{/Shift}')
      await act()

      expect(screen.getByRole('button', { name: 'Day' })).toHaveAttribute('data-state', 'active')
      expect(screen.getByRole('button', { name: 'Week' })).toHaveAttribute('data-state', 'inactive')
    })

    it('switches to week view when Shift+W is pressed', async () => {
      const user = userEvent.setup()
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'day')
      render(Page)
      await act()

      await user.click(screen.getByRole('heading', { level: 1 }))
      await user.keyboard('{Shift>}w{/Shift}')
      await act()

      expect(screen.getByRole('button', { name: 'Week' })).toHaveAttribute('data-state', 'active')
      expect(screen.getByRole('button', { name: 'Day' })).toHaveAttribute('data-state', 'inactive')
    })

    it('does not switch view when Shift+D is pressed in move mode', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      addTodo(columnOrder[0], 'Todo 1')
      await act()

      const todo = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo.focus()
      await user.keyboard('m')

      expect(getKeyboardMoveState()).not.toBeNull()

      await user.keyboard('{Shift>}d{/Shift}')
      await act()

      expect(screen.getByRole('button', { name: 'Week' })).toHaveClass('text-white')
      expect(getKeyboardMoveState()).not.toBeNull()

      exitMoveMode()
    })

    it('switches to day view when Shift+D is pressed on a focused todo (not opens details)', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      addTodo(columnOrder[0], 'Todo 1')
      await act()

      const todo = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo.focus()
      await user.keyboard('{Shift>}d{/Shift}')
      await act()

      expect(screen.getByRole('button', { name: 'Day' })).toHaveClass('text-white')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('board keyboard navigation', () => {
    beforeEach(() => {
      resetTodos()
    })

    afterEach(() => {
      exitMoveMode()
    })

    it('moves focus down with ArrowDown', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      addTodo(dateKey, 'Todo 1')
      addTodo(dateKey, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      const todo2 = screen.getByRole('option', { name: /Todo: Todo 2/ })
      todo1.focus()

      await user.keyboard('{ArrowDown}')

      expect(todo2).toHaveFocus()
    })

    it('scrolls focused item into view when navigating with ArrowDown', async () => {
      const scrollIntoViewSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {})
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      addTodo(dateKey, 'Todo 1')
      addTodo(dateKey, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      const todo2 = screen.getByRole('option', { name: /Todo: Todo 2/ })
      todo1.focus()

      await user.keyboard('{ArrowDown}')

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' })
      expect(scrollIntoViewSpy.mock.instances[0]).toBe(todo2)

      scrollIntoViewSpy.mockRestore()
    })

    it('moves focus to new slot when ArrowDown on last todo in column', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      addTodo(dateKey, 'Todo 1')
      addTodo(dateKey, 'Todo 2')
      await act()

      const todo2 = screen.getByRole('option', { name: /Todo: Todo 2/ })
      todo2.focus()

      await user.keyboard('{ArrowDown}')

      const newSlot = document.querySelector<HTMLElement>(
        `[data-date-key="${dateKey}"][data-todo-index="new"] input, [data-date-key="${dateKey}"][data-todo-index="new"] button`
      )
      expect(newSlot).toHaveFocus()
    })

    it('moves focus left/right when on new slot button (vim navigation)', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      addTodo(columnOrder[0], 'Todo 1')
      addTodo(columnOrder[1], 'Todo 2')
      await act()

      const todo2 = screen.getByRole('option', { name: /Todo: Todo 2/ })
      todo2.focus()
      await user.keyboard('{ArrowDown}')

      const newSlot1 = document.querySelector<HTMLElement>(
        `[data-date-key="${columnOrder[1]}"][data-todo-index="new"] input, [data-date-key="${columnOrder[1]}"][data-todo-index="new"] button`
      )
      expect(newSlot1).toHaveFocus()

      await user.keyboard('h')

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      expect(todo1).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      const newSlot0 = document.querySelector<HTMLElement>(
        `[data-date-key="${columnOrder[0]}"][data-todo-index="new"] input, [data-date-key="${columnOrder[0]}"][data-todo-index="new"] button`
      )
      expect(newSlot0).toHaveFocus()

      await user.keyboard('l')

      expect(todo2).toHaveFocus()
    })

    it('moves focus up with ArrowUp', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      addTodo(dateKey, 'Todo 1')
      addTodo(dateKey, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      const todo2 = screen.getByRole('option', { name: /Todo: Todo 2/ })
      todo2.focus()

      await user.keyboard('{ArrowUp}')

      expect(todo1).toHaveFocus()
    })

    it('moves focus right with ArrowRight', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      addTodo(columnOrder[0], 'Todo 1')
      addTodo(columnOrder[1], 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      const todo2 = screen.getByRole('option', { name: /Todo: Todo 2/ })
      todo1.focus()

      await user.keyboard('{ArrowRight}')

      expect(todo2).toHaveFocus()
    })

    it('moves focus left with ArrowLeft', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      addTodo(columnOrder[0], 'Todo 1')
      addTodo(columnOrder[1], 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      const todo2 = screen.getByRole('option', { name: /Todo: Todo 2/ })
      todo2.focus()

      await user.keyboard('{ArrowLeft}')

      expect(todo1).toHaveFocus()
    })

    it('moves focus down with j (vim binding)', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      addTodo(dateKey, 'Todo 1')
      addTodo(dateKey, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      const todo2 = screen.getByRole('option', { name: /Todo: Todo 2/ })
      todo1.focus()

      await user.keyboard('j')

      expect(todo2).toHaveFocus()
    })

    it('moves focus up with k (vim binding)', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      addTodo(dateKey, 'Todo 1')
      addTodo(dateKey, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      const todo2 = screen.getByRole('option', { name: /Todo: Todo 2/ })
      todo2.focus()

      await user.keyboard('k')

      expect(todo1).toHaveFocus()
    })

    it('moves focus left with h (vim binding)', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      addTodo(columnOrder[0], 'Todo 1')
      addTodo(columnOrder[1], 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      const todo2 = screen.getByRole('option', { name: /Todo: Todo 2/ })
      todo2.focus()

      await user.keyboard('h')

      expect(todo1).toHaveFocus()
    })

    it('moves focus right with l (vim binding)', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      addTodo(columnOrder[0], 'Todo 1')
      addTodo(columnOrder[1], 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      const todo2 = screen.getByRole('option', { name: /Todo: Todo 2/ })
      todo1.focus()

      await user.keyboard('l')

      expect(todo2).toHaveFocus()
    })

    it('moves focus right to empty column with l (vim binding)', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      addTodo(columnOrder[0], 'Todo 1')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo1.focus()

      await user.keyboard('l')

      const addButtonCol1 = document.querySelector<HTMLElement>(
        `[data-date-key="${columnOrder[1]}"][data-todo-index="new"] input, [data-date-key="${columnOrder[1]}"][data-todo-index="new"] button`
      )
      expect(addButtonCol1).toHaveFocus()
    })

    it('moves focus left to empty column with h (vim binding)', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      addTodo(columnOrder[1], 'Todo 1')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo1.focus()

      await user.keyboard('h')

      const addButtonCol0 = document.querySelector<HTMLElement>(
        `[data-date-key="${columnOrder[0]}"][data-todo-index="new"] input, [data-date-key="${columnOrder[0]}"][data-todo-index="new"] button`
      )
      expect(addButtonCol0).toHaveFocus()
    })

    it('moves focus between empty columns when on add button', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      await act()

      const addButtonCol0 = document.querySelector<HTMLElement>(
        `[data-date-key="${columnOrder[0]}"][data-todo-index="new"] button`
      )
      addButtonCol0?.focus()

      await user.keyboard('l')

      const addButtonCol1 = document.querySelector<HTMLElement>(
        `[data-date-key="${columnOrder[1]}"][data-todo-index="new"] input, [data-date-key="${columnOrder[1]}"][data-todo-index="new"] button`
      )
      expect(addButtonCol1).toHaveFocus()
    })

    it('focuses initial cell when nothing on board is focused and nav key is pressed', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      addTodo(columnOrder[0], 'Todo 1')
      await act()

      const heading = screen.getByRole('heading', { level: 1 })
      heading.focus()

      await user.keyboard('{ArrowDown}')

      const focusedEl = document.activeElement as HTMLElement
      expect(focusedEl.closest('[data-date-key][data-todo-index]')).toBeInTheDocument()
    })

    it('does not capture vim keys when add-todo input is focused', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      await act()

      const addButton = document.querySelector<HTMLElement>(
        `[data-date-key="${dateKey}"][data-todo-index="new"] button`
      )
      addButton?.focus()
      await user.keyboard('{Enter}')

      const input = screen.getByPlaceholderText('Add item...')
      input.focus()
      await user.keyboard('hjkl')

      expect(input).toHaveValue('hjkl')
      expect(input).toHaveFocus()
    })

    it('does not capture vim keys when todo edit input is focused', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      addTodo(dateKey, 'Todo 1')
      await act()

      const todo = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo.focus()
      await user.keyboard('e')

      const editInput = await waitFor(() => screen.getByDisplayValue('Todo 1'))
      await waitFor(() => expect(editInput).toHaveFocus())
      await user.keyboard('j')

      expect(editInput).toHaveValue('Todo 1j')
      expect(editInput).toHaveFocus()
    })

    it('exits move mode when Escape is pressed', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      addTodo(dateKey, 'Todo 1')
      await act()

      const todo = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo.focus()
      await user.keyboard('m')

      expect(getKeyboardMoveState()).not.toBeNull()

      await user.keyboard('{Escape}')

      expect(getKeyboardMoveState()).toBeNull()
    })

    it('focuses original item when Escape is pressed in move mode without moving', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      addTodo(dateKey, 'Todo 1')
      await act()

      const todo = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo.focus()
      await user.keyboard('m')
      await user.keyboard('{Escape}')
      await act()

      expect(getKeyboardMoveState()).toBeNull()
      expect(todo).toHaveFocus()
    })

    it('focuses original item when Escape is pressed in move mode after moving target', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      addTodo(dateKey, 'Todo 1')
      addTodo(dateKey, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo1.focus()
      await user.keyboard('m')
      await user.keyboard('{ArrowDown}')

      expect(getKeyboardMoveState()).not.toBeNull()

      await user.keyboard('{Escape}')
      await act()

      expect(getKeyboardMoveState()).toBeNull()
      expect(todo1).toHaveFocus()
    })

    it('moves todo and exits move mode when Enter is pressed', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const fromDate = columnOrder[0]
      const toDate = columnOrder[1]
      addTodo(fromDate, 'Todo 1')
      addTodo(toDate, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo1.focus()
      await user.keyboard('m')

      expect(getKeyboardMoveState()).not.toBeNull()

      await user.keyboard('{ArrowRight}')
      await user.keyboard('{Enter}')

      expect(getKeyboardMoveState()).toBeNull()
      expect(getTodos(fromDate)).toHaveLength(0)
      expect(getTodos(toDate)).toHaveLength(2)
    })

    it('moves todo and exits move mode when Space is pressed', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const fromDate = columnOrder[0]
      const toDate = columnOrder[1]
      addTodo(fromDate, 'Todo 1')
      addTodo(toDate, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo1.focus()
      await user.keyboard('m')

      await user.keyboard('{ArrowRight}')
      await user.keyboard(' ')

      expect(getKeyboardMoveState()).toBeNull()
      expect(getTodos(fromDate)).toHaveLength(0)
      expect(getTodos(toDate)).toHaveLength(2)
    })

    it('focuses moved item after placing with Enter', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const fromDate = columnOrder[0]
      const toDate = columnOrder[1]
      addTodo(fromDate, 'Todo 1')
      addTodo(toDate, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo1.focus()
      await user.keyboard('m')
      await user.keyboard('{ArrowRight}')
      await user.keyboard('{Enter}')

      await act()

      const movedTodo = screen.getByRole('option', { name: /Todo: Todo 1/ })
      expect(movedTodo).toHaveFocus()
    })

    it('focuses moved item after placing with Space', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const fromDate = columnOrder[0]
      const toDate = columnOrder[1]
      addTodo(fromDate, 'Todo 1')
      addTodo(toDate, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo1.focus()
      await user.keyboard('m')
      await user.keyboard('{ArrowRight}')
      await user.keyboard(' ')

      await act()

      const movedTodo = screen.getByRole('option', { name: /Todo: Todo 1/ })
      expect(movedTodo).toHaveFocus()
    })

    it('updates drop target when ArrowDown is pressed in move mode', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      addTodo(dateKey, 'Todo 1')
      addTodo(dateKey, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo1.focus()
      await user.keyboard('m')

      let state = getKeyboardMoveState()
      expect(state?.targetIndex).toBe(0)

      await user.keyboard('{ArrowDown}')

      state = getKeyboardMoveState()
      expect(state?.targetIndex).toBe(1)

      exitMoveMode()
    })

    it('scrolls keyboard-move target into view when ArrowDown is pressed in move mode', async () => {
      const scrollIntoViewSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {})
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const dateKey = columnOrder[0]
      addTodo(dateKey, 'Todo 1')
      addTodo(dateKey, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo1.focus()
      await user.keyboard('m')

      scrollIntoViewSpy.mockClear()
      await user.keyboard('{ArrowDown}')

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve())
        })
      })

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' })
      const targetEl = document.querySelector('[data-keyboard-move-target]')
      expect(targetEl).toBeInTheDocument()
      expect(scrollIntoViewSpy.mock.instances[0]).toBe(targetEl)

      scrollIntoViewSpy.mockRestore()
      exitMoveMode()
    })

    it('updates drop target when ArrowRight is pressed in move mode', async () => {
      const user = userEvent.setup()
      render(Page)

      const columnOrder = getColumnOrder()
      const fromDate = columnOrder[0]
      const toDate = columnOrder[1]
      addTodo(fromDate, 'Todo 1')
      addTodo(toDate, 'Todo 2')
      await act()

      const todo1 = screen.getByRole('option', { name: /Todo: Todo 1/ })
      todo1.focus()
      await user.keyboard('m')

      let state = getKeyboardMoveState()
      expect(state?.targetDateKey).toBe(fromDate)

      await user.keyboard('{ArrowRight}')

      state = getKeyboardMoveState()
      expect(state?.targetDateKey).toBe(toDate)

      exitMoveMode()
    })
  })
})
