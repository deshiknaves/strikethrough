import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import Page from './+page.svelte'
import { addTodo, getTodos, resetTodos } from '$lib/todos.svelte'
import { enterMoveMode, exitMoveMode, getKeyboardMoveState } from '$lib/keyboard-move-state.svelte'

function getColumnOrder(): string[] {
  const groups = document.querySelectorAll<HTMLElement>('[role="group"][data-date-key]')
  return Array.from(groups)
    .map((el) => el.getAttribute('data-date-key'))
    .filter((key): key is string => key !== null)
}

describe('/+page.svelte', () => {
  it('should render h1', () => {
    render(Page)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
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

    it('moves focus to new input when ArrowDown on last todo in column', async () => {
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

      const newInput = document.querySelector<HTMLInputElement>(
        `[data-date-key="${dateKey}"][data-todo-index="new"] input`
      )
      expect(newInput).toHaveFocus()
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
