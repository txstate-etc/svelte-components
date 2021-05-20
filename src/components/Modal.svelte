<script lang="ts">
  export let lockbackdrop = false
  export let hidefocus = true
  export let hidefocuslabel: string|undefined = undefined
  export let returnfocusto: HTMLElement|undefined = undefined
  import FocusLock from './FocusLock.svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import { portal } from '../actions';

  const dispatch = createEventDispatcher()
  const endmodal = () => {
    dispatch('dismiss')
  }
  onMount(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  })
</script>

<div use:portal class="modal-backdrop" on:click={() => lockbackdrop || endmodal()}>
  <div class="modal-container" role="dialog" on:click|stopPropagation>
    <FocusLock escapable={!lockbackdrop} on:escape={endmodal} {hidefocus} {hidefocuslabel} {returnfocusto} on:escape={() => lockbackdrop || endmodal()}>
      <slot></slot>
    </FocusLock>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--modal-bg, rgba(0, 0, 0, 0.7));
    overflow: auto;
    z-index: 100;
  }
  .modal-container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
</style>
