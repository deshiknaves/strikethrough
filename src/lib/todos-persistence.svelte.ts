import type * as Y from 'yjs'

/** Shared Todo schema - also exported from todos.svelte.ts for components */
export type Todo = {
  id: string
  text: string
  completed: boolean
  date: string
  order: number
  createdAt: string
  updatedAt: string
  description?: string
  workspace?: string
}

export type WeekHandle = {
  doc: Y.Doc
  array: Y.Array<Todo>
  weekDateKeys: Set<string>
}

type IndexeddbPersistence = { whenSynced: Promise<unknown>; destroy: () => void }

let handle: WeekHandle | null = null
let provider: IndexeddbPersistence | null = null
let initPromise: Promise<WeekHandle> | null = null

export async function load(
  _monday: string,
  weekDateKeys: string[],
  workspace = 'default'
): Promise<WeekHandle> {
  if (typeof window === 'undefined') {
    throw new Error('load can only be called in browser')
  }

  if (handle) {
    handle.weekDateKeys = new Set(weekDateKeys)
    return handle
  }

  if (initPromise) {
    const h = await initPromise
    h.weekDateKeys = new Set(weekDateKeys)
    return h
  }

  initPromise = (async () => {
    const Y = await import('yjs')
    const doc = new Y.Doc()
    const array = doc.getArray<Todo>('todos')

    if (typeof indexedDB !== 'undefined') {
      const { IndexeddbPersistence } = await import('y-indexeddb')
      const docName = `strikethrough-${workspace}`
      provider = new IndexeddbPersistence(docName, doc) as IndexeddbPersistence
      await provider.whenSynced
    } else {
      provider = { whenSynced: Promise.resolve(), destroy: () => {} }
    }

    handle = {
      doc,
      array,
      weekDateKeys: new Set(weekDateKeys),
    }
    return handle
  })()

  const result = await initPromise
  initPromise = null
  return result
}

export function getHandle(): WeekHandle | null {
  return handle
}

/**
 * Unload the current doc and provider. Used for tests/cleanup only.
 * Not called on week navigation — the doc stays loaded.
 */
export function unloadWeek(): void {
  if (provider) {
    provider.destroy()
    provider = null
  }
  if (handle) {
    handle.doc.destroy()
    handle = null
  }
  initPromise = null
}
