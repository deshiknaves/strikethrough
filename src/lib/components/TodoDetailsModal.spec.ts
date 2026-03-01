import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import TodoDetailsModal from './TodoDetailsModal.svelte'

const createTodo = (overrides = {}) => ({
  id: 'todo-1',
  text: 'Test todo',
  completed: false,
  date: '2025-02-24',
  createdAt: '2025-02-24T10:00:00.000Z',
  updatedAt: '2025-02-24T10:00:00.000Z',
  description: '',
  ...overrides,
})

describe('TodoDetailsModal', () => {
  it('renders with todo data when open', () => {
    const todo = createTodo({ text: 'My todo', description: 'Some details' })
    render(TodoDetailsModal, {
      props: {
        open: true,
        onClose: vi.fn(),
        todo,
        fromDate: '2025-02-24',
        onSave: vi.fn(),
      },
    })

    expect(screen.getByLabelText('Title')).toHaveValue('My todo')
    expect(screen.getByLabelText('Description')).toHaveValue('Some details')
    expect(screen.getByRole('dialog', { name: 'Todo details' })).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    const todo = createTodo()
    render(TodoDetailsModal, {
      props: {
        open: false,
        onClose: vi.fn(),
        todo,
        fromDate: '2025-02-24',
        onSave: vi.fn(),
      },
    })

    expect(screen.queryByRole('dialog', { name: 'Todo details' })).not.toBeInTheDocument()
  })

  it('calls onSave when Save button is clicked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const todo = createTodo({ text: 'Original' })
    render(TodoDetailsModal, {
      props: {
        open: true,
        onClose: vi.fn(),
        todo,
        fromDate: '2025-02-24',
        onSave,
      },
    })

    const titleInput = screen.getByLabelText('Title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated text')

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Updated text',
        description: '',
        date: '2025-02-24',
      })
    )
  })

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const todo = createTodo()
    render(TodoDetailsModal, {
      props: {
        open: true,
        onClose,
        todo,
        fromDate: '2025-02-24',
        onSave: vi.fn(),
      },
    })

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSave when Cmd+Enter is pressed', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const todo = createTodo({ text: 'Original' })
    render(TodoDetailsModal, {
      props: {
        open: true,
        onClose: vi.fn(),
        todo,
        fromDate: '2025-02-24',
        onSave,
      },
    })

    const titleInput = screen.getByLabelText('Title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated')
    await user.keyboard('{Meta>}{Enter}{/Meta}')

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Updated',
        date: '2025-02-24',
      })
    )
  })
})
