export interface Todo {
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
