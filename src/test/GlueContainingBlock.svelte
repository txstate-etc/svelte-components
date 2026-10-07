<script lang="ts">
  import { Store } from '@txstate-mws/svelte-store'
  import { glue, type GlueAlignStore } from '$lib/actions'

  export let id: string
  export let containerstyle: string

  let target: HTMLElement
  const store = new Store<GlueAlignStore>({ valign: 'bottom', halign: 'left' })
</script>

<!-- The container is small and the target sits in its bottom-right corner, but there is
     plenty of viewport space below and to the right. Auto alignment should go by the
     viewport, so the glued element should land bottom-left of the target. -->
<div class="container" style={containerstyle}>
  <button id="{id}-target" type="button" bind:this={target}>Target</button>
  {#if target}
    <div id="{id}-element" class="glued" use:glue={{ target, align: 'auto', store }}>Glued</div>
  {/if}
</div>
<div id="{id}-align">{$store.valign}{$store.halign}</div>

<style>
  .container {
    position: relative;
    width: 100px;
    height: 60px;
    border: 1px solid black;
  }
  button {
    position: absolute;
    right: 0;
    bottom: 0;
  }
  .glued {
    background: lightyellow;
    border: 1px solid black;
    padding: 0.5em;
  }
</style>
