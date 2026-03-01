<script lang="ts">
  import Modal from './Modal.svelte'

  let { open = false, onClose }: { open?: boolean; onClose: () => void } = $props()

  const shortcuts = [
    { section: 'General', items: [
      { keys: [['?']], description: 'Show keyboard shortcuts' },
    ]},
    { section: 'Week navigation', items: [
      { keys: [['Shift', 'N'], ['Ctrl', 'N']], description: 'Next week' },
      { keys: [['Shift', 'P'], ['Ctrl', 'P']], description: 'Previous week' },
    ]},
    { section: 'Todo item', items: [
      { keys: [['m']], description: 'Move todo' },
      { keys: [['e']], description: 'Edit todo' },
      { keys: [['Space']], description: 'Toggle complete' },
      { keys: [['x'], ['Delete']], description: 'Delete todo' },
    ]},
    { section: 'Keyboard move mode', items: [
      { keys: [['Enter'], ['Space']], description: 'Place todo' },
      { keys: [['Escape']], description: 'Cancel move' },
    ]},
    { section: 'Navigation', items: [
      { keys: [['↑', '↓', '←', '→']], description: 'Move focus' },
      { keys: [['j', 'k', 'h', 'l']], description: 'Vim-style navigation' },
    ]},
  ]
</script>

<Modal open={open} onClose={onClose} variant="large" ariaTitle="Keyboard shortcuts">
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-text-primary">Keyboard shortcuts</h3>
    <div class="space-y-4 text-sm">
      {#each shortcuts as { section, items }}
        <div>
          <h4 class="mb-2 font-medium text-text-secondary">{section}</h4>
          <dl class="space-y-1.5">
            {#each items as { keys, description }}
              <div class="flex items-center justify-between gap-4">
                <dt class="text-text-muted">{description}</dt>
                <dd class="flex flex-wrap gap-1 justify-end items-center">
                  {#each keys as combo, i}
                    {#if i > 0}
                      <span class="text-text-muted text-xs">or</span>
                    {/if}
                    {#each (Array.isArray(combo) ? combo : [combo]) as key}
                      <kbd
                        class="rounded border border-border bg-bg-elevated px-1.5 py-0.5 font-mono text-xs text-text-primary"
                      >
                        {key}
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
