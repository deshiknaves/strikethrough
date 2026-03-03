<script lang="ts">
  let { class: extraClass = '', color = 'currentColor' }: { class?: string; color?: string } =
    $props()
</script>

<svg
  width="138"
  height="138"
  viewBox="0 0 138 138"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class={extraClass}
>
  <path
    d="M138 128C138 133.523 133.523 138 128 138H10C4.47715 138 0 133.523 0 128V78H138V128ZM128 0C133.523 0 138 4.47715 138 10V60H0V10C0 4.47715 4.47715 0 10 0H128Z"
    fill={color}
  />
</svg>
