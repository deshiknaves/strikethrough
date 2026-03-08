<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import NewTodoInput from '$lib/components/NewTodoInput.svelte'

  const { Story } = defineMeta({
    title: 'Components/NewTodoInput',
    component: NewTodoInput,
    tags: ['autodocs'],
    args: {
      onAdd: () => {},
    },
  })
</script>

<Story name="Default" args={{ autoFocus: false }} />

<Story name="AutoFocus" args={{ autoFocus: true }} />
