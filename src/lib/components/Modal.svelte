<script lang="ts">
  export let escapable = true
  export let hidefocus = true
  export let hidefocuslabel: string|undefined = undefined
  export let returnfocusto: HTMLElement|undefined = undefined
  export let initialfocus: string|undefined = undefined
  export let containerClass = ''
  export let opaque = false
  export let usePortal: HTMLElement|undefined = undefined
  /**
   * If you expect any popup menus to be added to the body, we need to know that they
   * are considered to be part of the focus lock, or else the modal will be dismissed
   * when the user clicks inside
   * use commas to include multiple selectors
   */
  export let includeselector: string | undefined = undefined
  import { createEventDispatcher, onMount } from 'svelte'
  import FocusLock, { FocusLockStack } from './FocusLock.svelte'
  import { portal } from '$lib/actions'

  const dispatch = createEventDispatcher()
  const endmodal = () => {
    dispatch('escape')
  }
  let stackPosition: number
  onMount(() => {
    stackPosition = FocusLockStack.length - 1
    document.body.style.marginRight = (window.innerWidth - document.body.clientWidth) + 'px'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      document.body.style.marginRight = ''
    }
  })
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div use:portal={usePortal} class="modal-backdrop" style:--modal-z={stackPosition * 10 + 3000} class:opaque on:mousedown|stopPropagation|preventDefault={() => escapable && endmodal()}>
  <FocusLock class="modal-container {containerClass}" {includeselector} {escapable} on:escape {hidefocus} {hidefocuslabel} {returnfocusto} {initialfocus}>
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
    z-index: var(--modal-z);
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
