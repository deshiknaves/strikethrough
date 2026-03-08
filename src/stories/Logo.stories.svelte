<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Logo from '$lib/components/logo.svelte'

  const { Story } = defineMeta({
    title: 'Components/Logo',
    component: Logo,
    tags: ['autodocs'],
    argTypes: {
      color: { control: 'color' },
    },
  })
</script>

<Story name="Default" />

<Story name="Large" args={{ class: 'size-16' }} />

<Story name="Custom Color" args={{ color: '#6b8cff', class: 'size-8' }} />
