<script context="module" lang="ts">
  const FocusLockStack: { pause: () => void, unpause: () => void }[] = []
</script>

<script lang="ts">
  export let returnfocusto: HTMLElement|null = null
  export let hidefocus = true
  export let hidefocuslabel = "focus moved to dialog"
  import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte'
  import { tabbable } from 'tabbable'
import ScreenReaderOnly from './ScreenReaderOnly.svelte'
  const dispatch = createEventDispatcher()
  let lockelement: HTMLElement
  let abovelockelement: HTMLElement
  let active = true
  onMount(() => {
    const prevFocusLock = FocusLockStack.slice(-1)[0]
    if (prevFocusLock) prevFocusLock.pause()
    FocusLockStack.push({
      pause: () => { active = false },
      unpause: () => { active = true }
    })
    if (!returnfocusto) {
      returnfocusto = document.querySelector(':focus')
    }
    setInitialFocus()
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
    if (active && e.key === "Escape" || e.keyCode === 27) {
      e.stopPropagation()
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
</script>

<svelte:window on:keydown={keydown} on:focusin={focusin}/>
<div bind:this={abovelockelement} tabindex="0"></div>
<div bind:this={lockelement} on:keydown={keydown}>
  {#if hidefocus}<div class="hiddenfocus" tabindex="0" on:blur={() =>{ hidefocus = false }}><ScreenReaderOnly>{hidefocuslabel}</ScreenReaderOnly></div>{/if}
  <slot></slot>
</div>
<div tabindex="0"></div>

<style>
  .hiddenfocus {
    opacity: 0;
    outline: 0;
  }
</style>
