<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import KeyboardShortcutsModal from './KeyboardShortcutsModal.svelte'

  let showShortcuts = $state(false)

  function openShortcuts() {
    showShortcuts = true
  }

  function closeShortcuts() {
    showShortcuts = false
  }

  onMount(() => {
    if (!browser) return

    const handleKeydown = (e: KeyboardEvent) => {
      const isTyping =
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          (document.activeElement as HTMLElement).isContentEditable)

      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping) {
        e.preventDefault()
        openShortcuts()
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  })
</script>

<button
  type="button"
  onclick={openShortcuts}
  aria-label="Show keyboard shortcuts"
  aria-keyshortcuts="?"
  class="fixed bottom-6 right-6 flex size-10 items-center justify-center rounded-full border border-border bg-bg-surface text-lg font-medium text-text-primary shadow-lg transition-colors hover:bg-bg-elevated focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base focus-visible:outline-none"
>
  ?
</button>

<KeyboardShortcutsModal open={showShortcuts} onClose={closeShortcuts} />
