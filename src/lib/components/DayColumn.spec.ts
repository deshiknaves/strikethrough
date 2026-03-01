import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import DayColumn from './DayColumn.svelte'
import { addTodo, getTodos } from '$lib/todos.svelte'

function uniqueDate() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

describe('DayColumn', () => {
  it('renders label and sublabel', () => {
    const dateKey = uniqueDate()
    render(DayColumn, {
      props: {
        dateKey,
        label: '24 Feb',
        sublabel: 'Mon',
      },
    })

    expect(screen.getByText('24 Feb')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
  })

  it('renders NewTodoInput', () => {
    const dateKey = uniqueDate()
    render(DayColumn, {
      props: {
        dateKey,
        label: '24 Feb',
        sublabel: 'Mon',
      },
    })

    expect(screen.getByPlaceholderText('Add item...')).toBeInTheDocument()
  })

  it('adds todo when user types and presses Enter', async () => {
    const user = userEvent.setup()
    const dateKey = uniqueDate()
    render(DayColumn, {
      props: {
        dateKey,
        label: '24 Feb',
        sublabel: 'Mon',
      },
    })

    const input = screen.getByPlaceholderText('Add item...')
    await user.type(input, 'New column todo{Enter}')

    const todos = getTodos(dateKey)
    expect(todos).toHaveLength(1)
    expect(todos[0].text).toBe('New column todo')
  })

  it('displays todos from the store', async () => {
    const user = userEvent.setup()
    const dateKey = uniqueDate()
    addTodo(dateKey, 'Pre-existing todo')

    render(DayColumn, {
      props: {
        dateKey,
        label: '24 Feb',
        sublabel: 'Mon',
      },
    })

    expect(screen.getByText('Pre-existing todo')).toBeInTheDocument()
  })

  it('toggles todo when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const dateKey = uniqueDate()
    addTodo(dateKey, 'Toggle me')
    const [todo] = getTodos(dateKey)

    render(DayColumn, {
      props: {
        dateKey,
        label: '24 Feb',
        sublabel: 'Mon',
      },
    })

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(getTodos(dateKey)[0].completed).toBe(true)
  })

  it('deletes todo when delete button is clicked', async () => {
    const user = userEvent.setup()
    const dateKey = uniqueDate()
    addTodo(dateKey, 'Delete me')

    render(DayColumn, {
      props: {
        dateKey,
        label: '24 Feb',
        sublabel: 'Mon',
      },
    })

    const deleteButton = screen.getByRole('button', { name: 'Delete todo' })
    await user.click(deleteButton)

    expect(getTodos(dateKey)).toHaveLength(0)
  })
})
