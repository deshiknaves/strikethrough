<script lang="ts">
  type Variant = 'default' | 'blue' | 'orange' | 'purple' | 'yellow'

  let {
    label,
    variant = 'default',
    class: extraClass = '',
  }: {
    label: string
    variant?: Variant
    class?: string
  } = $props()

  const variantClasses: Record<Variant, string> = {
    default: 'border-border bg-bg-elevated text-text-secondary',
    blue: 'border-accent-blue-light/60 bg-accent-blue-light/10 text-accent-blue-light',
    orange: 'border-accent-orange/60 bg-accent-orange/10 text-accent-orange',
    purple: 'border-accent-purple/60 bg-accent-purple/10 text-accent-purple',
    yellow: 'border-accent-yellow/60 bg-accent-yellow/10 text-accent-yellow',
  }
</script>

<span
  class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium {variantClasses[variant]} {extraClass}"
>
  {label}
</span>
