import { SettableSubject } from '../lib'
import { ElementOffsets, watchForPositionChange } from '../lib/repositioned'

export interface StickyArgs <T extends StickyStore = StickyStore> {
  store?: SettableSubject<T>
}

export interface StickyStore {
  floating: boolean
}

export function sticky (el: HTMLElement, config?: StickyArgs) {
  let offsetParent: HTMLElement
  let floating = false
  let scrollstart = 1000000
  let scrollend = 1000000
  let mintop = 0

  let scrollTimer: number
  function onscroll () {
    const scroll = window.scrollY
    cancelAnimationFrame(scrollTimer)
    scrollTimer = requestAnimationFrame(() => {
      el.style.transform = `translateY(${mintop + Math.max(Math.min(scroll, scrollend) - scrollstart, 0)}px)`
      const wasFloating = floating
      floating = scroll >= scrollstart
      if (floating !== wasFloating) config?.store?.update(v => ({ ...v, floating }))
    })
  }

  function onpositionchange (offset: Required<ElementOffsets>) {
    offsetParent = el.offsetParent as HTMLElement
    mintop = el.offsetTop
    scrollstart = offset.top + mintop
    scrollend = Math.max(scrollstart, scrollstart + offsetParent.clientHeight - el.offsetHeight - 1)
    onscroll()
  }

  const { destroy } = watchForPositionChange(el.offsetParent as HTMLElement, onpositionchange)
  window.addEventListener('scroll', onscroll)

  function stickyUpdate (newConfig?: StickyArgs) {
    if (newConfig?.store !== config?.store) newConfig?.store?.set({ floating })
    config = newConfig
  }

  function stickyDestroy () {
    window.removeEventListener('scroll', onscroll)
    destroy()
  }

  return {
    update: stickyUpdate,
    destroy: stickyDestroy
  }
}
