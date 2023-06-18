<script lang="ts">
  import { offset, OffsetStore } from '$lib'
  const myoffset = new OffsetStore()
</script>
<div class="offset-parent">
  <div class='resizable'>resize this div</div>
  <div use:offset={{ store: myoffset, container: 'nearest' }} class="offset">
    This div's offset...<br>
    Left: {$myoffset.left}<br>
    Top: {$myoffset.top}<br>
    Right: {$myoffset.right}<br>
    Bottom: {$myoffset.bottom}
  </div>
</div>

<style>
  div {
    max-width: 300px;
  }
  .offset-parent {
    position: relative;
    margin-top: 200px;
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
