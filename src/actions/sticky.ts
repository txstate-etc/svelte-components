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

  let scrollTimer: number
  function onscroll () {
    const scroll = window.scrollY
    const wasFloating = floating
    floating = scroll >= scrollstart
    if (floating !== wasFloating) config?.store?.update(v => ({ ...v, floating }))
    cancelAnimationFrame(scrollTimer)
    scrollTimer = requestAnimationFrame(() => {
      el.style.transform = `translateY(${Math.max(Math.min(scroll, scrollend) - scrollstart, 0)}px)`
    })
  }

  let lastOffsetParent: HTMLElement = el.offsetParent as HTMLElement
  function onpositionchange (offset: Required<ElementOffsets>[]) {
    const offsetParent = el.offsetParent
    if (!(offsetParent instanceof HTMLElement)) return
    if (lastOffsetParent !== offsetParent) {
      offset[0] = bodyOffset(offsetParent)
      update(offsetParent, onpositionchange)
      lastOffsetParent = offsetParent
    }
    scrollstart = offset[0].top + el.offsetTop
    const containeroffset = config?.target ? offset[1] : offset[0]
    scrollend = Math.max(scrollstart, containeroffset.top + (config?.target ?? offsetParent).clientHeight - el.offsetHeight)
    onscroll()
  }

  const { destroy, update } = config?.target
    ? watchForPositionChange([el.offsetParent as HTMLElement, config.target], onpositionchange)
    : watchForPositionChange([el.offsetParent as HTMLElement], onpositionchange)
  window.addEventListener('scroll', onscroll)

  function stickyUpdate (newConfig?: StickyArgs) {
    update(newConfig?.target ? [el.offsetParent as HTMLElement, newConfig.target] : [el.offsetParent as HTMLElement], onpositionchange)
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
