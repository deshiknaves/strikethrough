import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import NewTodoInput from './NewTodoInput.svelte'

describe('NewTodoInput', () => {
  it('renders with placeholder', () => {
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    expect(screen.getByPlaceholderText('Add item...')).toBeVisible()
  })

  it('calls onAdd when Enter is pressed with text', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const input = screen.getByPlaceholderText('Add item...')
    await user.type(input, 'New task{Enter}')

    expect(onAdd).toHaveBeenCalledWith('New task')
  })

  it('clears input after adding', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const input = screen.getByPlaceholderText('Add item...')
    await user.type(input, 'New task{Enter}')

    expect(input).toHaveValue('')
  })

  it('trims whitespace when adding', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const input = screen.getByPlaceholderText('Add item...')
    await user.type(input, '  trimmed task  {Enter}')

    expect(onAdd).toHaveBeenCalledWith('trimmed task')
  })

  it('does not call onAdd when Enter is pressed with empty input', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const input = screen.getByPlaceholderText('Add item...')
    await user.type(input, '{Enter}')

    expect(onAdd).not.toHaveBeenCalled()
  })

  it('does not call onAdd when Enter is pressed with only whitespace', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(NewTodoInput, { props: { onAdd } })

    const input = screen.getByPlaceholderText('Add item...')
    await user.type(input, '   {Enter}')

    expect(onAdd).not.toHaveBeenCalled()
  })
})
