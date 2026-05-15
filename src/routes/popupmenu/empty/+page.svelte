<script lang="ts">
  import PopupMenuComplex from '../../../test/PopupMenuComplex.svelte'
  const items: { value: string, label: string, disabled?: boolean }[] = []
</script>
<PopupMenuComplex {items}></PopupMenuComplex>
