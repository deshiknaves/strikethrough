interface DragState {
  todoId: string
  fromDate: string
  dropIndicator: { toDate: string; index: number } | null
}

const state = $state<{ current: DragState | null }>({ current: null })

export const getDragState = () => state.current

export const startDrag = (todoId: string, fromDate: string) => {
  state.current = { todoId, fromDate, dropIndicator: null }
}

export const updateDropIndicator = (toDate: string, index: number) => {
  if (state.current) state.current.dropIndicator = { toDate, index }
}

export const clearDragState = () => {
  state.current = null
}
