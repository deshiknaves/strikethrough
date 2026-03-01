const state = $state<{ current: { todoId: string; fromDate: string } | null }>({ current: null })

export const startDrag = (todoId: string, fromDate: string) => {
  state.current = { todoId, fromDate }
}

export const clearDragState = () => {
  state.current = null
}
