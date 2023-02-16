<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { randomid, Cache } from 'txstate-utils'
  import ScreenReaderOnly from './ScreenReaderOnly.svelte'
  import DefaultPopupMenu from './PopupMenu.svelte'
  import { modifierKey, selectionIsLeft } from '$lib/util'
  import type { PopupMenuItem } from '$lib/types'

  export let id = randomid()
  export let name: string
  export let disabled = false
  export let getOptions: (search: string) => Promise<PopupMenuItem[]>|PopupMenuItem[]
  export let menuContainerClass: string|undefined = undefined
  export let menuClass: string|undefined = undefined
  export let menuItemClass: string|undefined = undefined
  export let menuItemHilitedClass: string|undefined = undefined
  export let maxSelections = 0
  export let selected: { value: string, label: string }[] = []
  export let placeholder = ''
  export let emptyText: string|undefined = undefined
  export let usePortal: HTMLElement|true|undefined = undefined
  export let PopupMenu = DefaultPopupMenu

  let menushown: boolean
  let loading = false
  let options: PopupMenuItem[] = []
  let hilitedpill: string|undefined
  let inputvalue = ''
  let popupvalue = undefined
  let inputelement: HTMLInputElement
  const descriptionid = randomid()
  const dispatch = createEventDispatcher()

  const optionsCache = new Cache(async (ipt: string) => {
    return await getOptions(ipt)
  }, { freshseconds: 5 })

  $: selectedSet = new Set(selected.map(s => s.value))
  $: if (maxSelections > 1 && selected.length >= maxSelections && menushown) menushown = false
  let optionsTimer: number
  async function reactToInput (..._: any) {
    loading = true
    clearTimeout(optionsTimer)
    setTimeout(async () => {
      const saveval = inputvalue
      const rawOptions = await optionsCache.get(saveval)
      if (inputvalue !== saveval) return // ignore any results that are out of date
      options = rawOptions.filter(o => !selectedSet.has(o.value))
      if (typeof document !== 'undefined' && inputelement === document.activeElement && (options.length || inputvalue?.length)) menushown = true
      loading = false
    }, 250)
  }
  $: reactToInput(inputvalue, getOptions, selectedSet)
  $: availablemessage = options.filter(o => o.value).length + ' autocomplete choices available'
  function addSelection (e: CustomEvent & { detail: PopupMenuItem }) {
    inputvalue = ''
    const opt = { ...e.detail, label: e.detail.label || e.detail.value }
    selected = maxSelections === 1 ? [opt] : [...selected, opt]
    popupvalue = undefined
    dispatch('change', selected)
  }
  function removeSelection (opt: typeof selected[number], idx: number, nextfocus = 1) {
    if (hilitedpill === opt.value) {
      hilitedpill = selected[idx + nextfocus]?.value
    }
    selected = selected.filter(s => s.value !== opt.value)
    dispatch('change', selected)
  }

  function inputkeydown (e) {
    if (modifierKey(e)) return
    if (e.key === 'ArrowLeft' && selectionIsLeft(inputelement)) {
      const idx = hilitedpill ? selected.findIndex(s => s.value === hilitedpill) : selected.length
      if (idx !== 0) hilitedpill = selected[idx - 1].value
    } else if (e.key === 'ArrowRight' && selectionIsLeft(inputelement)) {
      if (hilitedpill) e.preventDefault()
      const idx = hilitedpill ? selected.findIndex(s => s.value === hilitedpill) : undefined
      if (idx != null) {
        if (idx === selected.length - 1) hilitedpill = undefined
        else hilitedpill = selected[idx + 1].value
      }
    } else if (['Backspace', 'Delete', 'Clear', ' ', 'Enter'].includes(e.key)) {
      if (hilitedpill) {
        const idx = selected.findIndex(s => s.value === hilitedpill)
        removeSelection(selected[idx], idx, e.key === 'Delete' ? 1 : -1)
        e.preventDefault()
      } else if (e.key === 'Backspace' && selectionIsLeft(inputelement)) {
        removeSelection(selected[selected.length - 1], selected.length - 1, -1)
        e.preventDefault()
      }
    } else if (e.key !== 'Tab' && maxSelections > 1 && selected.length >= maxSelections) {
      e.preventDefault()
    }
  }
  async function inputfocus () {
    reactToInput()
  }

  let popuphilited
  $: if (popuphilited != null) hilitedpill = undefined
  function reactToHilite (..._: any) {
    if (!inputelement) return
    if (hilitedpill) {
      popuphilited = undefined
      inputelement.setAttribute('aria-activedescendant', id + hilitedpill)
    } else inputelement.removeAttribute('aria-activedescendant')
  }
  $: reactToHilite(hilitedpill, id)
</script>

<fieldset>
  <ul class="multiselect-selected" class:disabled role="listbox">
    {#each selected as option, i}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <li id={id + option.value} role="option" tabindex="-1" class="multiselect-pill" class:hilited={hilitedpill === option.value}
        on:click|preventDefault|stopPropagation={() => !disabled && removeSelection(option, i, 1)} on:mousedown={e => disabled && e.preventDefault()}
        aria-selected="true">
        {option.label || option.value}
        <ScreenReaderOnly>, click to deselect</ScreenReaderOnly>
      </li>
    {/each}
    <li class="input">
      <input type="text" id={id} name={name} {disabled} placeholder={placeholder}
        bind:this={inputelement} bind:value={inputvalue} on:blur
        on:focus={inputfocus} on:keydown={inputkeydown}
        autocomplete="off" autocorrect="off" spellcheck="false" aria-autocomplete="list"
        aria-describedby="{descriptionid}">
    </li>
  </ul>
  <ScreenReaderOnly id={descriptionid} arialive="assertive">
    <span>{selected.length ? selected.length + ' selected' : 'none selected'}, select {maxSelections ? 'up to ' + maxSelections : 'multiple'}, up down to choose, left right to hilite existing choices</span>
    {#if menushown}<span>{availablemessage}, touch users explore to find autocomplete menu</span>{/if}
  </ScreenReaderOnly>
  <slot></slot>
</fieldset>
<svelte:component this={PopupMenu} bind:menushown bind:hilited={popuphilited} bind:value={popupvalue} align='bottomleft' {usePortal} {loading} {emptyText} {menuContainerClass} {menuClass} {menuItemClass} {menuItemHilitedClass} items={options} buttonelement={inputelement} on:change={addSelection}></svelte:component>

<style>
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
  }
  fieldset * {
    box-sizing: border-box;
  }
  .multiselect-selected {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    padding: var(--multiselect-padding, 0.3em);
    border: var(--multiselect-border, 1px solid #666666);
    border-radius: var(--multiselect-radius, 0.3em);
  }
  .multiselect-selected:focus-within {
    outline-width: var(--multiselect-focus-width, 2px);
    outline-style: solid;
    outline-color: var(--multiselect-focus-color, Highlight);
  }
  li.input {
    flex-grow: 1;
  }
  input {
    outline: 0;
    border: 0;
    min-width: 0;
    width: 100%;
    height: 100%;
  }
  .multiselect-pill {
    cursor: pointer;
    flex-grow: 0;
    margin-right: 0.3em;
    line-height: 1;
    border-radius: var(--multiselect-pill-radius, 0.8em);
    border: var(--multiselect-pill-border, 1px solid gray);
    background-color: var(--multiselect-pill-bg, transparent);
    color: var(--multiselect-pill-text, black);
    padding: var(--multiselect-pill-padding, 0.3em 0.5em);
  }
  .multiselect-selected.disabled {
    opacity: 0.5;
  }
  .multiselect-selected.disabled .multiselect-pill {
    cursor: default;
  }
  .multiselect-pill.hilited {
    outline: 0;
    background-color: var(--multiselect-pill-selected, gray);
    border: var(--multiselect-pill-selected-border, 1px solid transparent);
    color: var(--multiselect-pill-selected-text, white);
  }
</style>
