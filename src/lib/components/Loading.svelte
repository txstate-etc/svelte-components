<script lang="ts">
  import { afterUpdate } from 'svelte'
  import ScreenReaderOnly from './ScreenReaderOnly.svelte'
  import { resize, ResizeStore } from '$lib/actions'
  export let loading: boolean|undefined
  export let height: string|undefined = undefined
  const store = new ResizeStore()

  let containerelement: HTMLElement
  let parentScrolls: boolean
  afterUpdate(() => {
    if (height || !containerelement) return
    const parent = containerelement.offsetParent!
    const overflowY = window.getComputedStyle(parent).overflowY
    parentScrolls = overflowY === 'scroll' || overflowY === 'auto'
  })
</script>

{#if loading}
  <div bind:this={containerelement} class="container" class:parentScrolls style:height={height} style:position={height ? 'relative' : undefined}>
    <div use:resize={{ store }} class="loader" style:border-width="{$store.offsetWidth ? $store.offsetWidth * 0.1 : 0}px"><ScreenReaderOnly>Loading</ScreenReaderOnly></div>
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
    z-index: 2;
    background-color: var(--loading-bg, var(--modal-bg, rgba(0, 0, 0, 0.7)));
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .container.parentScrolls {
    position: sticky;
    margin-bottom: -100%;
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
