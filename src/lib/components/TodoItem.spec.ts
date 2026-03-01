import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { act } from '@testing-library/svelte'
import TodoItem from './TodoItem.svelte'
import { enterMoveMode, exitMoveMode, getKeyboardMoveState } from '$lib/keyboard-move-state.svelte'

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
        onUpdate: vi.fn(),
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
        onUpdate: vi.fn(),
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
        onUpdate: vi.fn(),
      },
    })

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('opens delete modal when delete button is clicked and calls onDelete when confirmed', async () => {
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
        onUpdate: vi.fn(),
      },
    })

    const deleteButton = screen.getByRole('button', { name: 'Delete todo' })
    await user.click(deleteButton)

    expect(screen.getByText('Delete this todo?')).toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()

    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    await user.click(confirmButton)

    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('does not call onDelete when delete modal is cancelled', async () => {
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
        onUpdate: vi.fn(),
      },
    })

    const deleteButton = screen.getByRole('button', { name: 'Delete todo' })
    await user.click(deleteButton)

    expect(screen.getByText('Delete this todo?')).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(onDelete).not.toHaveBeenCalled()
  })

  it('calls onToggle when Space is pressed on focused item', async () => {
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
        onUpdate: vi.fn(),
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
    })
    todoOption.focus()
    await user.keyboard(' ')

    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('opens delete modal when Delete key is pressed on focused item', async () => {
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
        onUpdate: vi.fn(),
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
    })
    todoOption.focus()
    await user.keyboard('{Delete}')

    expect(screen.getByText('Delete this todo?')).toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()

    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    await user.click(confirmButton)

    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('opens delete modal when x key is pressed on focused item', async () => {
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
        onUpdate: vi.fn(),
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
    })
    todoOption.focus()
    await user.keyboard('x')

    expect(screen.getByText('Delete this todo?')).toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('opens edit mode when e is pressed on focused item', async () => {
    const user = userEvent.setup()
    const todo = createTodo()
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        onUpdate: vi.fn(),
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
    })
    todoOption.focus()
    await user.keyboard('e')

    const editInput = screen.getByDisplayValue('Test todo')
    expect(editInput).toBeInTheDocument()
    expect(editInput).toHaveFocus()
  })

  it('calls onUpdate when edit is saved with Enter', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const todo = createTodo()
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        onUpdate,
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
    })
    todoOption.focus()
    await user.keyboard('e')

    const editInput = await waitFor(() => screen.getByDisplayValue('Test todo'))
    await waitFor(() => expect(editInput).toHaveFocus())

    fireEvent.input(editInput, { target: { value: 'Updated todo' } })
    fireEvent.keyDown(editInput, { key: 'Enter' })

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith('Updated todo')
  })

  it('cancels edit when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const todo = createTodo()
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        onUpdate,
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
    })
    todoOption.focus()
    await user.keyboard('e')

    const editInput = screen.getByDisplayValue('Test todo')
    await user.clear(editInput)
    await user.keyboard('Changed text')
    await user.keyboard('{Escape}')

    expect(onUpdate).not.toHaveBeenCalled()
    expect(screen.getByText('Test todo')).toBeInTheDocument()
  })

  it('has only the item as focusable (checkbox and delete button not in tab order)', async () => {
    const user = userEvent.setup()
    const todo = createTodo()
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        onUpdate: vi.fn(),
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
    })
    todoOption.focus()

    await user.tab()

    const activeElement = document.activeElement
    const checkbox = screen.getByRole('checkbox')
    const deleteButton = screen.getByRole('button', { name: 'Delete todo' })

    expect(activeElement).not.toBe(checkbox)
    expect(activeElement).not.toBe(deleteButton)
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
        onUpdate: vi.fn(),
        columnOrder,
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
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
        onUpdate: vi.fn(),
        columnOrder: [],
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
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
        onUpdate: vi.fn(),
        columnOrder,
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
    })
    expect(todoOption).toHaveAttribute('aria-selected', 'false')

    enterMoveMode(todo.id, '2025-02-24', 0)
    await act()

    expect(todoOption).toHaveAttribute('aria-selected', 'true')

    exitMoveMode()
  })

  it('shows moving todo content with blue border at drop target in keyboard move mode', () => {
    const existingTodo = createTodo({ id: 'todo-2', text: 'Existing item' })
    const movingTodo = createTodo({ id: 'todo-1', text: 'Moving item', completed: true })
    render(TodoItem, {
      props: {
        todo: existingTodo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        onUpdate: vi.fn(),
        dropEdge: 'top',
        movingTodo,
      },
    })

    expect(screen.getByText('Moving item')).toBeInTheDocument()
    const movingText = screen.getByText('Moving item')
    expect(movingText).toHaveClass('line-through')
    const placeholder = movingText.closest('div')
    expect(placeholder).toHaveClass('border-accent-blue')
  })

  it('hides original item when in keyboard move mode', async () => {
    const todo = createTodo({ text: 'Item being moved' })
    const columnOrder = ['2025-02-24', '2025-02-25']
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        onUpdate: vi.fn(),
        columnOrder,
      },
    })

    enterMoveMode(todo.id, '2025-02-24', 0)
    await act()

    const todoOption = screen.getByRole('option', {
      name: /Todo: Item being moved\. Press m to move/i,
    })
    expect(todoOption).toHaveClass('hidden')

    exitMoveMode()
  })
})
