<script lang="ts" generics="T extends string">
  type Segment = {
    value: T
    label: string
  }

  type Props = {
    segments: Segment[]
    value: T
    onchange: (v: T) => void
  }

  let { segments, value, onchange }: Props = $props()

  let buttons: (HTMLButtonElement | undefined)[] = $state([])

  let activeIndex = $derived(segments.findIndex((s) => s.value === value))
  let indicatorLeft = $derived(buttons[activeIndex]?.offsetLeft ?? 0)
  let indicatorWidth = $derived(buttons[activeIndex]?.offsetWidth ?? 0)
</script>

<div class="relative flex rounded-full border border-border p-0.5 text-sm">
  <div
    class="absolute bottom-0.5 top-0.5 rounded-full bg-accent-blue transition-all duration-200 ease-in-out"
    style="left: {indicatorLeft}px; width: {indicatorWidth}px;"
  ></div>
  {#each segments as seg, i (seg.value)}
    <button
      bind:this={buttons[i]}
      onclick={() => onchange(seg.value)}
      class="relative z-10 rounded-full px-3 py-0.5 transition-colors {value === seg.value
        ? 'text-white'
        : 'text-text-secondary hover:text-text-primary hover:bg-black/5'}"
    >
      {seg.label}
    </button>
  {/each}
</div>
