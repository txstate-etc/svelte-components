<script lang="ts">
  import PopupMenu from '../../components/PopupMenu.svelte'
  let button: HTMLElement

  let items = [{ value: '1', label: 'Monday' },{ value: '2', label: 'Tuesday' },{ value: '3', label: 'Wednesday' },{ value: '4', label: 'Thursday' },{ value: '5', label: 'Friday' }]
</script>

<button data-testid="button" class="ui gold button" bind:this={button}>Popup Menu</button>
<PopupMenu buttonelement={button} {items} menuClass='testmenuclass'></PopupMenu>
