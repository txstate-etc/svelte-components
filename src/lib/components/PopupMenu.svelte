<script lang="ts">
  import { createEventDispatcher, onDestroy, tick } from 'svelte'
  import { randomid } from 'txstate-utils'
  import { Store } from '@txstate-mws/svelte-store'
  import { glue, portal } from '$lib/actions'
  import type { GlueAlignOpts, GlueAlignStore } from '$lib/actions'
  import type { PopupMenuItem } from '$lib/types'
  import ScreenReaderOnly from './ScreenReaderOnly.svelte'
  import { modifierKey } from '$lib/util'
  const dispatch = createEventDispatcher()

  export let menushown = false
  export let menuContainerClass = ''
  export let menuClass = ''
  export let menuItemClass = ''
  export let menuItemHilitedClass = ''
  export let menuItemSelectedClass = ''
  export let items: PopupMenuItem[] = []
  export let buttonelement: HTMLElement
  export let align: GlueAlignOpts = 'auto'
  export let cover = false
  export let showSelected = true
  export let width:string|undefined = undefined
  export let computedalign = new Store<GlueAlignStore>({ valign: 'bottom', halign: 'left' })
  export let usePortal: HTMLElement|true|undefined = undefined
  export let emptyText: string|undefined = undefined
  export let value: string|undefined = undefined
  export let hilited: number|undefined = undefined
  let menuelement: HTMLElement|undefined
  const itemelements: HTMLElement[] = []
  const menuid = randomid()
  let firstactive = 0
  let lastactive = items.length - 1

  function hiddenItem (item: PopupMenuItem) {
    return !!item && !showSelected && item.value === value
  }

  async function reactToItems (..._: any[]) {
    firstactive = items.findIndex(itm => !itm.disabled && !hiddenItem(itm))
    lastactive = items.length - [...items].reverse().findIndex(itm => !itm.disabled && !hiddenItem(itm)) - 1
    if (hilited && items[hilited]?.disabled) hilited = firstactive
  }
  $: reactToItems(items, value)

  async function reactToMenuShown (_: boolean) {
    if (!buttonelement) {
      hilited = undefined
      return
    }
    await tick()
    if (!menushown) {
      buttonelement.removeAttribute('aria-controls')
      buttonelement.setAttribute('aria-expanded', 'false')
      if (hilited) buttonelement.removeAttribute('aria-activedescendant')
      hilited = undefined
    } else {
      buttonelement.setAttribute('aria-controls', menuid)
      buttonelement.setAttribute('aria-expanded', 'true')
      if (buttonelement !== document.activeElement) buttonelement.focus()
    }
  }
  $: reactToMenuShown(menushown)

  function move (idx: number) {
    if (!menushown) return
    if (items[idx]?.disabled) return
    hilited = Math.max(firstactive, Math.min(lastactive, idx))
    itemelements[hilited].scrollIntoView({ block: 'center' })
    buttonelement.setAttribute('aria-activedescendant', `${menuid}-${hilited}`)
  }

  function onkeydown (e: KeyboardEvent) {
    if (modifierKey(e)) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (menushown) {
        let i = (hilited ?? firstactive - 1) + 1
        while (items[i]?.disabled || hiddenItem(items[i])) i++
        move(i)
      } else {
        menushown = true
        tick().then(() => move(firstactive))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (menushown) {
        let i = (hilited ?? lastactive + 1) - 1
        while (items[i]?.disabled || hiddenItem(items[i])) i--
        move(i)
      } else {
        menushown = true
        tick().then(() => move(lastactive))
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (menushown) {
        menushown = false
        if (typeof hilited !== 'undefined') {
          value = items[hilited]?.value
          dispatch('change', items[hilited])
        }
      } else {
        menushown = true
        tick().then(() => move(firstactive))
      }
    } else if (e.key === ' ') {
      // buttonelement might be a text input if this popup is searchable,
      // so we want to allow spaces to be entered without changing the menu situation
      if (menushown) {
        if (typeof hilited !== 'undefined') {
          e.preventDefault()
          menushown = false
          value = items[hilited]?.value
          dispatch('change', items[hilited])
        } else {
          if (buttonelement.tagName !== 'INPUT') {
            e.preventDefault()
            menushown = false
          }
        }
      } else {
        if (buttonelement.tagName !== 'INPUT') {
          e.preventDefault()
          menushown = true
          tick().then(() => move(firstactive))
        }
      }
    } else if (menushown && e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      menushown = false
    }
  }

  let blurTimer: any
  function onbuttonclick (e: MouseEvent) {
    e.preventDefault()
    cancelAnimationFrame(blurTimer)
    menushown = !menushown
  }

  async function onblur (e: FocusEvent) {
    // tabindex=-1 on our menu elements means e.relatedTarget will be set
    if (!(e.relatedTarget instanceof HTMLElement && menuelement?.contains(e.relatedTarget))) {
      blurTimer = requestAnimationFrame(() => { if (buttonelement !== document.activeElement) menushown = false })
    }
  }

  function cleanup (element: HTMLElement) {
    if (element) {
      element.removeEventListener('click', onbuttonclick)
      element.removeEventListener('keydown', onkeydown)
      element.removeEventListener('blur', onblur)
      element.removeAttribute('aria-disabled')
      element.removeAttribute('aria-haspopup')
      element.removeAttribute('aria-expanded')
      element.removeAttribute('aria-controls')
      element.removeAttribute('aria-activedescendant')
    }
  }

  onDestroy(() => cleanup(buttonelement))

  // if buttonelement changes we need to handle listeners and aria
  let lastbuttonelement: HTMLElement
  function reactToButtonElement (buttonelement: HTMLElement) {
    cleanup(lastbuttonelement)
    lastbuttonelement = buttonelement
    if (buttonelement) {
      buttonelement.setAttribute('aria-haspopup', 'listbox')
      buttonelement.addEventListener('click', onbuttonclick)
      buttonelement.addEventListener('keydown', onkeydown)
      buttonelement.addEventListener('blur', onblur)
    }
  }
  $: reactToButtonElement(buttonelement)

  const onclick = (item: PopupMenuItem) => (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (item.disabled) return
    menushown = false
    value = item.value
    dispatch('change', item)
  }

  $: hasSelected = showSelected && items.some(itm => itm.value === value)
</script>

{#if menushown}
  <div use:portal={usePortal === true ? document.body : (usePortal || null)} use:glue={{ target: buttonelement, align, cover, store: computedalign }} class={menuContainerClass}>
    <ul bind:this={menuelement} id={menuid} role='listbox' style={width ? `width: ${width}` : ''} class={menuClass} class:hasSelected class:defaultmenu={!menuClass && !menuContainerClass} on:keydown={onkeydown}>
      {#each items as item, i (item.value)}
        {#if showSelected || item.value !== value}
          <li
            id={`${menuid}-${i}`}
            bind:this={itemelements[i]}
            class={`${menuItemClass} ${i === hilited ? menuItemHilitedClass || '' : ''} ${value === item.value ? menuItemSelectedClass || '' : ''}`}
            class:disabled={!!item.disabled}
            class:hilited={!menuItemHilitedClass && i === hilited}
            class:selected={showSelected && !menuItemSelectedClass && value === item.value}
            on:click={onclick(item)}
            role="option"
            tabindex=-1
            aria-disabled={item.disabled}
          ><slot {item} label={item.label || item.value} hilited={i === hilited} selected={value === item.value}>{item.label || item.value}</slot></li>
        {/if}
      {/each}
      {#if items.length === 0}
        <li role="option" class={`${menuItemClass} disabled`} aria-live="assertive">
          <slot name="noresults">
            {#if !emptyText}
              <span aria-hidden="true">{'¯\\_(ツ)_/¯'}</span><ScreenReaderOnly>{emptyText || 'empty popup menu'}</ScreenReaderOnly>
            {:else}
              {emptyText}
            {/if}
          </slot>
        </li>
      {/if}
    </ul>
  </div>
{/if}

<style>
  div {
    position: absolute !important;
    z-index: var(--popup-z, calc(var(--modal-z, 3000) + 1));
  }
  ul {
    list-style: none;
  }
  ul.defaultmenu {
    margin: 0;
    padding: 0.4em;
    background: white;
    border: 1px solid slategray;
    border-radius: 3px;
    min-width: 10em;
    max-height: 20em;
    overflow-y: auto;
  }
  ul.defaultmenu li.disabled {
    color: rgba(0,0,0,0.6);
  }
  ul.defaultmenu::-webkit-scrollbar {
    appearance: none;
    width: 7px;
  }
  ul.defaultmenu::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0,0,0,.5);
    box-shadow: 0 0 1px rgba(255,255,255,.5);
  }
  ul.defaultmenu::-webkit-scrollbar-track {
    background-color: rgba(0,0,0,.1);
  }
  li {
    cursor: pointer;
  }
  li.hilited {
    background: lightblue;
  }
  li.disabled {
    cursor: auto;
  }
  li.selected {
    position: relative;
  }
  ul.hasSelected li {
    padding-left: 1.4em;
  }
  li.selected:after {
    content: ' ';
    position: absolute;
    left: 0.5em;
    top: calc(50% - 0.11em);
    transform: translateY(-50%) rotate(38deg);
    display: block;
    height: 0.786em;
    width: 0.4286em;
    border-bottom: 0.2em solid;
    border-right: 0.2em solid;
    box-sizing: border-box;
  }
</style>
