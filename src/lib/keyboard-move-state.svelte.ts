export type KeyboardMoveState = {
  todoId: string
  fromDate: string
  targetDateKey: string
  targetIndex: number
}

let state = $state<KeyboardMoveState | null>(null)

export function getKeyboardMoveState(): KeyboardMoveState | null {
  return state
}

export function enterMoveMode(
  todoId: string,
  fromDate: string,
  initialIndex: number,
): void {
  state = {
    todoId,
    fromDate,
    targetDateKey: fromDate,
    targetIndex: initialIndex,
  }
}

export function updateTarget(dateKey: string, index: number): void {
  if (state) {
    state = { ...state, targetDateKey: dateKey, targetIndex: index }
  }
}

export function exitMoveMode(): void {
  state = null
}
