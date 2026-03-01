import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import NewTodoInput from './NewTodoInput.svelte'

describe('NewTodoInput', () => {
  it('renders button with Add item when collapsed', () => {
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    expect(screen.getByRole('button', { name: /add new todo/i })).toBeVisible()
    expect(screen.getByRole('button', { name: /add new todo/i })).toHaveTextContent('Add item...')
  })

  it('expands to input when Enter is pressed on button', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const button = screen.getByRole('button', { name: /add new todo/i })
    button.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByPlaceholderText('Add item...')).toBeVisible()
    expect(screen.queryByRole('button', { name: /add new todo/i })).not.toBeInTheDocument()
  })

  it('expands to input when Space is pressed on button', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const button = screen.getByRole('button', { name: /add new todo/i })
    button.focus()
    await user.keyboard(' ')

    expect(screen.getByPlaceholderText('Add item...')).toBeVisible()
  })

  it('calls onAdd when Enter is pressed with text', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const button = screen.getByRole('button', { name: /add new todo/i })
    button.focus()
    await user.keyboard('{Enter}')
    const input = screen.getByPlaceholderText('Add item...')
    await user.type(input, 'New task{Enter}')

    expect(onAdd).toHaveBeenCalledWith('New task')
  })

  it('clears input and collapses to button after adding', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const button = screen.getByRole('button', { name: /add new todo/i })
    button.focus()
    await user.keyboard('{Enter}')
    const input = screen.getByPlaceholderText('Add item...')
    await user.type(input, 'New task{Enter}')

    expect(screen.getByRole('button', { name: /add new todo/i })).toBeVisible()
    expect(screen.queryByPlaceholderText('Add item...')).not.toBeInTheDocument()
  })

  it('trims whitespace when adding', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const button = screen.getByRole('button', { name: /add new todo/i })
    button.focus()
    await user.keyboard('{Enter}')
    const input = screen.getByPlaceholderText('Add item...')
    await user.type(input, '  trimmed task  {Enter}')

    expect(onAdd).toHaveBeenCalledWith('trimmed task')
  })

  it('does not call onAdd when Enter is pressed with empty input', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const button = screen.getByRole('button', { name: /add new todo/i })
    button.focus()
    await user.keyboard('{Enter}')
    const input = screen.getByPlaceholderText('Add item...')
    await user.type(input, '{Enter}')

    expect(onAdd).not.toHaveBeenCalled()
  })

  it('does not call onAdd when Enter is pressed with only whitespace', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const button = screen.getByRole('button', { name: /add new todo/i })
    button.focus()
    await user.keyboard('{Enter}')
    const input = screen.getByPlaceholderText('Add item...')
    await user.type(input, '   {Enter}')

    expect(onAdd).not.toHaveBeenCalled()
  })

  it('collapses to button when Esc is pressed in input', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const button = screen.getByRole('button', { name: /add new todo/i })
    button.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByPlaceholderText('Add item...')).toBeVisible()

    await user.keyboard('{Escape}')

    expect(screen.getByRole('button', { name: /add new todo/i })).toBeVisible()
    expect(screen.queryByPlaceholderText('Add item...')).not.toBeInTheDocument()
  })

  it('returns focus to button after Esc', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const button = screen.getByRole('button', { name: /add new todo/i })
    button.focus()
    await user.keyboard('{Enter}')
    await user.keyboard('{Escape}')

    expect(screen.getByRole('button', { name: /add new todo/i })).toHaveFocus()
  })

  it('collapses and focuses button after adding a todo', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const button = screen.getByRole('button', { name: /add new todo/i })
    button.focus()
    await user.keyboard('{Enter}')
    const input = screen.getByPlaceholderText('Add item...')
    await user.type(input, 'New task{Enter}')

    expect(screen.getByRole('button', { name: /add new todo/i })).toHaveFocus()
  })

  it('expands when button is clicked', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const button = screen.getByRole('button', { name: /add new todo/i })
    await user.click(button)

    expect(screen.getByPlaceholderText('Add item...')).toBeVisible()
  })
})
