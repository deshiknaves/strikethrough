import { render, screen } from '@testing-library/svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushSync } from 'svelte'
import userEvent from '@testing-library/user-event'
import ViewPicker, { VIEW_MODE_STORAGE_KEY } from './ViewPicker.svelte'

vi.mock('$app/environment', () => ({ browser: true }))

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

describe('ViewPicker', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders Week and Day buttons', () => {
    render(ViewPicker, { props: { value: 'week', onchange: () => {} } })

    expect(screen.getByRole('button', { name: 'Week' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Day' })).toBeInTheDocument()
  })

  it('marks the active segment', () => {
    render(ViewPicker, { props: { value: 'week', onchange: () => {} } })

    expect(screen.getByRole('button', { name: 'Week' })).toHaveClass('bg-accent-blue')
    expect(screen.getByRole('button', { name: 'Day' })).not.toHaveClass('bg-accent-blue')
  })

  it('marks Day as active when value is "day"', () => {
    render(ViewPicker, { props: { value: 'day', onchange: () => {} } })

    expect(screen.getByRole('button', { name: 'Day' })).toHaveClass('bg-accent-blue')
    expect(screen.getByRole('button', { name: 'Week' })).not.toHaveClass('bg-accent-blue')
  })

  it('calls onchange with "day" when Day is clicked', async () => {
    const user = userEvent.setup()
    const onchange = vi.fn()
    render(ViewPicker, { props: { value: 'week', onchange } })

    await user.click(screen.getByRole('button', { name: 'Day' }))

    expect(onchange).toHaveBeenCalledWith('day')
  })

  it('calls onchange with "week" when Week is clicked', async () => {
    const user = userEvent.setup()
    const onchange = vi.fn()
    render(ViewPicker, { props: { value: 'day', onchange } })

    await user.click(screen.getByRole('button', { name: 'Week' }))

    expect(onchange).toHaveBeenCalledWith('week')
  })

  it('saves value to localStorage on mount', () => {
    render(ViewPicker, { props: { value: 'week', onchange: () => {} } })
    flushSync()

    expect(localStorage.getItem(VIEW_MODE_STORAGE_KEY)).toBe('week')
  })

  it('updates localStorage when value changes', async () => {
    const { rerender } = render(ViewPicker, { props: { value: 'week', onchange: () => {} } })
    flushSync()

    await rerender({ value: 'day', onchange: () => {} })
    flushSync()

    expect(localStorage.getItem(VIEW_MODE_STORAGE_KEY)).toBe('day')
  })
})
