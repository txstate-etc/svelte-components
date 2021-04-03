<script lang="ts">
  import { glue } from '../actions'
  import { createEventDispatcher, onDestroy, tick } from 'svelte'
  import { randomid } from 'txstate-utils'
  import type { PopupMenuItem } from '../types'
  const dispatch = createEventDispatcher()

  export let menushown = false
  export let menuClass = 'popupmenu'
  export let menuItemClass = ''
  export let menuItemHilitedClass = ''
  export let containerClass = ''
  export let items: PopupMenuItem[] = []
  export let buttonelement: HTMLElement
  export let align: 'auto'|'bottomleft'|'bottomright'|'topleft'|'topright' = 'auto'

  let menuelement: HTMLElement|undefined
  let hilited: number|undefined = undefined
  let itemelements: HTMLElement[] = []
  const menuid = randomid()

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
    hilited = Math.max(0, Math.min(items.length - 1, idx))
    buttonelement.setAttribute('aria-activedescendant', `${menuid}-${hilited}`)
  }

  function onkeydown (e: KeyboardEvent) {
    if (e.code === 'ArrowDown') {
      e.preventDefault()
      if (menushown) {
        move((hilited ?? -1) + 1)
      } else {
        menushown = true
        move(0)
      }
    } else if (e.code === 'ArrowUp') {
      e.preventDefault()
      if (menushown) {
        move((hilited ?? items.length) - 1)
      } else {
        menushown = true
        move(items.length - 1)
      }
    } else if (['Space', 'Enter'].includes(e.code)) {
      e.preventDefault()
      if (menushown) {
        menushown = false
        if (typeof hilited !== 'undefined') dispatch('change', items[hilited].value)
      } else {
        menushown = true
        move(0)
      }
    } else if (['ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight'].includes(e.code)) {
      // avoid hiding the menu when just using control keys
    } else {
      if (e.code === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
      }
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
    menushown = false
    dispatch('change', item.value)
  }
</script>

{#if menushown}
  <div use:glue={{ target: buttonelement, align }} class={containerClass}>
    <ul bind:this={menuelement} id={menuid} role='listbox' class={menuClass} on:keydown={onkeydown}>
      {#each items as item, i}
        <li
          id={`${menuid}-${i}`}
          bind:this={itemelements[i]}
          class={`${menuItemClass} ${i === hilited ? menuItemHilitedClass || '' : ''}`}
          class:hilited={!menuItemHilitedClass && i === hilited}
          on:click={onclick(item)}
          role="option"
          tabindex=-1
        >{item.label || item.value}</li>
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
  ul.popupmenu {
    margin: 0;
    padding: 5px;
    background: white;
    border: 1px solid slategray;
    border-radius: 3px;
    min-width: 120px;
  }
  li {
    cursor: pointer;
  }
  li.hilited {
    background: lightblue;
  }
</style>
