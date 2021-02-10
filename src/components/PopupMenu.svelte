<script lang="ts">
  import { portal } from '../actions'
  import { createEventDispatcher } from 'svelte'
  import { randomid } from 'txstate-utils'
  import { PopupMenuItem } from '../types'
  import { bodyOffset } from '../lib/bodyoffset'
  const dispatch = createEventDispatcher()

  export let menushown = false
  export let menuClass = ''
  export let menuItemClass = ''
  export let menuItemHilitedClass = ''
  export let items: PopupMenuItem[] = []
  export let buttonelement: HTMLElement
  export let align: 'auto'|'bottomleft'|'bottomright'|'topleft'|'topright' = 'auto'

  let hilited = 0
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

  async function open (moveTo = 0) {
    if (menushown) return
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
    menushown = true
    buttonelement.setAttribute('aria-controls', menuid)
    buttonelement.setAttribute('aria-expanded', 'true')
    move(moveTo)
  }

  function close (value?: string) {
    if (!menushown) return
    menushown = false
    buttonelement.removeAttribute('aria-controls')
    buttonelement.setAttribute('aria-expanded', 'false')
    buttonelement.focus()
    if (value) dispatch('change', value)
  }

  function onkeydown (e: KeyboardEvent) {
    console.log(e.code)
    if (e.code === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      menushown ? move(hilited + 1) : open()
    } else if (e.code === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      menushown ? move(hilited - 1) : open(items.length - 1)
    } else if ([' ', 'Space', 'Enter'].includes(e.code)) {
      e.preventDefault()
      e.stopPropagation()
      if (menushown) {
        close(items[hilited].value)
      } else {
        open()
      }
    } else {
      if (e.code === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
      }
      close()
    }
  }

  function onbuttonclick (e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    menushown ? close() : open()
  }

  // if buttonelement changes we need to handle listeners and aria
  let lastbuttonelement: HTMLElement
  function reactToButtonElement (buttonelement: HTMLElement) {
    if (lastbuttonelement) {
      lastbuttonelement.removeEventListener('click', onbuttonclick)
      lastbuttonelement.removeEventListener('keydown', onkeydown)
      lastbuttonelement.removeAttribute('aria-haspopup')
      lastbuttonelement.removeAttribute('aria-expanded')
      lastbuttonelement.removeAttribute('aria-controls')
      lastbuttonelement.removeAttribute('aria-activedescendant')
    }
    lastbuttonelement = buttonelement
    if (buttonelement) {
      buttonelement.setAttribute('aria-haspopup', 'listbox')
      buttonelement.addEventListener('click', onbuttonclick)
      buttonelement.addEventListener('keydown', onkeydown)
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
  li.hilited {
    background: lightblue;
  }
</style>

{#if menushown}
  <ul use:portal id={menuid} role='listbox' class={menuClass || 'default'} on:keydown={onkeydown} style={`left: ${left}; top: ${top}; bottom: ${bottom}; right: ${right}`}>
    {#each items as item, i}
      <li
        id={`${menuid}-${i}`}
        bind:this={itemelements[i]}
        class={`${menuItemClass} ${i === hilited ? menuItemHilitedClass || '' : ''}`}
        class:hilited={!menuItemHilitedClass && i === hilited}
        on:click={onclick(item)}
        role="option"
      >{item.label || item.value}</li>
    {/each}
  </ul>
{/if}
