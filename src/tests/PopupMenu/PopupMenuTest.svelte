<script lang="ts">
  import PopupMenu from '../../components/PopupMenu.svelte'
  let button: HTMLElement

  export let items = [
    { value: '0', label: 'Sunday', disabled: true },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday', disabled: true },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday', disabled: true }
  ]
</script>

<button data-testid="button" class="ui gold button" bind:this={button}>Popup Menu</button>
<PopupMenu buttonelement={button} {items}></PopupMenu>
