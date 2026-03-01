import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { act } from '@testing-library/svelte'
import TodoItem from './TodoItem.svelte'
import {
  enterMoveMode,
  exitMoveMode,
  getKeyboardMoveState,
} from '$lib/keyboard-move-state.svelte'

const createTodo = (overrides = {}) => ({
  id: 'todo-1',
  text: 'Test todo',
  completed: false,
  ...overrides,
})

describe('TodoItem', () => {
  it('renders todo text', () => {
    const todo = createTodo()
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
      },
    })

    expect(screen.getByText('Test todo')).toBeInTheDocument()
  })

  it('shows completed state with strikethrough', () => {
    const todo = createTodo({ completed: true })
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
      },
    })

    const text = screen.getByText('Test todo')
    expect(text).toHaveClass('line-through')
  })

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const todo = createTodo()
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle,
        onDelete: vi.fn(),
      },
    })

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const todo = createTodo()
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete,
      },
    })

    const deleteButton = screen.getByRole('button', { name: 'Delete todo' })
    await user.click(deleteButton)

    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('enters keyboard move mode when m is pressed with columnOrder', async () => {
    const user = userEvent.setup()
    const todo = createTodo()
    const columnOrder = ['2025-02-24', '2025-02-25']
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        columnOrder,
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move\./i,
    })
    todoOption.focus()
    await user.keyboard('m')

    expect(getKeyboardMoveState()).toEqual({
      todoId: todo.id,
      fromDate: '2025-02-24',
      targetDateKey: '2025-02-24',
      targetIndex: 0,
    })

    exitMoveMode()
  })

  it('does not enter move mode when m is pressed without columnOrder', async () => {
    const user = userEvent.setup()
    const todo = createTodo()
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        columnOrder: [],
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move\./i,
    })
    todoOption.focus()
    await user.keyboard('m')

    expect(getKeyboardMoveState()).toBeNull()
  })

  it('has aria-selected when in keyboard move mode', async () => {
    const todo = createTodo()
    const columnOrder = ['2025-02-24', '2025-02-25']
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        columnOrder,
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move\./i,
    })
    expect(todoOption).toHaveAttribute('aria-selected', 'false')

    enterMoveMode(todo.id, '2025-02-24', 0)
    await act()

    expect(todoOption).toHaveAttribute('aria-selected', 'true')

    exitMoveMode()
  })
})
