import type * as Y from 'yjs'

/** Shared Todo schema - also exported from todos.svelte.ts for components */
export type Todo = {
  id: string
  text: string
  completed: boolean
  date: string
  createdAt: string
  updatedAt: string
}

export type WeekHandle = {
  doc: Y.Doc
  array: Y.Array<Todo>
  weekDateKeys: Set<string>
}

type IndexeddbPersistence = { whenSynced: Promise<unknown>; destroy: () => void }

let currentWeek: {
  monday: string
  handle: WeekHandle
  provider: IndexeddbPersistence
} | null = null

export async function loadWeek(
  monday: string,
  weekDateKeys: string[],
  dbPrefix = 'strikethrough'
): Promise<WeekHandle> {
  if (typeof window === 'undefined') {
    throw new Error('loadWeek can only be called in browser')
  }

  if (currentWeek?.monday === monday) {
    return currentWeek.handle
  }

  const Y = await import('yjs')

  if (currentWeek) {
    currentWeek.provider.destroy()
    currentWeek.handle.doc.destroy()
    currentWeek = null
  }

  const doc = new Y.Doc()
  const array = doc.getArray<Todo>('todos')

  let provider: IndexeddbPersistence
  if (typeof indexedDB !== 'undefined') {
    const { IndexeddbPersistence } = await import('y-indexeddb')
    const docName = `${dbPrefix}-week-${monday}`
    provider = new IndexeddbPersistence(docName, doc) as IndexeddbPersistence
    await provider.whenSynced
  } else {
    provider = { whenSynced: Promise.resolve(), destroy: () => {} }
  }

  const handle: WeekHandle = {
    doc,
    array,
    weekDateKeys: new Set(weekDateKeys),
  }
  currentWeek = { monday, handle, provider }
  return handle
}

export function getCurrentWeekHandle(): WeekHandle | null {
  return currentWeek?.handle ?? null
}

export function unloadWeek(): void {
  if (currentWeek) {
    currentWeek.provider.destroy()
    currentWeek.handle.doc.destroy()
    currentWeek = null
  }
}
