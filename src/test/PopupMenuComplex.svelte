<script lang="ts">
  import PopupMenu from '$lib/components/PopupMenu.svelte'
  let button: HTMLElement

  export let items: { value: string, label: string, disabled?: boolean }[] = [
    { value: '0', label: 'Sunday', disabled: true },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday', disabled: true },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday', disabled: true }
  ]
</script>

<div class="topspacer"></div>
<div class="container">
  <div class="container">
    <button data-testid="button" class="ui gold button" bind:this={button}>Popup Menu</button>
  </div>
  <div class="topspacer"></div>
  <div class="container">
    <PopupMenu usePortal buttonelement={button} {items}></PopupMenu>
  </div>
</div>

<style>
  .topspacer {
    height: 20px;
  }
  .container {
    position: relative;
  }
</style>
