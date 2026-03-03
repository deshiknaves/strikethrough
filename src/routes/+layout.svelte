<script lang="ts">
  import './layout.css'
  import favicon from '$lib/assets/strikethrough.svg'
  import HelpButton from '$lib/components/HelpButton.svelte'

  let { children } = $props()
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
<HelpButton />
