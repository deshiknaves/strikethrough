<script lang="ts">
  let {
    open = false,
    onClose,
    variant = 'small',
    ariaTitle = 'Dialog',
    returnFocusTo = null,
    children,
  }: {
    open?: boolean
    onClose: () => void
    variant?: 'small' | 'large'
    ariaTitle?: string
    returnFocusTo?: HTMLElement | null
    children?: import('svelte').Snippet
  } = $props()

  let dialogRef = $state<HTMLDialogElement | null>(null)
  let previousActiveElement: HTMLElement | null = null

  $effect(() => {
    if (!dialogRef) return
    if (open) {
      previousActiveElement = document.activeElement as HTMLElement | null
      if (typeof dialogRef.showModal === 'function') {
        dialogRef.showModal()
      }
    } else {
      if (typeof dialogRef.close === 'function') {
        dialogRef.close()
      }
    }
  })

  function handleClose() {
    onClose()
    requestAnimationFrame(() => {
      const target = returnFocusTo ?? previousActiveElement
      target?.focus()
    })
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      handleClose()
    }
  }

  function handleCancel(e: Event) {
    e.preventDefault()
    handleClose()
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === dialogRef) {
      handleClose()
    }
  }

  const sizeClasses = $derived(
    variant === 'large' ? 'max-w-lg w-[calc(100%-2rem)]' : 'max-w-sm w-[calc(100%-2rem)]'
  )
</script>

<dialog
  bind:this={dialogRef}
  aria-labelledby="modal-title"
  aria-modal="true"
  class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-bg-surface p-4 shadow-lg backdrop:bg-black/50 {sizeClasses}"
  onkeydown={handleKeydown}
  oncancel={handleCancel}
  onclick={handleBackdropClick}
>
  <h2 id="modal-title" class="sr-only">{ariaTitle}</h2>
  {#if children}
    {@render children()}
  {/if}
</dialog>
