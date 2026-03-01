<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Badge from '$lib/components/Badge.svelte'

  const { Story } = defineMeta({
    title: 'Components/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
      variant: {
        control: { type: 'select' },
        options: ['default', 'blue', 'orange', 'purple', 'yellow'],
      },
    },
    args: {
      label: 'Badge',
      variant: 'default',
    },
  })
</script>

<Story name="Default" args={{ label: 'Default', variant: 'default' }} />

<Story name="Orange" args={{ label: 'Today', variant: 'orange' }} />

<Story name="Blue" args={{ label: 'New', variant: 'blue' }} />

<Story name="Purple" args={{ label: 'Purple', variant: 'purple' }} />

<Story name="Yellow" args={{ label: 'Yellow', variant: 'yellow' }} />
