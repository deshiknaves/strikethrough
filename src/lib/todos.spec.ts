import { describe, expect, it } from 'vitest'
import {
  getTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  updateTodo,
  updateTodoDetails,
  moveTodo,
} from '$lib/todos.svelte'

function uniqueDate() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

describe('todos store', () => {
  it('returns empty array for date with no todos', () => {
    const dateKey = uniqueDate()
    expect(getTodos(dateKey)).toEqual([])
  })

  it('adds a todo and retrieves it', () => {
    const dateKey = uniqueDate()
    addTodo(dateKey, 'Buy milk')

    const todos = getTodos(dateKey)
    expect(todos).toHaveLength(1)
    expect(todos[0]).toMatchObject({
      text: 'Buy milk',
      completed: false,
    })
    expect(todos[0].id).toBeDefined()
  })

  it('adds multiple todos', () => {
    const dateKey = uniqueDate()
    addTodo(dateKey, 'First')
    addTodo(dateKey, 'Second')

    const todos = getTodos(dateKey)
    expect(todos).toHaveLength(2)
    expect(todos[0].text).toBe('First')
    expect(todos[1].text).toBe('Second')
  })

  it('toggles todo completion', () => {
    const dateKey = uniqueDate()
    addTodo(dateKey, 'Task')
    const [todo] = getTodos(dateKey)

    expect(todo.completed).toBe(false)
    toggleTodo(dateKey, todo.id)
    expect(getTodos(dateKey)[0].completed).toBe(true)
    toggleTodo(dateKey, todo.id)
    expect(getTodos(dateKey)[0].completed).toBe(false)
  })

  it('updates a todo', () => {
    const dateKey = uniqueDate()
    addTodo(dateKey, 'Original text')
    const [todo] = getTodos(dateKey)

    updateTodo(dateKey, todo.id, 'Updated text')
    expect(getTodos(dateKey)[0].text).toBe('Updated text')
  })

  it('deletes a todo', () => {
    const dateKey = uniqueDate()
    addTodo(dateKey, 'To delete')
    const [todo] = getTodos(dateKey)

    deleteTodo(dateKey, todo.id)
    expect(getTodos(dateKey)).toHaveLength(0)
  })

  it('deletes correct todo when multiple exist', () => {
    const dateKey = uniqueDate()
    addTodo(dateKey, 'First')
    addTodo(dateKey, 'Second')
    addTodo(dateKey, 'Third')
    const todos = getTodos(dateKey)

    deleteTodo(dateKey, todos[1].id)
    const remaining = getTodos(dateKey)
    expect(remaining).toHaveLength(2)
    expect(remaining[0].text).toBe('First')
    expect(remaining[1].text).toBe('Third')
  })

  it('moves todo within same column (reorder)', () => {
    const dateKey = uniqueDate()
    addTodo(dateKey, 'First')
    addTodo(dateKey, 'Second')
    addTodo(dateKey, 'Third')
    const todos = getTodos(dateKey)

    moveTodo(dateKey, dateKey, todos[0].id, 2)
    const reordered = getTodos(dateKey)
    expect(reordered.map((t) => t.text)).toEqual(['Second', 'Third', 'First'])
  })

  it('moves todo to different column', () => {
    const fromDate = uniqueDate()
    const toDate = uniqueDate()
    addTodo(fromDate, 'Move me')
    const [todo] = getTodos(fromDate)

    moveTodo(fromDate, toDate, todo.id, 0)
    expect(getTodos(fromDate)).toHaveLength(0)
    expect(getTodos(toDate)).toHaveLength(1)
    expect(getTodos(toDate)[0].text).toBe('Move me')
  })

  it('moves todo to specific index in different column', () => {
    const fromDate = uniqueDate()
    const toDate = uniqueDate()
    addTodo(fromDate, 'New one')
    addTodo(toDate, 'Existing')
    const [newTodo] = getTodos(fromDate)

    moveTodo(fromDate, toDate, newTodo.id, 0)
    const toTodos = getTodos(toDate)
    expect(toTodos).toHaveLength(2)
    expect(toTodos[0].text).toBe('New one')
    expect(toTodos[1].text).toBe('Existing')
  })

  it('updateTodoDetails updates text and description', () => {
    const dateKey = uniqueDate()
    addTodo(dateKey, 'Original text')
    const [todo] = getTodos(dateKey)

    updateTodoDetails(dateKey, todo.id, {
      text: 'Updated text',
      description: 'New description',
    })

    const updated = getTodos(dateKey)[0]
    expect(updated.text).toBe('Updated text')
    expect(updated.description).toBe('New description')
  })

  it('updateTodoDetails moves todo when date changes', () => {
    const dateKey = uniqueDate()
    const toDate = uniqueDate()
    addTodo(dateKey, 'Move me')
    const [todo] = getTodos(dateKey)

    updateTodoDetails(dateKey, todo.id, { date: toDate })

    expect(getTodos(dateKey)).toHaveLength(0)
    expect(getTodos(toDate)).toHaveLength(1)
    expect(getTodos(toDate)[0].text).toBe('Move me')
  })
})
