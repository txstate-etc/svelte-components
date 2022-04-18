<script lang="ts">
  import ScreenReaderOnly from './ScreenReaderOnly.svelte'
  import { resize, ResizeStore } from '$lib/actions'
  export let loading: boolean|undefined
  export let height: string|undefined = undefined
  const store = new ResizeStore()
</script>

{#if loading}
  <div class="container" style:height={height} style:position={height ? 'relative' : 'absolute'}>
    <div use:resize={{ store }} class="loader" style:border-width="{$store.offsetWidth * 0.1}px"><ScreenReaderOnly>Loading</ScreenReaderOnly></div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--loading-bg, var(--modal-bg, rgba(0, 0, 0, 0.7)));
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .loader {
    box-sizing: content-box;
    width: var(--loading-size, 10%);
    padding-top: var(--loading-size, 10%);
    border-color: var(--loading-bg-color, #FFFFFF);
    border-top-color: var(--loading-moving-color, #333333);
    border-style: solid;
    border-radius: 50%;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
