<script lang="ts">
  export let escapable = true
  export let hidefocus = true
  export let hidefocuslabel: string|undefined = undefined
  export let returnfocusto: HTMLElement|undefined = undefined
  export let initialfocus: string|undefined = undefined
  export let containerClass = ''
  export let opaque = false
  export let usePortal: HTMLElement|undefined = undefined
  import { createEventDispatcher, onMount } from 'svelte'
  import FocusLock from './FocusLock.svelte'
  import { portal } from '$lib/actions'

  const dispatch = createEventDispatcher()
  const endmodal = () => {
    dispatch('escape')
  }
  onMount(() => {
    document.body.style.marginRight = (window.innerWidth - document.body.clientWidth) + 'px'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      document.body.style.marginRight = ''
    }
  })
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div use:portal={usePortal} class="modal-backdrop" class:opaque on:mousedown|stopPropagation|preventDefault={() => escapable && endmodal()}>
  <FocusLock class="modal-container {containerClass}" {escapable} on:escape {hidefocus} {hidefocuslabel} {returnfocusto} {initialfocus}>
    <slot></slot>
  </FocusLock>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--modal-bg, rgba(0, 0, 0, 0.7));
    z-index: var(--modal-z, 3000);
    display: flex;
    justify-content: center;
    align-items: center
  }
  .modal-backdrop.opaque {
    background-color: var(--modal-bg-opaque, #4c4c4c);
  }
  .modal-backdrop :global(.modal-container) {
    max-width: 100vw;
    max-height: 100vh;
    overflow: auto;
  }
</style>
