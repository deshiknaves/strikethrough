import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import TodoDetailsModal from './TodoDetailsModal.svelte'

const createTodo = (overrides = {}) => ({
  id: 'todo-1',
  text: 'Test todo',
  completed: false,
  date: '2025-02-24',
  order: 0,
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
    expect(screen.getByLabelText('Date')).toHaveValue('2025-02-24')
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

    const saveButton = screen.getByRole('button', { name: /Save/ })
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

    const cancelButton = screen.getByRole('button', { name: /Cancel/ })
    await user.click(cancelButton)

    expect(onClose).toHaveBeenCalled()
  })

  it('saves with updated description', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const todo = createTodo({ text: 'Original', description: 'Initial' })
    render(TodoDetailsModal, {
      props: {
        open: true,
        onClose: vi.fn(),
        todo,
        fromDate: '2025-02-24',
        onSave,
      },
    })

    const descriptionInput = screen.getByLabelText('Description')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')

    const saveButton = screen.getByRole('button', { name: /Save/ })
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Original',
        description: 'Updated description',
        date: '2025-02-24',
      })
    )
  })

  it('saves with updated date', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const todo = createTodo({ date: '2025-02-24' })
    render(TodoDetailsModal, {
      props: {
        open: true,
        onClose: vi.fn(),
        todo,
        fromDate: '2025-02-24',
        onSave,
      },
    })

    const dateInput = screen.getByLabelText('Date')
    fireEvent.input(dateInput, { target: { value: '2025-03-15' } })

    const saveButton = screen.getByRole('button', { name: /Save/ })
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Test todo',
        description: '',
        date: '2025-03-15',
      })
    )
  })

  it('does not save when title is empty', async () => {
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

    const saveButton = screen.getByRole('button', { name: /Save/ })
    await user.click(saveButton)

    expect(onSave).not.toHaveBeenCalled()
  })

  it('trims title before save', async () => {
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
    await user.type(titleInput, '  spaced  ')

    const saveButton = screen.getByRole('button', { name: /Save/ })
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'spaced',
      })
    )
  })

  it('calls onClose when Escape is pressed without saving', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSave = vi.fn()
    const todo = createTodo()
    render(TodoDetailsModal, {
      props: {
        open: true,
        onClose,
        todo,
        fromDate: '2025-02-24',
        onSave,
      },
    })

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalled()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('shows shortcut symbols on buttons', () => {
    const todo = createTodo()
    render(TodoDetailsModal, {
      props: {
        open: true,
        onClose: vi.fn(),
        todo,
        fromDate: '2025-02-24',
        onSave: vi.fn(),
      },
    })

    const cancelButton = screen.getByRole('button', { name: /Cancel/ })
    const saveButton = screen.getByRole('button', { name: /Save/ })
    expect(cancelButton).toHaveTextContent('Esc')
    expect(saveButton).toHaveTextContent('⌘↵')
  })

  describe('create mode', () => {
    it('renders with empty fields and default date when open', () => {
      render(TodoDetailsModal, {
        props: {
          open: true,
          onClose: vi.fn(),
          defaultDate: '2025-02-24',
          onSave: vi.fn(),
        },
      })

      expect(screen.getByLabelText('Title')).toHaveValue('')
      expect(screen.getByLabelText('Description')).toHaveValue('')
      expect(screen.getByLabelText('Date')).toHaveValue('2025-02-24')
      expect(screen.getByRole('dialog', { name: 'New todo' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument()
    })

    it('calls onSave with text, description, and date when Add is clicked', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(TodoDetailsModal, {
        props: {
          open: true,
          onClose: vi.fn(),
          defaultDate: '2025-02-24',
          onSave,
        },
      })

      await user.type(screen.getByLabelText('Title'), 'New task')
      await user.type(screen.getByLabelText('Description'), 'Some details')

      const addButton = screen.getByRole('button', { name: /Add/ })
      await user.click(addButton)

      expect(onSave).toHaveBeenCalledWith({
        text: 'New task',
        description: 'Some details',
        date: '2025-02-24',
      })
    })

    it('does not save when title is empty in create mode', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(TodoDetailsModal, {
        props: {
          open: true,
          onClose: vi.fn(),
          defaultDate: '2025-02-24',
          onSave,
        },
      })

      await user.type(screen.getByLabelText('Description'), 'Description only')

      const addButton = screen.getByRole('button', { name: /Add/ })
      await user.click(addButton)

      expect(onSave).not.toHaveBeenCalled()
    })

    it('saves with Cmd+Enter in create mode', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(TodoDetailsModal, {
        props: {
          open: true,
          onClose: vi.fn(),
          defaultDate: '2025-02-24',
          onSave,
        },
      })

      await user.type(screen.getByLabelText('Title'), 'Quick add')

      const form = screen.getByRole('presentation')
      fireEvent.keyDown(form, { key: 'Enter', metaKey: true })

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Quick add',
          description: '',
          date: '2025-02-24',
        })
      )
    })
  })
})
