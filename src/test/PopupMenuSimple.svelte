<script lang="ts">
  import { keyby } from 'txstate-utils'
  import PopupMenu from '$lib/components/PopupMenu.svelte'

  export let showSelected = false
  export let items = [
    { value: '0', label: 'Sunday', disabled: true },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday', disabled: true },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday', disabled: true }
  ]

  let button: HTMLElement
  let value: string
  $: itemsByValue = keyby(items, 'value')
  $: selected = itemsByValue[value]
</script>

<div class="topspacer"></div>
<div class="container">
  <button id="test-button" class="ui gold button" bind:this={button}>Popup Menu</button>
  <div>selected: {#if selected}{selected.value}, {selected.label}{:else}none{/if}</div>
  <PopupMenu bind:value buttonelement={button} {items} {showSelected} adjustparentheight align="bottomleft"></PopupMenu>
</div>

<style>
  .topspacer {
    height: 20px;
  }
  .container {
    position: relative;
    overflow: hidden;
    height: 15000px;
  }
</style>
