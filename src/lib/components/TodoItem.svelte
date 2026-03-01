<script lang="ts">
  import { tick } from 'svelte'
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
  import {
    draggable,
    dropTargetForElements,
  } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
  import {
    attachClosestEdge,
    extractClosestEdge,
  } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
  import { startDrag } from '$lib/drag-state.svelte'
  import { enterMoveMode, getKeyboardMoveState } from '$lib/keyboard-move-state.svelte'
  import Modal from '$lib/components/Modal.svelte'
  import TodoDetailsModal from '$lib/components/TodoDetailsModal.svelte'
  import type { Todo } from '$lib/todos.svelte'

  let {
    todo,
    fromDate,
    index,
    onToggle,
    onDelete,
    onUpdate,
    onUpdateDetails,
    columnOrder = [],
    dropEdge = null,
    movingTodo = null,
  }: {
    todo: Todo
    fromDate: string
    index: number
    onToggle: () => void
    onDelete: () => void
    onUpdate: (text: string) => void
    onUpdateDetails: (updates: { text: string; description: string; date: string }) => void
    columnOrder?: string[]
    dropEdge?: 'top' | 'bottom' | null
    movingTodo?: Todo | null
  } = $props()

  const keyboardMoveMode = $derived(getKeyboardMoveState())
  const isKeyboardMoving = $derived(keyboardMoveMode?.todoId === todo.id)

  let deleteModalOpen = $state(false)
  let detailsModalOpen = $state(false)
  let todoRowRef = $state<HTMLDivElement | null>(null)
  let editInputRef = $state<HTMLInputElement | null>(null)
  let isEditing = $state(false)
  let editValue = $state('')
  let isCancelingEdit = $state(false)
  let isSavingEdit = $state(false)

  async function enterEditMode() {
    isEditing = true
    editValue = todo.text
    await tick()
    editInputRef?.focus()
    editInputRef?.select()
  }

  function saveEdit() {
    const trimmed = editValue.trim()
    if (trimmed) onUpdate(trimmed)
    isSavingEdit = true
    isEditing = false
    todoRowRef?.focus()
    queueMicrotask(() => {
      isSavingEdit = false
    })
  }

  function cancelEdit() {
    isCancelingEdit = true
    isEditing = false
    todoRowRef?.focus()
    queueMicrotask(() => {
      isCancelingEdit = false
    })
  }

  function handleEditInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault()
      saveEdit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancelEdit()
    }
  }

  function handleEditInputBlur() {
    if (isCancelingEdit || isSavingEdit) return
    if (editValue.trim()) {
      saveEdit()
    } else {
      cancelEdit()
    }
  }

  function openDeleteModal() {
    deleteModalOpen = true
  }

  function closeDeleteModal() {
    deleteModalOpen = false
  }

  function openDetailsModal() {
    detailsModalOpen = true
  }

  function closeDetailsModal() {
    detailsModalOpen = false
  }

  function handleDetailsSave(updates: { text: string; description: string; date: string }) {
    onUpdateDetails(updates)
    detailsModalOpen = false
  }

  function confirmDelete() {
    onDelete()
    deleteModalOpen = false
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.key === 'm' || e.key === 'M') && !keyboardMoveMode && columnOrder.length > 0) {
      e.preventDefault()
      enterMoveMode(todo.id, fromDate, index)
      return
    }
    if ((e.key === 'd' || e.key === 'D') && !keyboardMoveMode && !isEditing) {
      e.preventDefault()
      openDetailsModal()
      return
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !keyboardMoveMode && !isEditing) {
      e.preventDefault()
      openDetailsModal()
      return
    }
    if ((e.key === 'e' || e.key === 'E') && !keyboardMoveMode) {
      e.preventDefault()
      enterEditMode()
      return
    }
    if (e.key === ' ' && !keyboardMoveMode) {
      e.preventDefault()
      onToggle()
      return
    }
    if (
      (e.key === 'x' || e.key === 'X' || e.key === 'Delete' || e.key === 'Backspace') &&
      !keyboardMoveMode
    ) {
      e.preventDefault()
      openDeleteModal()
    }
  }

  type TodoItemState =
    | { type: 'idle' }
    | { type: 'is-dragging' }
    | { type: 'is-dragging-and-left-self' }
    | { type: 'is-over'; closestEdge: 'top' | 'bottom'; draggingRect: DOMRect }

  let dragState = $state<TodoItemState>({ type: 'idle' })

  const idleState: TodoItemState = { type: 'idle' }

  function initializeDragAndDrop(outerNode: HTMLElement) {
    const innerNode = outerNode.querySelector<HTMLElement>('[data-draggable]')
    if (!innerNode) return { destroy: () => {} }
    const cleanup = combine(
      draggable({
        element: innerNode,
        getInitialData: () => ({
          todoId: todo.id,
          fromDate,
          rect: innerNode.getBoundingClientRect(),
        }),
        onDragStart: () => {
          startDrag(todo.id, fromDate)
          dragState = { type: 'is-dragging' }
        },
        onDrop: () => {
          dragState = idleState
        },
      }),
      dropTargetForElements({
        element: outerNode,
        getIsSticky: () => true,
        getData: ({ element, input }) =>
          attachClosestEdge(
            { type: 'todo' as const, todoId: todo.id, fromDate, index },
            { element, input, allowedEdges: ['top', 'bottom'] }
          ),
        onDragEnter: ({ source, self }) => {
          const data = source.data as { todoId?: string; rect?: DOMRect }
          if (data.todoId === todo.id) return
          const edge = extractClosestEdge(self.data) as 'top' | 'bottom' | null
          if (!edge || (edge !== 'top' && edge !== 'bottom')) return
          const rect = data.rect
          if (!rect) return
          dragState = { type: 'is-over', closestEdge: edge, draggingRect: rect }
        },
        onDrag: ({ source, self }) => {
          const data = source.data as { todoId?: string; rect?: DOMRect }
          if (data.todoId === todo.id) return
          const edge = extractClosestEdge(self.data) as 'top' | 'bottom' | null
          if (!edge || (edge !== 'top' && edge !== 'bottom')) return
          const rect = data.rect
          if (!rect) return
          const proposed: TodoItemState = { type: 'is-over', closestEdge: edge, draggingRect: rect }
          if (dragState.type === 'is-over' && dragState.closestEdge === proposed.closestEdge) {
            return
          }
          dragState = proposed
        },
        onDragLeave: ({ source }) => {
          const data = source.data as { todoId?: string }
          if (data.todoId === todo.id) {
            dragState = { type: 'is-dragging-and-left-self' }
            return
          }
          dragState = idleState
        },
        onDrop: () => {
          dragState = idleState
        },
      })
    )
    return { destroy: cleanup }
  }
</script>

<div use:initializeDragAndDrop data-todo-id={todo.id} class="flex flex-col">
  {#if (dragState.type === 'is-over' && dragState.closestEdge === 'top') || dropEdge === 'top'}
    {#if dropEdge === 'top' && movingTodo}
      <div
        class="flex items-center gap-2 rounded border-b border-border px-1 py-1 ring-2 ring-accent-blue ring-offset-2 ring-offset-bg-surface"
      >
        <div
          class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-accent-blue {movingTodo.completed
            ? 'bg-accent-blue'
            : 'border-text-muted'}"
        >
          {#if movingTodo.completed}
            <svg
              class="h-2 w-2 text-white"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 6l3 3 5-6" />
            </svg>
          {/if}
        </div>
        <span
          class="flex-1 text-sm {movingTodo.completed
            ? 'text-text-muted line-through'
            : 'text-text-primary'}"
        >
          {movingTodo.text}
        </span>
      </div>
    {:else}
      <div
        class="my-0.5 flex items-center gap-2 rounded border border-dashed border-accent-blue bg-accent-blue/5 px-1 py-1"
        style="min-height: {dragState.type === 'is-over' && dragState.closestEdge === 'top'
          ? dragState.draggingRect.height + 'px'
          : '2rem'}"
      >
        <div class="h-3.5 w-3.5 shrink-0 rounded-sm border border-accent-blue/40"></div>
        <div class="h-2.5 w-3/5 rounded-full bg-accent-blue/20"></div>
      </div>
    {/if}
  {/if}
  <div
    bind:this={todoRowRef}
    data-draggable
    data-date-key={fromDate}
    data-todo-index={index}
    tabindex="0"
    role="option"
    aria-selected={isKeyboardMoving}
    aria-keyshortcuts="m d e Space x Delete ArrowUp ArrowDown ArrowLeft ArrowRight j k h l"
    aria-label="Todo: {todo.text}. Press m to move, d for details, e to edit, Space to toggle, x or Delete to remove. Use arrow keys or j/k/h/l to navigate."
    onkeydown={handleKeydown}
    class="group flex cursor-grab items-center gap-2 rounded border-b border-border px-1 py-1 transition-opacity focus-within:bg-bg-elevated hover:bg-bg-elevated focus-visible:ring-2 focus-visible:ring-accent-blue/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface focus-visible:outline-none active:cursor-grabbing {dragState.type ===
    'is-dragging'
      ? 'opacity-40'
      : dragState.type === 'is-dragging-and-left-self' || isKeyboardMoving
        ? 'hidden'
        : 'opacity-100'}"
  >
    <div
      class="flex w-0 min-w-0 shrink-0 overflow-hidden transition-[width] duration-200 ease-out group-focus-within:w-3.5 group-focus-within:min-w-3.5 group-hover:w-3.5 group-hover:min-w-3.5"
    >
      <label class="flex cursor-pointer">
        <input
          type="checkbox"
          tabindex="-1"
          checked={todo.completed}
          onchange={onToggle}
          class="peer sr-only"
        />
        <span
          class="relative flex h-3.5
              w-3.5
              shrink-0 items-center justify-center
              rounded-full
              border border-text-muted opacity-0
              transition-opacity
              duration-200
              ease-out group-focus-within:opacity-100
              group-hover:opacity-100 peer-checked:animate-[pulse_0.4s_ease-out_1] peer-checked:border-accent-blue peer-checked:bg-accent-blue peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent-blue peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-surface
              hover:border-accent-blue peer-checked:hover:border-text-muted peer-checked:hover:bg-transparent peer-checked:hover:text-text-muted peer-checked:hover:delay-400 peer-checked:[&_.check-icon]:animate-[check-pop_0.3s_ease-out]
              peer-checked:[&_.check-icon]:opacity-100 hover:[&_.check-icon]:opacity-100
              peer-checked:hover:[&_.check-icon]:opacity-0 peer-checked:hover:[&_.check-icon]:delay-400 peer-checked:hover:[&_.x-icon]:opacity-100 peer-checked:hover:[&_.x-icon]:delay-400"
        >
          <svg
            class="check-icon h-2 w-2 opacity-0 transition-opacity"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M2 6l3 3 5-6" />
          </svg>
          <svg
            class="x-icon absolute inset-0 m-auto h-2 w-2 opacity-0 transition-opacity"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </span>
      </label>
    </div>
    {#if isEditing}
      <input
        bind:this={editInputRef}
        bind:value={editValue}
        onkeydown={handleEditInputKeydown}
        onblur={handleEditInputBlur}
        type="text"
        class="-ml-2 min-w-0 flex-1 border-0 border-b border-border bg-transparent px-1 py-1 text-sm text-text-primary focus:border-accent-blue focus:ring-0 focus:outline-none"
      />
    {:else}
      <span
        class="-ml-2 flex-1 text-sm transition-[margin-left] duration-200 ease-out group-focus-within:ml-0 group-hover:ml-0 {todo.completed
          ? 'text-text-muted line-through'
          : 'text-text-primary'}"
      >
        {todo.text}
      </span>
    {/if}
    <button
      type="button"
      tabindex="-1"
      onclick={openDeleteModal}
      aria-label="Delete todo"
      class="cursor-pointer leading-none text-text-muted opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface focus-visible:outline-none"
    >
      &times;
    </button>
  </div>
  {#if (dragState.type === 'is-over' && dragState.closestEdge === 'bottom') || dropEdge === 'bottom'}
    <div
      class="my-0.5 flex items-center gap-2 rounded border border-dashed border-accent-blue bg-accent-blue/5 px-1 py-1"
      style="min-height: {dragState.type === 'is-over' && dragState.closestEdge === 'bottom'
        ? dragState.draggingRect.height + 'px'
        : '2rem'}"
    >
      <div class="h-3.5 w-3.5 shrink-0 rounded-sm border border-accent-blue/40"></div>
      <div class="h-2.5 w-3/5 rounded-full bg-accent-blue/20"></div>
    </div>
  {/if}
  <Modal
    open={deleteModalOpen}
    onClose={closeDeleteModal}
    variant="small"
    ariaTitle="Delete todo"
    returnFocusTo={todoRowRef}
  >
    <p class="mb-4 text-sm text-text-primary">Delete this todo?</p>
    <div class="flex justify-end gap-2">
      <button
        type="button"
        onclick={closeDeleteModal}
        class="rounded px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
      >
        Cancel
      </button>
      <button
        type="button"
        onclick={confirmDelete}
        class="rounded bg-accent-blue px-3 py-1.5 text-sm text-white hover:opacity-90"
      >
        Delete
      </button>
    </div>
  </Modal>
  <TodoDetailsModal
    open={detailsModalOpen}
    onClose={closeDetailsModal}
    {todo}
    {fromDate}
    onSave={handleDetailsSave}
    returnFocusTo={todoRowRef}
  />
</div>
