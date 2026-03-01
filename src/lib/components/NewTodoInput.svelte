<script lang="ts">
  let { onAdd }: { onAdd: (text: string) => void } = $props()
  let value = $state('')

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && value.trim()) {
      onAdd(value.trim())
      value = ''
    }
  }
</script>

<input
  bind:value
  onkeydown={handleKeydown}
  placeholder="Add item..."
  class="w-full border-0 border-b border-border bg-transparent px-1 py-1 text-sm text-text-secondary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-0"
/>
