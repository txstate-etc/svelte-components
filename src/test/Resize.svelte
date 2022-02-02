<script lang="ts">
  import { resize, ResizeStore } from '$lib'
  export let debounce = false
  const mysize = new ResizeStore()
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
