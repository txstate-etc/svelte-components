<script lang="ts">
  import { writable } from 'svelte/store'
  import type { ElementSize } from '../../actions/resize'
  import { resize } from '../../actions/resize'
  export let debounce = false
  let mysize = writable<ElementSize>({})
</script>

<div use:resize={{ store: mysize, debounce }} class='resizable'>resize this div</div>
<div class="display">
  Above div's size...<br>
  Width: {$mysize.offsetWidth}<br>
  Height: {$mysize.offsetHeight}
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
  .display {
    text-align: center;
  }
</style>
