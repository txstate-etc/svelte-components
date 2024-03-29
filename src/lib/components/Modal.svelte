<!-- @component
The [`Modal`](https://github.com/txstate-etc/svelte-components/blob/main/docs/Modal.md#Modal) component is designed to block out the screen and focus the user on the content inside the Modal.

It provides only the backdrop and a scrollable container for your content. If your content should have a background color, be sure to add it yourself.

Any time the Modal is in the DOM, it will take over the screen. You make it go away by removing it from the DOM.
-->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { randomid } from 'txstate-utils'
  import FocusLock, { FocusLockStack } from './FocusLock.svelte'
  import { portal } from '$lib/actions'

  export let opaque = false
  export let containerClass = ''
  export let escapable = true
  export let hidefocus = true
  export let hidefocuslabel: string | undefined = undefined
  export let initialfocus: string | undefined = undefined
  export let returnfocusto: HTMLElement | undefined = undefined
  export let usePortal: HTMLElement | undefined = undefined
  /** If you expect any popup menus to be added to the body, we need to know that they
  are considered to be part of the focus lock, or else the modal will be dismissed
  when the user clicks inside. Use commas to include multiple selectors. */
  export let includeselector: string | undefined = undefined
  export let focusId = randomid()

  const dispatch = createEventDispatcher()
  const endmodal = () => {
    dispatch('escape')
  }
  let stackPosition: number
  function onFocusLockUpdate () {
    stackPosition = FocusLockStack.findIndex(f => f.focusId === focusId)
  }
  onMount(() => {
    onFocusLockUpdate()
    document.body.style.marginRight = (window.innerWidth - document.body.clientWidth) + 'px'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      document.body.style.marginRight = ''
    }
  })
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div use:portal={usePortal} class="modal-backdrop" style:--modal-z={stackPosition * 10 + 3000} class:opaque on:mousedown|stopPropagation|preventDefault={() => { escapable && endmodal() }}>
  <FocusLock bind:focusId class="modal-container {containerClass}" {includeselector} {escapable} on:escape {hidefocus} {hidefocuslabel} {returnfocusto} {initialfocus} on:focuslockupdate={onFocusLockUpdate}>
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
    height: 100dvh;
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
    max-height: 100dvh;
    overflow: auto;
  }
</style>
