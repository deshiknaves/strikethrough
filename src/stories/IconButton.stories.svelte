<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import IconButton from '$lib/components/IconButton.svelte'

  const { Story } = defineMeta({
    title: 'Components/IconButton',
    component: IconButton,
    tags: ['autodocs'],
    args: {
      'aria-label': 'Previous',
      onclick: () => {},
    },
  })
</script>

<Story name="Previous">
  <svg class="size-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="15,4 15,20 5,12" />
  </svg>
</Story>

<Story name="Next" args={{ 'aria-label': 'Next' }}>
  <svg class="size-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="9,4 9,20 19,12" />
  </svg>
</Story>
