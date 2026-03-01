<script lang="ts">
  import { tick } from 'svelte'
  import Modal from '$lib/components/Modal.svelte'
  import type { Todo } from '$lib/todos.svelte'

  let {
    open = false,
    onClose,
    todo,
    fromDate,
    onSave,
    returnFocusTo = null,
  }: {
    open?: boolean
    onClose: () => void
    todo: Todo
    fromDate: string
    onSave: (updates: { text: string; description: string; date: string }) => void
    returnFocusTo?: HTMLElement | null
  } = $props()

  let textValue = $state('')
  let descriptionValue = $state('')
  let dateValue = $state('')
  let titleInputRef = $state<HTMLInputElement | null>(null)

  $effect(() => {
    if (open) {
      textValue = todo.text
      descriptionValue = todo.description ?? ''
      dateValue = todo.date
      tick().then(() => titleInputRef?.focus())
    }
  })

  function handleSave() {
    const trimmedText = textValue.trim()
    if (!trimmedText) return
    onSave({
      text: trimmedText,
      description: descriptionValue,
      date: dateValue,
    })
    onClose()
    requestAnimationFrame(() => returnFocusTo?.focus())
  }

  function handleClose() {
    onClose()
    requestAnimationFrame(() => returnFocusTo?.focus())
  }
</script>

<Modal {open} onClose={handleClose} variant="large" ariaTitle="Todo details" {returnFocusTo}>
  <div class="space-y-4" role="presentation">
    <div>
      <label for="todo-details-title" class="mb-1 block text-sm font-medium text-text-secondary">
        Title
      </label>
      <input
        id="todo-details-title"
        bind:this={titleInputRef}
        bind:value={textValue}
        type="text"
        class="w-full rounded border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:ring-1 focus:ring-accent-blue focus:outline-none"
        placeholder="Todo title"
      />
    </div>
    <div>
      <label
        for="todo-details-description"
        class="mb-1 block text-sm font-medium text-text-secondary"
      >
        Description
      </label>
      <textarea
        id="todo-details-description"
        bind:value={descriptionValue}
        rows="4"
        class="w-full rounded border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:ring-1 focus:ring-accent-blue focus:outline-none"
        placeholder="Add details..."
      ></textarea>
    </div>
    <div>
      <label for="todo-details-date" class="mb-1 block text-sm font-medium text-text-secondary">
        Date
      </label>
      <input
        id="todo-details-date"
        type="date"
        bind:value={dateValue}
        class="w-full rounded border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:ring-1 focus:ring-accent-blue focus:outline-none"
      />
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onclick={handleClose}
        class="rounded px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
      >
        Cancel <kbd class="ml-1 rounded border border-border bg-bg-elevated px-1.5 py-0.5 font-mono text-xs">Esc</kbd>
      </button>
      <button
        type="button"
        onclick={handleSave}
        class="rounded bg-accent-blue px-3 py-1.5 text-sm text-white hover:opacity-90"
      >
        Save <kbd class="ml-1 rounded border border-white/30 px-1.5 py-0.5 font-mono text-xs">⌘↵</kbd>
      </button>
    </div>
  </div>
</Modal>
