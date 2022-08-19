<script lang="ts">
  import { writable } from 'svelte/store'
  import { eq } from '../../../lib'
  let showall = true
  let showsmallest = true
  const largestore = writable({ width: 1600 })
  const medstore = writable({ width: 800 })
</script>

{#if showall}
<div use:eq={{ store: largestore }} class="resizeable" style:height="100px" style:background="#eeeeee">
  <div use:eq={{ store: medstore }} style:background="#999999">
    {#if showsmallest}<div use:eq style:background="#333333"></div>{/if}
    {$medstore.width}
  </div>
  {$largestore.width}
</div>
{/if}
<button on:click={() => { showsmallest = !showsmallest }}>Toggle Smallest</button>
<button on:click={() => { showall = !showall }}>Toggle All</button>
<style>
  div {
    display: flex;
    height: 100%;
    width: 50%;
    box-sizing: border-box;
  }
  div:global([data-eq~="300px"]) {
    border: 1px solid red;
  }
  div:global([data-eq~="200px"]) {
    border-radius: 15px;
  }
  .resizeable {
    resize: horizontal;
    overflow: auto;
  }
</style>
