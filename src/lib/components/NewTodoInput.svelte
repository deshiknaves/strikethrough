<script lang="ts">
  import { tick } from 'svelte'

  let { onAdd }: { onAdd: (text: string) => void } = $props()
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

  function handleInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
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
    class="w-full border-0 border-b border-border bg-transparent px-1 py-1 text-sm text-text-secondary placeholder:text-text-muted focus:border-accent-blue focus:ring-0 focus:outline-none"
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
    class="flex w-full cursor-pointer items-center gap-1.5 rounded border border-dashed border-border px-2 py-1.5 text-left text-sm text-text-muted transition-colors hover:border-accent-blue/60 hover:bg-accent-blue/5 hover:text-text-secondary focus:border-accent-blue focus:bg-accent-blue/5 focus:text-text-secondary focus:ring-0 focus:outline-none"
  >
    <span aria-hidden="true" class="text-accent-blue">+</span>
    Add item...
  </button>
{/if}
