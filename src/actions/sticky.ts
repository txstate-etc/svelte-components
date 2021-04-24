import { bodyOffset, SettableSubject } from '../lib'
import { ElementOffsets, watchForPositionChange } from '../lib/repositioned'

export interface StickyArgs <T extends StickyStore = StickyStore> {
  target?: HTMLElement
  store?: SettableSubject<T>
}

export interface StickyStore {
  floating?: boolean
  translateY?: number
}

export function sticky (el: HTMLElement, config?: StickyArgs) {
  let floating: boolean
  let translateY: number
  let scrollstart = Number.MAX_SAFE_INTEGER
  let scrollend = Number.MAX_SAFE_INTEGER

  function onscroll () {
    const scroll = window.scrollY
    floating = scroll >= scrollstart
    translateY = Math.max(Math.min(scroll - 1, scrollend) - scrollstart, 0)
    config?.store?.update(v => ({ ...v, translateY, floating }))
    el.style.transform = `translateY(${translateY}px)`
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

  const { destroy, update } = watchForPositionChange([el.offsetParent as HTMLElement, config?.target], onpositionchange)
  window.addEventListener('scroll', onscroll)

  function stickyUpdate (newConfig?: StickyArgs) {
    if (newConfig?.store !== config?.store) newConfig?.store?.update(v => ({ ...v, translateY, floating }))
    config = newConfig
    update([el.offsetParent as HTMLElement, config?.target], onpositionchange)
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
