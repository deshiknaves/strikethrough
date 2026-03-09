<script lang="ts">
  import { onMount, tick } from 'svelte'

  let { onAdd, autoFocus = false }: { onAdd: (text: string) => void; autoFocus?: boolean } =
    $props()
  let value = $state('')
  let isExpanded = $state(false)
  let buttonRef = $state<HTMLButtonElement | null>(null)
  let inputRef = $state<HTMLInputElement | null>(null)

  function expand() {
    isExpanded = true
  }

  function collapse() {
    isExpanded = false
  }

  async function focusButton() {
    await tick()
    buttonRef?.focus()
  }

  async function focusInput() {
    await tick()
    inputRef?.focus()
  }

  function handleButtonKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      expand()
      focusInput()
    }
  }

  onMount(() => {
    if (autoFocus) {
      tick().then(() => buttonRef?.focus())
    }
  })

  function handleInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      value = ''
      collapse()
      focusButton()
      return
    }
    if (event.key === 'Enter' && value.trim()) {
      onAdd(value.trim())
      value = ''
      collapse()
      focusButton()
    }
  }
</script>

{#if isExpanded}
  <input
    bind:this={inputRef}
    bind:value
    onkeydown={handleInputKeydown}
    placeholder="Add item..."
    aria-label="Add new todo"
    aria-keyshortcuts="Enter Escape"
    class="w-full border-0 border-b border-border bg-transparent px-1 py-1 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:ring-0 focus:outline-none"
  />
{:else}
  <button
    bind:this={buttonRef}
    type="button"
    onclick={() => {
      expand()
      focusInput()
    }}
    onkeydown={handleButtonKeydown}
    aria-label="Add new todo"
    aria-keyshortcuts="Enter Space"
    class="relative flex w-full cursor-pointer items-center gap-1.5 rounded border border-border px-2 py-1.5 text-left text-sm text-text-muted transition-colors hover:bg-bg-elevated focus:z-10 focus:border-transparent focus:bg-bg-elevated focus:text-accent-blue focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-bg-surface focus:outline-none"
  >
    <span aria-hidden="true">+</span>
    Add item...
  </button>
{/if}
