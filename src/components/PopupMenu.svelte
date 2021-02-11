<script lang="ts">
  import { portal } from '../actions'
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { randomid } from 'txstate-utils'
  import { PopupMenuItem } from '../types'
  import { bodyOffset, debounced } from '../lib'
import { clearTimeout } from 'timers';
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
  let top = '0px'
  let left = '0px'
  let right = 'auto'
  let bottom = 'auto'
  const menuid = randomid()

  function move (idx: number) {
    if (!menushown) return
    hilited = Math.max(0, Math.min(items.length - 1, idx))
    buttonelement.setAttribute('aria-activedescendant', `${menuid}-${hilited}`)
  }

  function reposition () {
    if (!menushown) return
    const offset = bodyOffset(buttonelement)
    let autoalign = align
    if (align === 'auto') {
      const rect = buttonelement.getBoundingClientRect()
      const leftright = window.innerWidth - rect.right > rect.left ? 'left' : 'right'
      const topbottom = window.innerHeight - rect.bottom > rect.top ? 'bottom' : 'top'
      autoalign = topbottom + leftright as 'auto'
    }
    if (autoalign === 'bottomleft') {
      top = (offset.top + buttonelement.offsetHeight) + 'px'
      left = offset.left + 'px'
      bottom = 'auto'
      right = 'auto'
    } else if (autoalign === 'bottomright') {
      top = (offset.top + buttonelement.offsetHeight) + 'px'
      left = 'auto'
      bottom = 'auto'
      right = offset.right + 'px'
    } else if (autoalign === 'topleft') {
      top = 'auto'
      left = offset.left + 'px'
      bottom = offset.top + 'px'
      right = 'auto'
    } else if (autoalign === 'topright') {
      top = 'auto'
      left = 'auto'
      bottom = offset.top + 'px'
      right = offset.right + 'px'
    }
  }

  function open (moveTo?: number) {
    if (menushown) return
    menushown = true
    reposition()
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
  const debouncedreposition = debounced(reposition, 200)
  onMount(() => {
    const observer = new MutationObserver(debouncedreposition)
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true
    })
    window.addEventListener('resize', debouncedreposition)
  })
  onDestroy(() => {
    cleanup(buttonelement)
    window.removeEventListener('resize', debouncedreposition)
  })

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
  <ul bind:this={menuelement} use:portal id={menuid} role='listbox' class={menuClass || 'default'} on:keydown={onkeydown} style={`left: ${left}; top: ${top}; bottom: ${bottom}; right: ${right}`}>
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
