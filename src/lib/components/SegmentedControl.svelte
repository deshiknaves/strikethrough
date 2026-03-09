<script lang="ts" generics="T extends string">
  interface Segment {
    value: T
    label: string
  }

  interface Props {
    segments: Segment[]
    value: T
    onchange: (v: T) => void
  }

  let { segments, value, onchange }: Props = $props()
</script>

<div class="flex rounded-full border border-border p-0.5 text-sm">
  {#each segments as seg (seg.value)}
    <button
      onclick={() => onchange(seg.value)}
      class="rounded-full px-3 py-0.5 transition-colors {value === seg.value
        ? 'bg-accent-blue text-white'
        : 'text-text-secondary hover:text-text-primary'}"
    >
      {seg.label}
    </button>
  {/each}
</div>
