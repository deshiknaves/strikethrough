<script lang="ts">
  import Modal from './Modal.svelte'
  import { getDisplaySections } from '$lib/keyboard-shortcuts'

  let { open = false, onClose }: { open?: boolean; onClose: () => void } = $props()

  const shortcuts = getDisplaySections()
</script>

<Modal {open} {onClose} variant="large" ariaTitle="Keyboard shortcuts">
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-text-primary">Keyboard shortcuts</h3>
    <div class="space-y-4 text-sm">
      {#each shortcuts as { section, items } (section)}
        <div>
          <h4 class="mb-2 font-medium text-text-secondary">{section}</h4>
          <dl class="space-y-1.5">
            {#each items as { keys, description }, itemIndex (itemIndex)}
              <div class="flex items-center justify-between gap-4">
                <dt class="text-text-muted">{description}</dt>
                <dd class="flex flex-wrap items-center justify-end gap-1">
                  {#each keys as combo, comboIndex (comboIndex)}
                    {#if comboIndex > 0}
                      <span class="text-xs text-text-muted">or</span>
                    {/if}
                    {#each Array.isArray(combo) ? combo : [combo] as k, ki (ki)}
                      <kbd
                        class="rounded border border-border bg-bg-elevated px-1.5 py-0.5 font-mono text-xs text-text-primary"
                      >
                        {k}
                      </kbd>
                    {/each}
                  {/each}
                </dd>
              </div>
            {/each}
          </dl>
        </div>
      {/each}
    </div>
    <p class="text-xs text-text-muted">Press Escape to close</p>
  </div>
</Modal>
