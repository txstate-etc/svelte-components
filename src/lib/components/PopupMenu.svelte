<!-- @component
  The purpose of [`PopupMenu`](https://github.com/txstate-etc/svelte-components/blob/main/docs/PopupMenu.md) is to display a menu of options to the user, activated by clicking any element
  bound to `buttonelement`. It can also be controlled from the parent, by binding the `menushown` boolean.
-->
<script lang="ts">
  import { createEventDispatcher, onDestroy, tick } from 'svelte'
  import { isNotBlank, randomid } from 'txstate-utils'
  import { Store } from '@txstate-mws/svelte-store'
  import { glue, portal } from '$lib/actions'
  import type { GlueAlignOpts, GlueAlignStore } from '$lib/actions'
  import type { PopupMenuItem, PopupMenuTypes } from '$lib/types'
  import ScreenReaderOnly from './ScreenReaderOnly.svelte'
  import { getScrollParents, modifierKey } from '$lib/util'
  const dispatch = createEventDispatcher()

  interface $$Events {
    change: CustomEvent<PopupMenuItem>
  }

  /** The DOM element that will act as the "button" for this menu. The menu will be placed next to the
  button and be controlled by the button. Keyboard access will be enabled when the button has focus.
  This component adds all appropriate attributes (tabindex, roles, and aria) automatically. */
  export let buttonelement: HTMLElement
  /** The list of menu items to be shown. Parent may change this at any time based on user activity. */
  export let items: PopupMenuTypes[] = []
  export let menushown = false
  export let value: string | undefined = undefined
  /** Control where the menu will appear. Default is to use the current viewport to make a decision to
  maximize potential for menu growth. */
  export let align: GlueAlignOpts = 'auto'
  /** When the menu is active, should it cover the button or be rendered above/below it? */
  export let cover = false
  /** When an item is currently selected, should it appear in the menu (with a visual indicator), or
  simply be removed from the list (`showSelected: false`). */
  export let showSelected = true
  /** When defined, this width will be passed through to the menu's CSS width. Use a valid CSS dimension
  such as 33em or 159px. Generally this will be used when you need to match the menu width to something
  else, like the button. If the width is static like 100% a simple CSS rule is likely more efficient. */
  export let width: string | undefined = undefined
  /** Bind this prop to receive a store that is updated each time a menu placement decision is made. Example
  of when this is useful is when you are trying to round corners of your button and need to know whether the
  menu is above or below your button so you know which corners to round and which to leave square. Note that
  the values do not update when the menu is hidden, so you may need to rely on `menushown` as well. */
  export let computedalign = new Store<GlueAlignStore>({ valign: 'bottom', halign: 'left' })
  /** Create some spacing between the specified button element and the menu, in pixels */
  export let gap = 0
  /** Set to `true` if you want the parent element's styling to increase its minHeight when necessary. Useful
  for parent elements not styled for variable size children and which you want override the the size of. */
  export let adjustparentheight = false
  /**  If the menu would be clipped by an `overflow: hidden`, you can set this prop and it will be placed in
  the specified container, or the `document.body` if you simply say `true`. Placement will still be calculated
  correctly since it uses positon fixed for placement. */
  export let usePortal: HTMLElement | true | undefined = undefined
  /** Useful for when your `items` need to be fetched but you want the associated element shown. Set to loading
  until they're ready to be displayed and the popup menu will not be shown until the `loading` bind is `true`. */
  export let loading = false
  /** A bindable value for inspecting which item in `items` is currently highlighted as the item currently
  active in the list. This is not the same as `value` and the highlighted item may or may not be selected as
  for the `value` of the field. */
  export let hilited: number | undefined = undefined
  /** The id of the <ul> element that is the displayed list of items. */
  export let menuid = randomid()
  /** When there are no items (e.g. it's a filtered search and there were no results), we still display one
  disabled item in the menu to let the user know what is going on. Use this prop to specify the message. */
  export let emptyText: string | undefined = undefined
  export let menuContainerClass = ''
  export let menuClass = ''
  export let menuItemClass = ''
  export let menuItemHilitedClass = ''
  export let menuItemSelectedClass = ''
  export let menuDividerClass = ''
  export let hideSelectedIndicator = false
  export let hideEmptyText = false
  export let usemenurole: boolean = false

  let menuelement: HTMLElement | undefined
  const itemelements: HTMLElement[] = []
  let firstactive = 0
  let lastactive = items.length - 1
  $: hasMeaningfulItems = showSelected ? !!items.filter(itm => 'value' in itm).length : !!items.filter(itm => 'value' in itm && itm.value !== value).length

  function hiddenItem (item: PopupMenuItem) {
    return !!item && !showSelected && item.value === value
  }

  async function reactToItems (..._: any[]) {
    firstactive = items.findIndex(itm => 'value' in itm && !itm.disabled && !hiddenItem(itm))
    lastactive = items.length - [...items].reverse().findIndex(itm => 'value' in itm && !itm.disabled && !hiddenItem(itm)) - 1
    if (hilited && (items[hilited] as PopupMenuItem)?.disabled) hilited = firstactive
  }
  $: void reactToItems(items, value)

  async function reactToMenuShown (_: boolean) {
    if (!buttonelement) {
      hilited = undefined
      return
    }
    await tick()
    if (!menushown) {
      buttonelement.removeAttribute('aria-controls')
      buttonelement.removeAttribute('aria-owns')
      buttonelement.setAttribute('aria-expanded', 'false')
      if (hilited) buttonelement.removeAttribute('aria-activedescendant')
      hilited = undefined
    } else {
      if (buttonelement instanceof HTMLInputElement) buttonelement.setAttribute('aria-owns', menuid)
      else buttonelement.setAttribute('aria-controls', menuid)
      buttonelement.setAttribute('aria-expanded', 'true')
      if (buttonelement !== document.activeElement) buttonelement.focus()
    }
  }
  $: void reactToMenuShown(menushown)

  function move (idx: number) {
    if (!menushown) return
    while (idx <= lastactive && items[idx] != null && 'divider' in items[idx]) idx++
    if (items[idx] == null || (items[idx] as PopupMenuItem)?.disabled) return
    hilited = Math.max(firstactive, Math.min(lastactive, idx))
    itemelements[hilited].scrollIntoView({ block: 'center' })
    buttonelement.setAttribute('aria-activedescendant', `${menuid}-${hilited}`)
  }

  function isSelectable (itm: PopupMenuTypes): itm is PopupMenuItem {
    return 'value' in itm && !itm.disabled && !hiddenItem(itm)
  }

  function onkeydown (e: KeyboardEvent) {
    if (modifierKey(e)) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (menushown) {
        let i = (hilited ?? firstactive - 1) + 1
        while (items[i] && !isSelectable(items[i])) i++
        move(i)
      } else {
        menushown = true
        tick().then(() => { move(firstactive) }).catch(console.error)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (menushown) {
        let i = (hilited ?? lastactive + 1) - 1
        while (items[i] && !isSelectable(items[i])) i--
        move(i)
      } else {
        menushown = true
        tick().then(() => { move(lastactive) }).catch(console.error)
      }
    } else if (e.key === 'Home') {
      e.preventDefault()
      if (menushown) {
        move(firstactive)
      }
    } else if (e.key === 'End') {
      e.preventDefault()
      if (menushown) {
        move(lastactive)
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (menushown) {
        menushown = false
        if (typeof hilited !== 'undefined') {
          value = (items[hilited] as PopupMenuItem)?.value
          dispatch('change', items[hilited])
        }
      } else {
        menushown = true
        tick().then(() => { move(firstactive) }).catch(console.error)
      }
    } else if (e.key === ' ') {
      // buttonelement might be a text input if this popup is searchable,
      // so we want to allow spaces to be entered without changing the menu situation
      if (menushown) {
        if (typeof hilited !== 'undefined') {
          e.preventDefault()
          menushown = false
          value = (items[hilited] as PopupMenuItem)?.value
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
          tick().then(() => { move(firstactive) }).catch(console.error)
        }
      }
    } else if (menushown && e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      menushown = false
    }
  }

  let blurTimer: number
  function onbuttonclick (e: MouseEvent) {
    e.preventDefault()
    cancelAnimationFrame(blurTimer)
    menushown = !menushown
  }

  function onblur (e: FocusEvent) {
    // tabindex=-1 on our menu elements means e.relatedTarget will be set
    if (!(e.relatedTarget instanceof HTMLElement && menuelement?.contains(e.relatedTarget))) {
      blurTimer = requestAnimationFrame(() => { if (buttonelement !== document.activeElement) menushown = false })
    }
  }

  function oninput (e: InputEvent) {
    if (document.activeElement === buttonelement) menushown = true
  }

  function cleanup (element: HTMLElement) {
    for (const observer of observers) observer.disconnect()
    observers = []
    if (element) {
      element.removeEventListener('click', onbuttonclick)
      element.removeEventListener('keydown', onkeydown)
      element.removeEventListener('blur', onblur)
      element.removeEventListener('input', oninput)
      element.removeAttribute('aria-disabled')
      element.removeAttribute('aria-haspopup')
      element.removeAttribute('aria-expanded')
      element.removeAttribute('aria-controls')
      element.removeAttribute('aria-activedescendant')
    }
  }

  onDestroy(() => { cleanup(buttonelement) })

  // if buttonelement changes we need to handle listeners and aria
  let lastbuttonelement: HTMLElement
  let observers: IntersectionObserver[] = []
  function reactToButtonElement (buttonelement: HTMLElement) {
    cleanup(lastbuttonelement)
    lastbuttonelement = buttonelement
    if (buttonelement) {
      buttonelement.setAttribute('aria-haspopup', (usemenurole ? 'true' : 'listbox'))
      buttonelement.setAttribute('aria-expanded', menushown ? 'true' : 'false')
      buttonelement.addEventListener('click', onbuttonclick)
      buttonelement.addEventListener('keydown', onkeydown)
      buttonelement.addEventListener('blur', onblur)
      buttonelement.addEventListener('input', oninput)
      const parents = getScrollParents(buttonelement)
      for (const parent of [...parents, undefined]) {
        const observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.intersectionRatio < 1) menushown = false
          }
        }, { root: parent, threshold: 1 })
        observer.observe(buttonelement)
        observers.push(observer)
      }
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

  $: hasSelected = showSelected && !hideSelectedIndicator && items.some(itm => 'value' in itm && itm.value === value)
</script>

{#if menushown && !loading && (hasMeaningfulItems || !hideEmptyText)}
  <div use:portal={usePortal === true ? undefined : (usePortal || null)}
       use:glue={{ target: buttonelement, align, cover, gap, adjustparentheight, store: computedalign }}
       class={menuContainerClass}>
    <ul bind:this={menuelement} id={menuid} role={usemenurole ? 'menu' : 'listbox'} tabindex="-1" style={width ? `width: ${width}` : ''}
        class={menuClass} class:hasSelected class:defaultmenu={!menuClass && !menuContainerClass}
        on:keydown={onkeydown}>
      {#each items as item, i ('value' in item ? item.value : `popupmenu_divider_${i}`)}
        {#if 'value' in item && (showSelected || item.value !== value)}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li
            id={`${menuid}-${i}`}
            bind:this={itemelements[i]}
            class={`${menuItemClass} ${i === hilited ? menuItemHilitedClass : ''} ${value === item.value ? menuItemSelectedClass : ''}`}
            class:disabled={!!item.disabled}
            class:hilited={!menuItemHilitedClass && i === hilited}
            class:selected={showSelected && !hideSelectedIndicator && value === item.value}
            on:click={onclick(item)}
            role={usemenurole ? 'menuitem' : 'option'}
            tabindex=-1
            aria-selected={usemenurole ? undefined : (value === item.value)}
            aria-disabled={item.disabled}
          ><slot {item} label={item.label || item.value} hilited={i === hilited} selected={value === item.value}>{item.label || item.value}</slot></li>
        {:else if 'divider' in item && item.divider}
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <li class={`divider ${menuDividerClass}`} on:mousedown|stopPropagation|preventDefault={() => {}} class:group={isNotBlank(item.label)}>{item.label}</li>
        {/if}
      {/each}
      {#if !hasMeaningfulItems}
        <li role={usemenurole ? 'menuitem' : 'option'} class={`${menuItemClass} disabled`} aria-live="assertive" aria-selected={usemenurole ? undefined : false}>
          <slot name="noresults">
            {#if !emptyText}
              <span aria-hidden="true">{'¯\\_(ツ)_/¯'}</span><ScreenReaderOnly>{emptyText || 'no results found'}</ScreenReaderOnly>
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
  li.divider {
    height: 0px;
    border-top: 2px solid slategray;
    cursor: default;
  }
  li.divider.group {
    height: auto;
    border-bottom: 2px solid slategray;
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
