<!-- @component
  The purpose of `MultiSelect` is to provide a text input associated with a popup menu that
  displays, or completes, choice selections based on what's been typed in the text input.
  Selected choices will be added to a list of selected items, in a pill format, that provides
  a means for tracking and removing existing selections. The choices listed in the popup are
  controlled by the parent component via the `getOptions` function that will be used as a
  debounced callback on the contents of the text input.
-->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { randomid, Cache, isNotBlank } from 'txstate-utils'
  import ScreenReaderOnly from './ScreenReaderOnly.svelte'
  import DefaultPopupMenu from './PopupMenu.svelte'
  import { modifierKey, selectionIsLeft } from '$lib/util'
  import type { PopupMenuItem } from '$lib/types'
  import { SafeStore } from '@txstate-mws/svelte-store'

  export let name: string
  /**
   * Function to pass to the component that tells it how to use the text in the text input to determine what
   * `PopupMenuItem[]` should be displayed in the `PopupMenu`. Items already 'selected' from the popup menu will
   * be tracked and automatically filtered from the popup if returned as one of the `PopupMenuItem[]` by `getOptions`. */
  export let getOptions: (search: string) => Promise<PopupMenuItem[]> | PopupMenuItem[]
  export let id = randomid()
  export let disabled = false
  export let menuContainerClass = ''
  export let menuClass = ''
  export let menuItemClass = ''
  export let menuItemHilitedClass = ''
  export let inputClass = ''
  export let menuCategoryClass = ''
  /** The maximum number of selections allowed before making new selections is disabled. Default of 0 is unlimited. */
  export let maxSelections = 0
  /** Consuming components may need to make decisions about what to display or return as options in the popup based
   * on what's already selected. This component property can be used to both pass an initial set of selections but
   * it can also be bound to provide a means to inspect what's selected. */
  export let selected: PopupMenuItem[] = []
  /** The text to be displayed in the input text box for contextual feedback on what the input text is expecting. */
  export let placeholder = ''
  /** When there are no items (e.g. it's a filtered search and there were no results), we still display one
  disabled item in the menu to let the user know what is going on. Use this prop to specify the message. */
  export let emptyText: string | undefined = undefined
  export let usePortal: HTMLElement | true | undefined = undefined
  export let descid: string | undefined = undefined
  /** You can define your own PopupMenu and pass for that to be used or accept DefaultPopupMenu. */
  export let PopupMenu = DefaultPopupMenu
  /** Add a Delete All button to clear all selected items */
  export let includeDeleteAll = false
  /** Show a confirmation message before clearing all selections */
  export let confirmDelete: string | undefined = undefined

  let menushown: boolean
  let loading = false
  let options: PopupMenuItem[] = []
  let hilitedpill: string | undefined
  let popupvalue = undefined
  let inputelement: HTMLInputElement
  let menuid: string
  let announcement = ''
  const instructionid = randomid()
  const dispatch = createEventDispatcher()

  const optionsCache = new Cache(async (ipt: string) => {
    return await getOptions(ipt)
  }, { freshseconds: 5 })

  const selectedStore = new SafeStore(selected)
  $: $selectedStore = selected
  $: selectedSet = new Set($selectedStore.map(s => s.value))
  // Stop showing our menu if the maxSelections limit has been reached.
  $: if (maxSelections > 1 && selected.length >= maxSelections && menushown) menushown = false
  let optionsTimer: number
  async function reactToInput (..._: any) {
    loading = true
    clearTimeout(optionsTimer)
    setTimeout(async () => {
      const saveval = inputelement?.value
      const rawOptions = await optionsCache.get(saveval)
      if (inputelement?.value !== saveval) return // ignore any results that are out of date
      options = rawOptions.filter(o => !('value' in o) || !selectedSet.has(o.value))
      if (typeof document !== 'undefined' && inputelement === document.activeElement && (options.length || inputelement?.value.length) && !menushown) menushown = true
      loading = false
    }, 250)
  }
  $: void reactToInput(getOptions, selectedSet)
  function addSelection (e: CustomEvent & { detail: PopupMenuItem }) {
    inputelement.value = ''
    const opt = { ...e.detail, label: e.detail.label || e.detail.value }
    selected = maxSelections === 1 ? [opt] : [...selected, opt]
    popupvalue = undefined
    announcement = `${maxSelections === 1 ? 'selected' : 'added'} ${opt.label}`
    dispatch('change', selected)
  }
  function removeSelection (opt: typeof selected[number], idx: number, nextfocus = 1) {
    if (hilitedpill === opt.value) {
      hilitedpill = selected[idx + nextfocus]?.value
    }
    selected = selected.filter(s => s.value !== opt.value)
    if (document.activeElement !== inputelement) inputelement.focus()
    announcement = `removed ${opt.label ?? opt.value}`
    dispatch('change', selected)
  }

  function inputkeydown (e: KeyboardEvent) {
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
      }
    } else if (e.key !== 'Tab' && maxSelections > 1 && selected.length >= maxSelections) {
      e.preventDefault()
    } else if (e.key === 'ArrowDown') {
      hilitedpill = undefined
    }
  }
  let active = false
  function inputfocus () {
    void reactToInput()
    active = true
    dispatch('focus')
  }
  function inputblur () {
    active = false
    dispatch('blur')
  }

  function removeAllSelections () {
    selected = []
    dispatch('change', selected)
  }

  function confirmRemoveAllSelections () {
    if (confirmDelete) {
      if (confirm(confirmDelete)) {
        removeAllSelections()
      }
    } else {
      removeAllSelections()
    }
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

  $: ariainstructions = `${selected.length === 0 ? 'nothing' : selected.length} selected, ${maxSelections ? 'select up to ' + maxSelections + ',' : 'select multiple,'} up down to browse choices, ${selected.length ? 'left right to browse selected,' : ''} touch users must explore screen to find menu`

  let gap = 0
  onMount(() => {
    const ul = inputelement.closest<HTMLElement>('.multiselect-selected')
    if (ul != null) gap = ((ul.offsetHeight - ul.clientHeight) / 2) + parseInt(window.getComputedStyle(ul).paddingBottom)
  })
</script>

<div class="multiselect" class:disabled role="combobox" aria-controls={menushown ? menuid : undefined} aria-expanded={menushown}>
  {#if includeDeleteAll && selected.length}
    <div class="delete-all-container">
      <button on:click|preventDefault|stopPropagation={confirmRemoveAllSelections}>
        <slot name="deleteall">Delete All <ScreenReaderOnly>{selected.length} items</ScreenReaderOnly></slot>
      </button>
    </div>
  {/if}
  {#if selected.length}
    <div class="multiselect-selected" role="listbox" aria-label="selected options">
      {#each selected as option, i (option.value)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div id={id + option.value} role="option" tabindex="-1" class="multiselect-pill" class:hilited={hilitedpill === option.value}
          on:click|preventDefault|stopPropagation={() => { !disabled && removeSelection(option, i, 1) }} on:mousedown={e => { disabled && e.preventDefault() }}
          aria-selected="true" aria-posinset={i + 1} aria-setsize={selected.length}>
          {option.label || option.value}
          <i aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128L50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z"/></svg></i>
          <ScreenReaderOnly>, click to deselect</ScreenReaderOnly>
        </div>
      {/each}
    </div>
  {/if}
  <!-- svelte-ignore a11y-role-has-required-aria-props -->
  <input type="text" class={inputClass} {id} {name} {disabled} {placeholder}
    bind:this={inputelement} on:input={reactToInput} on:blur={inputblur}
    on:focus={inputfocus} on:keydown={inputkeydown}
    autocomplete="off" autocorrect="off" spellcheck="false"
    aria-describedby="{[descid, instructionid].filter(isNotBlank).join(' ')}">
  <slot></slot>
  <ScreenReaderOnly id={instructionid}>{ariainstructions}</ScreenReaderOnly>
  <ScreenReaderOnly arialive="polite">{announcement}</ScreenReaderOnly>
</div>

<svelte:component this={PopupMenu} bind:menushown bind:menuid bind:hilited={popuphilited} bind:value={popupvalue} align='bottomleft'
 {usePortal} {loading} {emptyText} {gap}
 {menuContainerClass} {menuClass} {menuItemClass} {menuItemHilitedClass} {menuCategoryClass}
 items={options} buttonelement={inputelement}
 on:change={addSelection}/>

<style>
  .multiselect, .multiselect * {
    box-sizing: border-box;
  }
  .multiselect {
    display: flex;
    flex-wrap: wrap;
    padding: var(--multiselect-padding, 0.3em);
    border: var(--multiselect-border, 1px solid #666666);
    border-radius: var(--multiselect-radius, 0.3em);
  }
  .multiselect:focus-within {
    outline-width: var(--multiselect-focus-width, 2px);
    outline-style: solid;
    outline-color: var(--multiselect-focus-color, Highlight);
  }
  .multiselect-selected {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
  input {
    flex-grow: 1;
    outline: 0;
    border: 0;
    min-width: 0;
  }
  .multiselect-pill {
    position: relative;
    cursor: pointer;
    flex-grow: 0;
    margin-right: 0.3em;
    line-height: 1;
    border-radius: var(--multiselect-pill-radius, 0.8em);
    border: var(--multiselect-pill-border, 1px solid gray);
    background-color: var(--multiselect-pill-bg, transparent);
    color: var(--multiselect-pill-text, black);
    padding: var(--multiselect-pill-padding-top, 0.3em) var(--multiselect-pill-padding-left, 0.5em);
    padding-right: calc(var(--multiselect-pill-padding-left, 0.5em) + 1.1em);
  }
  .multiselect-pill i {
    display: block;
    position: absolute;
    top: 50%;
    right: calc(var(--multiselect-pill-padding-left, 0.5em) - 0.1em);
    transform: translateY(-50%);
    width: 1em;
    height: 1em;
  }
  .multiselect-pill svg {
    width: 100%;
    height: 100%;
  }
  .multiselect-selected.disabled {
    opacity: 0.5;
  }
  .multiselect.disabled .multiselect-pill {
    cursor: default;
  }
  .multiselect-pill.hilited {
    outline: 0;
    background-color: var(--multiselect-pill-selected, gray);
    border: var(--multiselect-pill-selected-border, 1px solid transparent);
    color: var(--multiselect-pill-selected-text, white);
  }
  .delete-all-container {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
</style>
