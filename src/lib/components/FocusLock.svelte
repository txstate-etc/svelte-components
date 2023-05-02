<!-- @component
The [`FocusLock`](https://github.com/txstate-etc/svelte-components/blob/main/docs/Modal.md#FocusLock)
component is for creating accessible modal dialogs that do not have a darkened backdrop. It shares the
(`escapable`, `hidefocus`, `hidefocuslabel`, `initialfocus`, `returnfocusto`, and `includeselector`)
props and the behaviors with `Modal` because the `Modal` component uses a `FocusLock` itself. In additon
it exports a `className` prop for passing the component a custom CSS class name to use.

Any time the `FocusLock` is in the DOM, it will lock screen readers inside it. You release them by
removing it from the DOM. Regular users are NOT trapped and may interact with other screen elements.
When they do, the escape event will be fired, allowing you to remove the dialog.

`FocusLock`s can be nested. The user will be trapped inside the deepest `FocusLock` present in the DOM.
When it goes away, they'll be trapped inside the previous `FocusLock`, and so on.
-->
<script context="module" lang="ts">
  export const FocusLockStack: { focusId: string, pause: () => void, unpause: () => void, update: () => void }[] = []
  const waitAtick = typeof requestAnimationFrame !== 'undefined' ? resolve => requestAnimationFrame(resolve) : resolve => resolve(0)
</script>

<script lang="ts">
  export let escapable = true
  export let hidefocus = true
  export let hidefocuslabel = 'focus is above modal dialog, start tabbing'
  export let initialfocus: string|undefined = undefined
  export let returnfocusto: HTMLElement|null|undefined = undefined
  /** If you expect any popup menus to be added to the body, we need to know that they
  are considered to be part of the focus lock, or else the modal will be dismissed
  when the user clicks inside. Use commas to include multiple selectors. */
  export let includeselector: string | undefined = undefined
  let className = ''
  export { className as class }
  export let focusId = randomid()

  import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte'
  import { tabbable } from 'tabbable'
  import { randomid, sleep } from 'txstate-utils'
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
      focusId,
      pause: () => { state = 'paused' },
      unpause: () => { if (state === 'paused') state = 'active' },
      update: () => dispatch('focuslockupdate')
    })
    for (const entry of FocusLockStack) entry.update()
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
    const idx = FocusLockStack.findIndex(f => f.focusId === focusId)
    if (idx > -1) FocusLockStack.splice(idx, 1)
    const prevFocusLock = FocusLockStack.slice(-1)[0]
    if (prevFocusLock) prevFocusLock.unpause()
    for (const entry of FocusLockStack) entry.update()
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
  const windowclick = (e: MouseEvent) => {
    if (state === 'active' && e.target instanceof HTMLElement && e.target.isConnected && (!includeselector || !e.target.closest(includeselector))) {
      returnfocusto = undefined
      dispatch('escape')
    }
  }
</script>
<svelte:window on:mousedown={windowclick} />
<div class={className} role="alertdialog" aria-modal="true" on:click|stopPropagation on:mousedown|stopPropagation on:keydown|stopPropagation={keydown} on:focusin={focusin}>
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
