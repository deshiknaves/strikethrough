<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    'aria-label': ariaLabel,
    'aria-keyshortcuts': ariaKeyshortcuts,
    onclick,
    class: extraClass = '',
    children,
  }: {
    'aria-label': string
    'aria-keyshortcuts'?: string
    onclick: () => void
    class?: string
    children: Snippet
  } = $props()
</script>

<button
  type="button"
  aria-label={ariaLabel}
  aria-keyshortcuts={ariaKeyshortcuts}
  {onclick}
  class="flex size-8 items-center justify-center rounded-full border border-border bg-bg-surface text-text-primary transition-colors hover:bg-bg-elevated focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base focus-visible:outline-none {extraClass}"
>
  {@render children()}
</button>
