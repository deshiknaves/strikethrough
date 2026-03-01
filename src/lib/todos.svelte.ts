import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import {
  loadWeek as loadWeekFromPersistence,
  getCurrentWeekHandle,
  type Todo as PersistenceTodo,
} from '$lib/todos-persistence.svelte'
import { getWeekDateKeys } from '$lib/week-utils'
import type { Temporal } from 'temporal-polyfill'

export type Todo = PersistenceTodo

const todos = $state<Record<string, Todo[]>>({})

function syncFromYArray(handle: { array: { toArray: () => Todo[] }; weekDateKeys: Set<string> }) {
  const all = handle.array.toArray().filter((t) => handle.weekDateKeys.has(t.date))
  const byDate: Record<string, Todo[]> = {}
  for (const dateKey of handle.weekDateKeys) {
    byDate[dateKey] = all.filter((t) => t.date === dateKey)
  }
  for (const key of Object.keys(todos)) {
    delete todos[key]
  }
  for (const [k, v] of Object.entries(byDate)) {
    todos[k] = v
  }
}

export async function loadWeek(
  monday: Temporal.PlainDate,
  dbPrefix = 'strikethrough'
): Promise<void> {
  const mondayStr = monday.toString()
  const weekDateKeys = getWeekDateKeys(monday)
  const handle = await loadWeekFromPersistence(mondayStr, weekDateKeys, dbPrefix)
  syncFromYArray(handle)
  handle.array.observe(() => {
    syncFromYArray(handle)
  })
}

export function getTodos(date: string): Todo[] {
  return todos[date] ?? []
}

function now(): string {
  return new Date().toISOString()
}

function mutateWithHandle(
  fn: (handle: NonNullable<ReturnType<typeof getCurrentWeekHandle>>) => void
): boolean {
  const handle = getCurrentWeekHandle()
  if (handle) {
    fn(handle)
    return true
  }
  return false
}

export function addTodo(date: string, text: string): void {
  const todo: Todo = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    date,
    createdAt: now(),
    updatedAt: now(),
  }
  if (mutateWithHandle((h) => h.array.push([todo]))) return
  if (!todos[date]) todos[date] = []
  todos[date].push(todo)
}

export function toggleTodo(date: string, id: string): void {
  if (
    mutateWithHandle((h) => {
      const arr = h.array.toArray()
      const idx = arr.findIndex((t) => t.id === id && t.date === date)
      if (idx === -1) return
      const todo = { ...arr[idx], completed: !arr[idx].completed, updatedAt: now() }
      h.array.delete(idx, 1)
      h.array.insert(idx, [todo])
    })
  )
    return
  const todo = todos[date]?.find((t) => t.id === id)
  if (todo) todo.completed = !todo.completed
}

export function deleteTodo(date: string, id: string): void {
  if (
    mutateWithHandle((h) => {
      const arr = h.array.toArray()
      const idx = arr.findIndex((t) => t.id === id && t.date === date)
      if (idx !== -1) h.array.delete(idx, 1)
    })
  )
    return
  if (todos[date]) {
    todos[date] = todos[date].filter((t) => t.id !== id)
  }
}

export function updateTodo(date: string, id: string, text: string): void {
  if (
    mutateWithHandle((h) => {
      const arr = h.array.toArray()
      const idx = arr.findIndex((t) => t.id === id && t.date === date)
      if (idx === -1) return
      const todo = { ...arr[idx], text, updatedAt: now() }
      h.array.delete(idx, 1)
      h.array.insert(idx, [todo])
    })
  )
    return
  const todo = todos[date]?.find((t) => t.id === id)
  if (todo) todo.text = text
}

export function resetTodos(): void {
  const handle = getCurrentWeekHandle()
  if (handle) {
    handle.array.delete(0, handle.array.length)
  }
  for (const key of Object.keys(todos)) {
    delete todos[key]
  }
}

export function moveTodo(fromDate: string, toDate: string, todoId: string, toIndex?: number): void {
  const fromList = todos[fromDate]
  if (!fromList) return
  const fromIndex = fromList.findIndex((t) => t.id === todoId)
  if (fromIndex === -1) return

  if (
    mutateWithHandle((h) => {
      const all = h.array.toArray()
      const idx = all.findIndex((t) => t.id === todoId && t.date === fromDate)
      if (idx === -1) return
      const [todo] = all.splice(idx, 1)
      const updated = { ...todo, date: toDate, updatedAt: now() }
      if (fromDate === toDate) {
        if (toIndex === undefined) return
        all.splice(toIndex, 0, updated)
      } else {
        const insertAt = toIndex ?? all.filter((t) => t.date === toDate).length
        let count = 0
        let insertPos = all.length
        for (let i = 0; i < all.length; i++) {
          if (all[i].date === toDate) {
            if (count === insertAt) {
              insertPos = i
              break
            }
            count++
          }
        }
        all.splice(insertPos, 0, updated)
      }
      h.array.delete(0, h.array.length)
      h.array.insert(0, all)
    })
  )
    return

  if (fromDate === toDate) {
    if (toIndex === undefined) return
    todos[fromDate] = reorder({ list: fromList, startIndex: fromIndex, finishIndex: toIndex })
  } else {
    const [todo] = fromList.splice(fromIndex, 1)
    const updated = { ...todo, date: toDate, updatedAt: now() }
    if (!todos[toDate]) todos[toDate] = []
    if (toIndex !== undefined) {
      todos[toDate].splice(toIndex, 0, updated)
    } else {
      todos[toDate].push(updated)
    }
  }
}
