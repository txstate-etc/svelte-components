<script lang="ts">
  import { keyby } from 'txstate-utils'
  import PopupMenu from '$lib/components/PopupMenu.svelte'
  import type { GlueAlignOpts } from '$lib'

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

  let align: GlueAlignOpts = 'bottomleft'

  function rotateAlign () {
    if (align === 'bottomleft') align = 'topleft'
    else if (align === 'topleft') align = 'topright'
    else if (align === 'topright') align = 'bottomright'
    else if (align === 'bottomright') align = 'bottomleft'
  }

  let button: HTMLElement
  let value: string
  $: itemsByValue = keyby(items, 'value')
  $: selected = itemsByValue[value]
</script>

<div class="topspacer"></div>
<div class="container">
  <button id="test-button" class="ui gold button" bind:this={button}>Popup Menu</button>
  <div>{align}</div>
  <button type="button" on:click={rotateAlign}>rotate align</button>
  <PopupMenu bind:value buttonelement={button} {items} {showSelected} adjustparentheight {align}></PopupMenu>
</div>

<style>
  .topspacer {
    height: 20px;
  }
  .container {
    position: relative;
    overflow: visible;
    height: 15000px;
    transform: translateX(0px);
  }
</style>
