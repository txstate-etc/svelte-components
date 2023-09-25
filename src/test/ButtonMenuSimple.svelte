<script lang="ts">
  import { keyby } from 'txstate-utils'
  import ButtonMenu from '$lib/components/ButtonMenu.svelte'

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

  let button: HTMLButtonElement
  let value: string
  $: itemsByValue = keyby(items, 'value')
  $: selected = itemsByValue[value]
</script>

<div class="topspacer"></div>
<div class="container">
  <button id="test-button" class="ui gold button" bind:this={button}>Click to open Menu</button>
  <ButtonMenu buttonelement={button} {items}></ButtonMenu>
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
