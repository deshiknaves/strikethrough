import { describe, expect, it, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import TwoColumnsTestWrapper from './TwoColumnsTestWrapper.svelte'
import { addTodo, getTodos } from '$lib/todos.svelte'

function uniqueDate() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Dispatch drag events with proper dataTransfer (required for pragmatic-drag-and-drop in happy-dom) */
function dispatchDragEvent(
  element: Element,
  type: 'dragstart' | 'dragenter' | 'dragover' | 'drop' | 'dragend',
  options: { clientX?: number; clientY?: number } = {},
) {
  const dataTransfer = type === 'dragstart' ? new DataTransfer() : undefined
  const event = new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    dataTransfer,
    clientX: options.clientX ?? 0,
    clientY: options.clientY ?? 0,
  })
  element.dispatchEvent(event)
}

describe('DayColumn drag and drop', () => {
  afterEach(async () => {
    // Cleanup any pending drags (per pragmatic-drag-and-drop docs)
    fireEvent.dragEnd(window)
    fireEvent.pointerMove(window)
  })

  it('moves todo from one column to another via drag and drop', async () => {
    const user = userEvent.setup()
    const colA = uniqueDate()
    const colB = uniqueDate()
    const columnOrder = [colA, colB]

    render(TwoColumnsTestWrapper, {
      props: { colA, colB, columnOrder },
    })

    // Add todo to first column
    const columns = screen.getAllByTestId('day-column')
    const firstColumnInput = columns[0].querySelector('input[placeholder="Add item..."]')
    if (!firstColumnInput) throw new Error('Input not found')
    await user.type(firstColumnInput, 'Drag me{Enter}')

    expect(getTodos(colA)).toHaveLength(1)

    // Get draggable element and drop target
    const draggable = screen.getByTestId('todo-draggable')
    const targetColumn = columns[1]

    // Start drag (use native DragEvent with dataTransfer for pragmatic-drag-and-drop)
    dispatchDragEvent(draggable, 'dragstart')
    await act()

    // Advance animation frame (pragmatic-drag-and-drop needs this to complete lift)
    await new Promise((resolve) => requestAnimationFrame(resolve))

    // Drop on target column
    dispatchDragEvent(targetColumn, 'dragenter')
    dispatchDragEvent(targetColumn, 'dragover', { clientX: 100, clientY: 100 })
    await act()

    dispatchDragEvent(targetColumn, 'drop')
    await act()

    // Verify todo moved
    expect(getTodos(colA)).toHaveLength(0)
    expect(getTodos(colB)).toHaveLength(1)
    expect(getTodos(colB)[0].text).toBe('Drag me')
  })

  it('reorders todos within same column via drag and drop', async () => {
    const colA = uniqueDate()
    const columnOrder = [colA]

    addTodo(colA, 'First')
    addTodo(colA, 'Second')
    addTodo(colA, 'Third')

    const { default: DayColumn } = await import('./DayColumn.svelte')
    render(DayColumn, {
      props: {
        dateKey: colA,
        label: 'Mon',
        sublabel: '24 Feb',
        columnOrder,
      },
    })

    const draggables = screen.getAllByTestId('todo-draggable')
    const todoItems = screen.getAllByTestId('todo-item')

    // Drag first todo and drop below second (between Second and Third)
    dispatchDragEvent(draggables[0], 'dragstart')
    await act()
    await new Promise((resolve) => requestAnimationFrame(resolve))

    // Drop on second todo item (bottom edge)
    dispatchDragEvent(todoItems[1], 'dragenter')
    dispatchDragEvent(todoItems[1], 'dragover', { clientX: 50, clientY: 60 })
    await act()
    dispatchDragEvent(todoItems[1], 'drop')
    await act()

    const reordered = getTodos(colA)
    expect(reordered.map((t) => t.text)).toEqual(['Second', 'First', 'Third'])
  })
})
