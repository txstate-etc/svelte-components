<script lang="ts">
  import { writable } from 'svelte/store'
  import type { ElementOffsets } from '../../lib/repositioned'
  import { offset } from '../../actions/offset'
  export let debounce = false
  let myoffset = writable<ElementOffsets>({})
</script>

<div class='resizable'>resize this div</div>
<div use:offset={{ store: myoffset, debounce }} class="offset">
  This div's offset...<br>
  Left: {$myoffset.left}<br>
  Top: {$myoffset.top}<br>
  Right: {$myoffset.right}<br>
  Bottom: {$myoffset.bottom}
</div>
debounce: {debounce}

<style>
  div {
    max-width: 300px;
  }
  .resizable {
    resize: both;
    overflow: auto;
    min-height: 100px;
    background: lightblue;
    border: 1px solid black;
  }
  .offset {
    border: 1px solid blue;
    text-align: center;
  }
</style>
