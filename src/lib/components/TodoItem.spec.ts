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
  date: '2025-02-24',
  createdAt: '2025-02-24T10:00:00.000Z',
  updatedAt: '2025-02-24T10:00:00.000Z',
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
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
        onUpdateDetails: vi.fn(),
        dropEdge: 'top',
        movingTodo,
      },
    })

    expect(screen.getByText('Moving item')).toBeInTheDocument()
    const movingText = screen.getByText('Moving item')
    expect(movingText).toHaveClass('line-through')
    const placeholder = movingText.closest('div')
    expect(placeholder).toHaveClass('ring-accent-blue')
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
        onUpdateDetails: vi.fn(),
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

  it('opens details modal when d is pressed on focused item', async () => {
    const user = userEvent.setup()
    const onUpdateDetails = vi.fn()
    const todo = createTodo()
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        onUpdate: vi.fn(),
        onUpdateDetails,
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
    })
    todoOption.focus()
    await user.keyboard('d')

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Title')).toHaveValue('Test todo')
  })

  it('opens details modal when Cmd+Enter is pressed on focused item', async () => {
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
        onUpdateDetails: vi.fn(),
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
    })
    todoOption.focus()
    await user.keyboard('{Meta>}{Enter}{/Meta}')

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('closes details modal on Escape without saving', async () => {
    const user = userEvent.setup()
    const onUpdateDetails = vi.fn()
    const todo = createTodo()
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        onUpdate: vi.fn(),
        onUpdateDetails,
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Test todo\. Press m to move/i,
    })
    todoOption.focus()
    await user.keyboard('d')

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(onUpdateDetails).not.toHaveBeenCalled()
  })

  it('calls onUpdateDetails when Cmd+Enter is pressed in details modal', async () => {
    const user = userEvent.setup()
    const onUpdateDetails = vi.fn()
    const todo = createTodo({ text: 'Original', description: 'Initial desc' })
    render(TodoItem, {
      props: {
        todo,
        fromDate: '2025-02-24',
        index: 0,
        onToggle: vi.fn(),
        onDelete: vi.fn(),
        onUpdate: vi.fn(),
        onUpdateDetails,
      },
    })

    const todoOption = screen.getByRole('option', {
      name: /Todo: Original\. Press m to move/i,
    })
    todoOption.focus()
    await user.keyboard('d')

    const titleInput = screen.getByLabelText('Title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated title')

    const descriptionInput = screen.getByLabelText('Description')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')

    await user.keyboard('{Meta>}{Enter}{/Meta}')

    expect(onUpdateDetails).toHaveBeenCalledWith({
      text: 'Updated title',
      description: 'Updated description',
      date: '2025-02-24',
    })
  })
})
