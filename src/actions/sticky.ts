import { bodyOffset, SettableSubject } from '../lib'
import { ElementOffsets, watchForPositionChange } from '../lib/repositioned'

export interface StickyArgs <T extends StickyStore = StickyStore> {
  target?: HTMLElement
  store?: SettableSubject<T>
}

export interface StickyStore {
  floating?: boolean
}

export function sticky (el: HTMLElement, config?: StickyArgs) {
  let floating: boolean
  let scrollstart = 1000000
  let scrollend = 1000000
  let mintop = 0

  let scrollTimer: number
  function onscroll () {
    const scroll = window.scrollY
    const wasFloating = floating
    floating = scroll >= scrollstart
    if (floating !== wasFloating) config?.store?.update(v => ({ ...v, floating }))
    cancelAnimationFrame(scrollTimer)
    scrollTimer = requestAnimationFrame(() => {
      el.style.transform = `translateY(${mintop + Math.max(Math.min(scroll, scrollend) - scrollstart, 0)}px)`
    })
  }

  let lastOffsetParent: HTMLElement = el.offsetParent as HTMLElement
  function onpositionchange (offset: Required<ElementOffsets>) {
    const offsetParent = el.offsetParent
    if (!(offsetParent instanceof HTMLElement)) return
    if (lastOffsetParent !== offsetParent) {
      offset = bodyOffset(offsetParent)
      update(offsetParent, onpositionchange)
      lastOffsetParent = offsetParent
    }
    mintop = el.offsetTop
    scrollstart = offset.top + mintop
    scrollend = Math.max(scrollstart, scrollstart + (config?.target ?? offsetParent).clientHeight - el.offsetHeight - 1)
    onscroll()
  }

  const { destroy, update } = watchForPositionChange(el.offsetParent as HTMLElement, onpositionchange)
  window.addEventListener('scroll', onscroll)

  function stickyUpdate (newConfig?: StickyArgs) {
    const targetmismatch = newConfig?.target !== config?.target
    if (newConfig?.store !== config?.store) newConfig?.store?.set({ floating })
    config = newConfig
    if (targetmismatch && el.offsetParent instanceof HTMLElement) onpositionchange(bodyOffset(el.offsetParent))
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
