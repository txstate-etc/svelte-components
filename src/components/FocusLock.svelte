<script context="module" lang="ts">
  const FocusLockStack: { pause: () => void, unpause: () => void }[] = []
</script>

<script lang="ts">
  export let returnfocusto: HTMLElement|null|undefined = undefined
  export let initialfocus: string|undefined = undefined
  export let hidefocus = true
  export let hidefocuslabel = "focus is above modal dialog, start tabbing"
  export let escapable = true
  let className = ''
  export { className as class }

  import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte'
  import { tabbable } from 'tabbable'
  import { buttonify } from '../actions'
  import ScreenReaderOnly from './ScreenReaderOnly.svelte'
  const dispatch = createEventDispatcher()
  let lockelement: HTMLElement
  let abovelockelement: HTMLElement
  let active = true
  let listenforescape = false
  if (initialfocus) hidefocus = false
  onMount(() => {
    const prevFocusLock = FocusLockStack.slice(-1)[0]
    if (prevFocusLock) prevFocusLock.pause()
    FocusLockStack.push({
      pause: () => { active = false },
      unpause: () => { active = true }
    })
    if (typeof returnfocusto === 'undefined') {
      returnfocusto = document.querySelector(':focus') as HTMLElement
    }
    if (initialfocus) {
      const focusEl = lockelement.querySelector(initialfocus)
      if (focusEl instanceof HTMLElement) focusEl.focus()
    } else {
      setInitialFocus()
    }
    setTimeout(() => listenforescape = true, 0)
  })
  onDestroy(async () => {
    const wasactive = active
    active = false
    await tick()
    if (returnfocusto && wasactive) {
      returnfocusto.focus()
    }
    FocusLockStack.pop()
    const prevFocusLock = FocusLockStack.slice(-1)[0]
    if (prevFocusLock) prevFocusLock.unpause()
  })
  const setInitialFocus = () => {
    const firstfocus = tabbable(lockelement)[0]
    if (firstfocus && firstfocus.focus) {
      firstfocus.focus()
    }
  }
  const setLastFocus = () => {
    const lastfocus = tabbable(lockelement).slice(-1)[0]
    if (lastfocus && lastfocus.focus) {
      lastfocus.focus()
    }
  }
  const keydown = (e: KeyboardEvent) => {
    if (active && e.key === "Escape" && escapable) {
      e.preventDefault()
      dispatch('escape')
    }
  }
  const focusin = (e: FocusEvent) => {
    if (active && e.target instanceof HTMLElement && !lockelement?.contains(e.target)) {
      if (e.target === abovelockelement) setLastFocus()
      else setInitialFocus()
    }
  }
  const windowclick = (e: MouseEvent) => {
    if (listenforescape && active) {
      returnfocusto = undefined
      dispatch('escape')
    }
  }
</script>
<svelte:window on:click={windowclick} />
<div class={className} role="alertdialog" aria-modal="true" on:click|stopPropagation on:keydown|stopPropagation={keydown} on:focusin={focusin}>
  <div bind:this={abovelockelement} tabindex="0"></div>
  <div bind:this={lockelement} on:keydown={keydown}>
    {#if hidefocus}<div class="hiddenfocus" use:buttonify on:blur={() =>{ hidefocus = false }} on:click={() => escapable && dispatch('escape')}><ScreenReaderOnly>{hidefocuslabel}{#if escapable}, click to escape or use escape key at any time{/if}</ScreenReaderOnly></div>{/if}
    <slot></slot>
  </div>
  <div tabindex="0"></div>
</div>

<style>
  .hiddenfocus {
    opacity: 0;
    outline: 0;
  }
</style>
