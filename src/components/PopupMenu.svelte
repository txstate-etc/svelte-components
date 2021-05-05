<script lang="ts">
  import type { GlueAlignOpts, GlueAlignStore } from '../actions'
  import { glue, portal } from '../actions'
  import { createEventDispatcher, onDestroy, tick } from 'svelte'
  import { randomid } from 'txstate-utils'
  import type { PopupMenuItem } from '../types'
  import { DeepStore, SettableSubject } from '../lib'
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
  export let selected: PopupMenuItem|undefined = undefined
  export let showSelected = true
  export let width:string|undefined = undefined
  export let computedalign: SettableSubject<GlueAlignStore> = new DeepStore<GlueAlignStore>({ valign: 'bottom', halign: 'left' })
  export let usePortal: HTMLElement|true|undefined = undefined

  let menuelement: HTMLElement|undefined
  let hilited: number|undefined = undefined
  let itemelements: HTMLElement[] = []
  const menuid = randomid()
  let firstactive = 0
  let lastactive = items.length - 1

  async function reactToItems (..._: any[]) {
    firstactive = items.findIndex(itm => !itm.disabled)
    lastactive = items.length - [...items].reverse().findIndex(itm => !itm.disabled) - 1
    if (hilited && items[hilited]?.disabled) hilited = firstactive
  }
  $: reactToItems(items)

  async function reactToMenuShown (_: boolean) {
    if (!buttonelement) {
      hilited = undefined
      return
    }
    await tick()
    if (!menushown) {
      hilited = undefined
      buttonelement.removeAttribute('aria-controls')
      buttonelement.setAttribute('aria-expanded', 'false')
    } else {
      buttonelement.setAttribute('aria-controls', menuid)
      buttonelement.setAttribute('aria-expanded', 'true')
    }
    buttonelement.focus()
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
    if (e.code === 'ArrowDown') {
      e.preventDefault()
      if (menushown) {
        let i = (hilited ?? firstactive - 1) + 1
        while(items[i]?.disabled) i++
        move(i)
      } else {
        menushown = true
        move(firstactive)
      }
    } else if (e.code === 'ArrowUp') {
      e.preventDefault()
      if (menushown) {
        let i = (hilited ?? lastactive + 1) - 1
        while(items[i]?.disabled) i--
        move(i)
      } else {
        menushown = true
        move(lastactive)
      }
    } else if (e.code === 'Enter') {
      e.preventDefault()
      if (menushown) {
        menushown = false
        if (typeof hilited !== 'undefined') {
          selected = items[hilited]
          dispatch('change', items[hilited].value)
        }
      } else {
        menushown = true
        move(firstactive)
      }
    } else if (e.code === 'Space') {
      // buttonelement might be a text input if this popup is searchable,
      // so we want to allow spaces to be entered without changing the menu situation
      if (menushown) {
        if (typeof hilited !== 'undefined') {
          e.preventDefault()
          menushown = false
          selected = items[hilited]
          dispatch('change', items[hilited].value)
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
          move(firstactive)
        }
      }
    } else if (menushown && e.code === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      menushown = false
    }
  }

  function onbuttonclick (e: MouseEvent) {
    e.preventDefault()
    menushown = !menushown
  }

  async function onblur (e: FocusEvent) {
    if (!(e.relatedTarget instanceof HTMLElement && menuelement?.contains(e.relatedTarget))) menushown = false
  }

  function cleanup (element: HTMLElement) {
    if (element) {
      element.removeEventListener('click', onbuttonclick)
      element.removeEventListener('keydown', onkeydown)
      element.removeEventListener('blur', onblur)
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

  const onclick = (item: PopupMenuItem) => () => {
    if (item.disabled) return
    menushown = false
    selected = item
    dispatch('change', item.value)
  }

  $: hasSelected = showSelected && !!items.find(itm => itm.value === selected?.value)
</script>

{#if menushown}
  <div use:portal={usePortal === true ? document.body : usePortal} use:glue={{ target: buttonelement, align, cover, store: computedalign }} class={menuContainerClass}>
    <ul bind:this={menuelement} id={menuid} role='listbox' style={width ? `width: ${width}` : ''} class={menuClass} class:hasSelected class:defaultmenu={!menuClass && !menuContainerClass} on:keydown={onkeydown}>
      {#each items as item, i}
        {#if showSelected || (selected && item.value === selected.value)}
          <li
            id={`${menuid}-${i}`}
            bind:this={itemelements[i]}
            class={`${menuItemClass} ${i === hilited ? menuItemHilitedClass || '' : ''} ${selected && selected.value === item.value ? menuItemSelectedClass || '' : ''}`}
            class:disabled={!!item.disabled}
            class:hilited={!menuItemHilitedClass && i === hilited}
            class:selected={showSelected && !menuItemSelectedClass && selected && selected.value === item.value}
            on:click={onclick(item)}
            role="option"
            tabindex=-1
          ><slot {item} label={item.label || item.value} hilited={i === hilited} selected={selected && selected.value === item.value}>{item.label || item.value}</slot></li>
        {/if}
      {/each}
    </ul>
  </div>
{/if}

<style>
  div {
    position: absolute !important;
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
