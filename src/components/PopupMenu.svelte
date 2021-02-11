<script lang="ts">
  import { glue } from '../actions'
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { randomid } from 'txstate-utils'
  import { PopupMenuItem } from '../types'
  const dispatch = createEventDispatcher()

  export let menushown = false
  export let menuClass = ''
  export let menuItemClass = ''
  export let menuItemHilitedClass = ''
  export let items: PopupMenuItem[] = []
  export let buttonelement: HTMLElement
  export let align: 'auto'|'bottomleft'|'bottomright'|'topleft'|'topright' = 'auto'

  let menuelement: HTMLElement|undefined
  let hilited: number|undefined = undefined
  let itemelements: HTMLElement[] = []
  const menuid = randomid()

  function move (idx: number) {
    if (!menushown) return
    hilited = Math.max(0, Math.min(items.length - 1, idx))
    buttonelement.setAttribute('aria-activedescendant', `${menuid}-${hilited}`)
  }

  function open (moveTo?: number) {
    if (menushown) return
    menushown = true
    buttonelement.setAttribute('aria-controls', menuid)
    buttonelement.setAttribute('aria-expanded', 'true')
    if (typeof moveTo !== 'undefined') move(moveTo)
  }

  function close (value?: string) {
    if (!menushown) return
    menushown = false
    hilited = undefined
    buttonelement.removeAttribute('aria-controls')
    buttonelement.setAttribute('aria-expanded', 'false')
    buttonelement.focus()
    if (value) dispatch('change', value)
  }

  function onkeydown (e: KeyboardEvent) {
    if (e.code === 'ArrowDown') {
      e.preventDefault()
      menushown ? move((hilited ?? -1) + 1) : open(0)
    } else if (e.code === 'ArrowUp') {
      e.preventDefault()
      menushown ? move((hilited ?? items.length) - 1) : open(items.length - 1)
    } else if ([' ', 'Space', 'Enter'].includes(e.code)) {
      e.preventDefault()
      if (menushown) {
        close(typeof hilited === 'undefined' ? undefined : items[hilited].value)
      } else {
        open(0)
      }
    } else if (['ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight'].includes(e.code)) {
      // avoid hiding the menu when just using control keys
    } else {
      if (e.code === 'Escape') {
        e.preventDefault()
      }
      close()
    }
  }

  function onbuttonclick (e: MouseEvent) {
    e.preventDefault()
    menushown ? close() : open()
  }

  async function onblur (e: FocusEvent) {
    if (!(e.relatedTarget instanceof HTMLElement && menuelement?.contains(e.relatedTarget))) close()
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
    close(item.value)
  }
</script>

<style>
  ul {
    list-style: none;
    position: absolute;
  }
  ul.default {
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

{#if menushown}
  <ul bind:this={menuelement} use:glue={{ target: buttonelement, align }} id={menuid} role='listbox' class={menuClass || 'default'} on:keydown={onkeydown}>
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
{/if}
