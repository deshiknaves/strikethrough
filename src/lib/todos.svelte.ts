import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'

export type Todo = {
  id: string
  text: string
  completed: boolean
}

const todos = $state<Record<string, Todo[]>>({})

export function getTodos(date: string): Todo[] {
  return todos[date] ?? []
}

export function addTodo(date: string, text: string): void {
  if (!todos[date]) todos[date] = []
  todos[date].push({ id: crypto.randomUUID(), text, completed: false })
}

export function toggleTodo(date: string, id: string): void {
  const todo = todos[date]?.find((t) => t.id === id)
  if (todo) todo.completed = !todo.completed
}

export function deleteTodo(date: string, id: string): void {
  if (todos[date]) {
    todos[date] = todos[date].filter((t) => t.id !== id)
  }
}

export function updateTodo(date: string, id: string, text: string): void {
  const todo = todos[date]?.find((t) => t.id === id)
  if (todo) todo.text = text
}

export function moveTodo(fromDate: string, toDate: string, todoId: string, toIndex?: number): void {
  const fromList = todos[fromDate]
  if (!fromList) return
  const fromIndex = fromList.findIndex((t) => t.id === todoId)
  if (fromIndex === -1) return

  if (fromDate === toDate) {
    if (toIndex === undefined) return
    todos[fromDate] = reorder({ list: fromList, startIndex: fromIndex, finishIndex: toIndex })
  } else {
    const [todo] = fromList.splice(fromIndex, 1)
    if (!todos[toDate]) todos[toDate] = []
    if (toIndex !== undefined) {
      todos[toDate].splice(toIndex, 0, todo)
    } else {
      todos[toDate].push(todo)
    }
  }
}
