import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import { SvelteMap, type SvelteSet } from 'svelte/reactivity'
import {
  load as loadFromPersistence,
  getHandle,
  type Todo as PersistenceTodo,
} from '$lib/todos-persistence.svelte'
import { getWeekDateKeys } from '$lib/week-utils'
import type { Temporal } from 'temporal-polyfill'

export type Todo = PersistenceTodo

const todos = $state<Record<string, Todo[]>>({})

function syncFromYArray(handle: { array: { toArray: () => Todo[] }; weekDateKeys: SvelteSet<string> }) {
  const all = handle.array
    .toArray()
    .filter((t) => handle.weekDateKeys.has(t.date))
    .map((t) => ({ ...t, workspace: t.workspace ?? 'default' }))
  const byDate: Record<string, Todo[]> = {}
  for (const dateKey of handle.weekDateKeys) {
    const items = all.filter((t) => t.date === dateKey)
    const withOrder = items.map((t, i) =>
      'order' in t && typeof t.order === 'number' ? t : { ...t, order: i }
    )
    byDate[dateKey] = withOrder.sort(
      (a, b) =>
        (a.completed ? 1 : 0) - (b.completed ? 1 : 0) || a.order - b.order
    )
  }
  for (const key of Object.keys(todos)) {
    delete todos[key]
  }
  for (const [k, v] of Object.entries(byDate)) {
    todos[k] = v
  }
}

let observerAdded = false

export async function loadWeek(
  monday: Temporal.PlainDate,
  options?: { getIsCurrentView?: () => boolean },
  workspace = 'default'
): Promise<void> {
  const mondayStr = monday.toString()
  const weekDateKeys = getWeekDateKeys(monday)
  const handle = await loadFromPersistence(mondayStr, weekDateKeys, workspace)

  if (options?.getIsCurrentView && !options.getIsCurrentView()) {
    return
  }

  syncFromYArray(handle)
  if (!observerAdded) {
    observerAdded = true
    handle.array.observe(() => {
      syncFromYArray(handle)
    })
  }
}

export function getTodos(date: string): Todo[] {
  return todos[date] ?? []
}

function now(): string {
  return new Date().toISOString()
}

function mutateWithHandle(
  fn: (handle: NonNullable<ReturnType<typeof getHandle>>) => void
): boolean {
  const handle = getHandle()
  if (handle) {
    fn(handle)
    return true
  }
  return false
}

/** Reassign order to 0, 1, 2, ... per date based on array position */
function compactOrders(all: Todo[]): Todo[] {
  const dateIndices = new SvelteMap<string, number>()
  return all.map((t) => {
    const idx = dateIndices.get(t.date) ?? 0
    dateIndices.set(t.date, idx + 1)
    return { ...t, order: idx }
  })
}

/** Reassign order to 0, 1, 2, ... for a single column's list */
function compactOrdersForList(list: Todo[]): Todo[] {
  return list.map((t, i) => ({ ...t, order: i }))
}

function getNextOrderForDate(handle: { array: { toArray: () => Todo[] } }, date: string): number {
  const existing = handle.array.toArray().filter((t) => t.date === date)
  if (existing.length === 0) return 0
  const maxOrder = Math.max(
    ...existing.map((t) => ('order' in t && typeof t.order === 'number' ? t.order : -1))
  )
  return maxOrder + 1
}

export function addTodo(date: string, text: string, description?: string): void {
  if (
    mutateWithHandle((h) => {
      const nextOrder = getNextOrderForDate(h, date)
      const todo: Todo = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        date,
        order: nextOrder,
        createdAt: now(),
        updatedAt: now(),
        description: description ?? '',
        workspace: 'default',
      }
      h.array.push([todo])
    })
  )
    return
  const nextOrder = todos[date]?.length ?? 0
  const todo: Todo = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    date,
    order: nextOrder,
    createdAt: now(),
    updatedAt: now(),
    description: description ?? '',
    workspace: 'default',
  }
  if (!todos[date]) todos[date] = []
  todos[date].push(todo)
}

function getMaxOrderForSection(
  items: Todo[],
  completed: boolean
): number {
  const filtered = items.filter((t) => t.completed === completed)
  if (filtered.length === 0) return -1
  return Math.max(
    ...filtered.map((t) => ('order' in t && typeof t.order === 'number' ? t.order : -1))
  )
}

export function toggleTodo(date: string, id: string): void {
  if (
    mutateWithHandle((h) => {
      const arr = h.array.toArray()
      const idx = arr.findIndex((t) => t.id === id && t.date === date)
      if (idx === -1) return
      const todo = { ...arr[idx], completed: !arr[idx].completed, updatedAt: now() }
      arr.splice(idx, 1)
      const dateItems = arr.filter((t) => t.date === date)
      const maxOrderIncomplete = getMaxOrderForSection(dateItems, false)
      const maxOrderCompleted = getMaxOrderForSection(dateItems, true)
      const newOrder = todo.completed
        ? maxOrderCompleted + 1
        : maxOrderIncomplete + 1
      const todoWithOrder = { ...todo, order: newOrder }
      let insertIdx = arr.length
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].date === date && arr[i].completed === todo.completed) {
          insertIdx = i + 1
          break
        }
      }
      arr.splice(insertIdx, 0, todoWithOrder)
      const compacted = compactOrders(arr)
      h.array.delete(0, h.array.length)
      h.array.insert(0, compacted)
    })
  )
    return
  const todo = todos[date]?.find((t) => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    const list = todos[date] ?? []
    const othersInSection = list.filter(
      (t) => t.id !== id && t.completed === todo.completed
    )
    const maxOrder =
      othersInSection.length === 0
        ? -1
        : Math.max(
            ...othersInSection.map((t) =>
              'order' in t && typeof t.order === 'number' ? t.order : -1
            )
          )
    todo.order = maxOrder + 1
    const sorted = list.sort(
      (a, b) =>
        (a.completed ? 1 : 0) - (b.completed ? 1 : 0) || a.order - b.order
    )
    todos[date] = compactOrdersForList(sorted)
  }
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

export type TodoDetailsUpdates = {
  text?: string
  description?: string
  date?: string
}

export function updateTodoDetails(fromDate: string, id: string, updates: TodoDetailsUpdates): void {
  const { text, description, date: newDate } = updates
  const toDate = newDate ?? fromDate
  const hasDateChange = newDate !== undefined && newDate !== fromDate

  if (
    mutateWithHandle((h) => {
      const arr = h.array.toArray()
      const idx = arr.findIndex((t) => t.id === id && t.date === fromDate)
      if (idx === -1) return
      const existing = arr[idx]
      const updated = {
        ...existing,
        ...(text !== undefined && { text }),
        ...(description !== undefined && { description }),
        date: toDate,
        updatedAt: now(),
      }
      arr.splice(idx, 1)
      if (hasDateChange) {
        const insertAt = 0
        let count = 0
        let insertPos = arr.length
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].date === toDate) {
            if (count === insertAt) {
              insertPos = i
              break
            }
            count++
          }
        }
        arr.splice(insertPos, 0, updated)
      } else {
        arr.splice(idx, 0, updated)
      }
      const compacted = compactOrders(arr)
      h.array.delete(0, h.array.length)
      h.array.insert(0, compacted)
    })
  )
    return

  const fromList = todos[fromDate]
  if (!fromList) return
  const fromIndex = fromList.findIndex((t) => t.id === id)
  if (fromIndex === -1) return
  const todo = fromList[fromIndex]

  if (hasDateChange) {
    moveTodo(fromDate, toDate, id, 0)
    const movedTodo = todos[toDate]?.find((t) => t.id === id)
    if (movedTodo) {
      if (text !== undefined) movedTodo.text = text
      if (description !== undefined) movedTodo.description = description
      movedTodo.updatedAt = now()
    }
  } else {
    if (text !== undefined) todo.text = text
    if (description !== undefined) todo.description = description
  }
}

export function resetTodos(): void {
  const handle = getHandle()
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
      const compacted = compactOrders(all)
      h.array.delete(0, h.array.length)
      h.array.insert(0, compacted)
    })
  )
    return

  if (fromDate === toDate) {
    if (toIndex === undefined) return
    const reordered = reorder({ list: fromList, startIndex: fromIndex, finishIndex: toIndex })
    todos[fromDate] = compactOrdersForList(reordered)
  } else {
    const [todo] = fromList.splice(fromIndex, 1)
    const updated = { ...todo, date: toDate, updatedAt: now() }
    if (!todos[toDate]) todos[toDate] = []
    if (toIndex !== undefined) {
      todos[toDate].splice(toIndex, 0, updated)
    } else {
      todos[toDate].push(updated)
    }
    todos[fromDate] = compactOrdersForList(todos[fromDate])
    todos[toDate] = compactOrdersForList(todos[toDate])
  }
}
