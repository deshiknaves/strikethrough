import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import Badge from './Badge.svelte'

describe('Badge', () => {
  it('renders label', () => {
    render(Badge, {
      props: {
        label: 'Today',
      },
    })

    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('applies default variant by default', () => {
    const { container } = render(Badge, {
      props: {
        label: 'Label',
      },
    })

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('border-border', 'bg-bg-elevated', 'text-text-secondary')
  })

  it('applies orange variant', () => {
    const { container } = render(Badge, {
      props: {
        label: 'Today',
        variant: 'orange',
      },
    })

    const badge = container.querySelector('span')
    expect(badge).toHaveClass(
      'border-accent-orange/60',
      'bg-accent-orange/10',
      'text-accent-orange'
    )
  })

  it('applies blue variant', () => {
    const { container } = render(Badge, {
      props: {
        label: 'New',
        variant: 'blue',
      },
    })

    const badge = container.querySelector('span')
    expect(badge).toHaveClass(
      'border-accent-blue-light/60',
      'bg-accent-blue-light/10',
      'text-accent-blue-light'
    )
  })

  it('applies extra class', () => {
    const { container } = render(Badge, {
      props: {
        label: 'Badge',
        class: 'custom-class',
      },
    })

    const badge = container.querySelector('span')
    expect(badge).toHaveClass('custom-class')
  })
})
