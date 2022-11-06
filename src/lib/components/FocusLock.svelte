<script context="module" lang="ts">
  const FocusLockStack: { pause: () => void, unpause: () => void }[] = []
  const waitAtick = typeof requestAnimationFrame !== 'undefined' ? resolve => requestAnimationFrame(resolve) : resolve => resolve(0)
</script>

<script lang="ts">
  export let returnfocusto: HTMLElement|null|undefined = undefined
  export let initialfocus: string|undefined = undefined
  export let hidefocus = true
  export let hidefocuslabel = 'focus is above modal dialog, start tabbing'
  export let escapable = true
  let className = ''
  export { className as class }

  import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte'
  import { tabbable } from 'tabbable'
  import { sleep } from 'txstate-utils'
  import { buttonify } from '../actions'
  import ScreenReaderOnly from './ScreenReaderOnly.svelte'
  const dispatch = createEventDispatcher()
  let lockelement: HTMLElement
  let abovelockelement: HTMLElement
  let state: 'init' | 'active' | 'paused' | 'destroyed' = 'init'
  if (initialfocus) hidefocus = false
  onMount(async () => {
    const prevFocusLock = FocusLockStack.slice(-1)[0]
    if (prevFocusLock) prevFocusLock.pause()
    FocusLockStack.push({
      pause: () => { state = 'paused' },
      unpause: () => { if (state === 'paused') state = 'active' }
    })
    if (typeof returnfocusto === 'undefined') {
      returnfocusto = document.querySelector(':focus') as HTMLElement
    }
    await sleep(1) // sapper resets focus on page load, so we'll wait a millisecond in case our modal is on screen at load
    if (!lockelement) return // in case we already unmounted
    if (initialfocus) {
      const focusEl = lockelement.querySelector(initialfocus)
      if (focusEl instanceof HTMLElement) focusEl.focus()
    } else {
      setInitialFocus()
    }
    setTimeout(() => { state = 'active' }, 0)
  })
  onDestroy(async () => {
    const wasactive = state !== 'paused'
    state = 'destroyed'

    // we need to allow the screen to redraw so that we can
    // change focus back to where it was, and we need
    // to allow the click event that destroyed us to finish bubbling
    // before we unpause the next focuslock in the stack or else it
    // will think it was an "outside" click and kill itself
    await new Promise(waitAtick)

    if (returnfocusto && wasactive) {
      returnfocusto.focus()
    }
    FocusLockStack.pop()
    const prevFocusLock = FocusLockStack.slice(-1)[0]
    if (prevFocusLock) prevFocusLock.unpause()
  })
  const setInitialFocus = () => {
    const firstfocus = lockelement ? tabbable(lockelement)[0] : undefined
    if (firstfocus && firstfocus.focus) {
      firstfocus.focus()
    }
  }
  const setLastFocus = () => {
    const lastfocus = lockelement ? tabbable(lockelement).slice(-1)[0] : undefined
    if (lastfocus && lastfocus.focus) {
      lastfocus.focus()
    }
  }
  const keydown = (e: KeyboardEvent) => {
    if (state === 'active' && e.key === 'Escape' && escapable) {
      e.preventDefault()
      dispatch('escape')
    }
  }
  const focusin = (e: FocusEvent) => {
    if (state === 'active' && e.target instanceof HTMLElement && !lockelement?.contains(e.target)) {
      if (e.target === abovelockelement) setLastFocus()
      else setInitialFocus()
    }
  }
  const windowclick = (_: MouseEvent) => {
    if (state === 'active') {
      returnfocusto = undefined
      dispatch('escape')
    }
  }
</script>
<svelte:window on:click={windowclick} />
<div class={className} role="alertdialog" aria-modal="true" on:click|stopPropagation on:keydown|stopPropagation={keydown} on:focusin={focusin}>
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div bind:this={abovelockelement} tabindex="0"></div>
  <div bind:this={lockelement} on:keydown={keydown}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    {#if hidefocus}<div class="hiddenfocus" use:buttonify on:blur={() => { hidefocus = false }} on:click={() => escapable && dispatch('escape')}><ScreenReaderOnly>{hidefocuslabel}{#if escapable}, click to escape or use escape key at any time{/if}</ScreenReaderOnly></div>{/if}
    <slot></slot>
  </div>
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div tabindex="0"></div>
</div>

<style>
  .hiddenfocus {
    opacity: 0;
    outline: 0;
  }
</style>
