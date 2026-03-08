<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Modal from '$lib/components/Modal.svelte'

  const { Story } = defineMeta({
    title: 'Components/Modal',
    component: Modal,
    tags: ['autodocs'],
    argTypes: {
      variant: {
        control: { type: 'select' },
        options: ['small', 'large'],
      },
    },
    args: {
      open: true,
      ariaTitle: 'Example Dialog',
      onClose: () => {},
    },
  })
</script>

<Story name="Small" args={{ variant: 'small' }}>
  <p class="text-sm text-text-primary">This is a small modal dialog.</p>
  <div class="mt-4 flex justify-end">
    <button
      type="button"
      class="rounded border border-border px-3 py-1.5 text-sm text-text-primary hover:bg-bg-elevated"
    >
      Close
    </button>
  </div>
</Story>

<Story name="Large" args={{ variant: 'large' }}>
  <h3 class="mb-2 text-base font-semibold text-text-heading">Large Modal</h3>
  <p class="text-sm text-text-secondary">
    This is a large modal dialog with more room for content. It can accommodate forms, lists, or
    detailed information.
  </p>
  <div class="mt-4 flex justify-end gap-2">
    <button
      type="button"
      class="rounded border border-border px-3 py-1.5 text-sm text-text-primary hover:bg-bg-elevated"
    >
      Cancel
    </button>
    <button
      type="button"
      class="rounded border border-accent-blue bg-accent-blue/10 px-3 py-1.5 text-sm text-accent-blue-light hover:bg-accent-blue/20"
    >
      Confirm
    </button>
  </div>
</Story>
