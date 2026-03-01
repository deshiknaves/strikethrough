<script lang="ts">
  let { onAdd }: { onAdd: (text: string) => void } = $props()
  let value = $state('')

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && value.trim()) {
      onAdd(value.trim())
      value = ''
    }
  }
</script>

<input
  bind:value
  onkeydown={handleKeydown}
  placeholder="Add item..."
  aria-label="Add new todo"
  aria-keyshortcuts="Enter ArrowUp ArrowDown"
  class="w-full border-0 border-b border-border bg-transparent px-1 py-1 text-sm text-text-secondary placeholder:text-text-muted focus:border-accent-blue focus:ring-0 focus:outline-none"
/>
