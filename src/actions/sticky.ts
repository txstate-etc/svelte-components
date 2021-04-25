import { bodyOffset, SettableSubject, ElementOffsets, watchForPositionChange } from '../lib'

export interface StickyArgs <T extends StickyStore = StickyStore> {
  target?: HTMLElement
  store?: SettableSubject<T>
}

export interface StickyStore {
  floating?: boolean
  translateY?: number
}

let scrolled = false

export function sticky (el: HTMLElement, config?: StickyArgs) {
  let floating: boolean
  let translateY: number
  let scrollstart = Number.MAX_SAFE_INTEGER
  let scrollend = Number.MAX_SAFE_INTEGER

  function recalc (scroll: number) {
    const newTranslateY = Math.max(Math.min(scroll, scrollend) - scrollstart, 0)
    if (newTranslateY !== translateY) {
      el.style.transform = `translateY(${newTranslateY}px)`
      translateY = newTranslateY
      floating = scroll >= scrollstart
      config?.store?.update(v => ({ ...v, translateY, floating }))
    }
  }

  function onscroll (e: Event) {
    recalc(window.scrollY)
  }

  function onwheel (e: WheelEvent) {
    e.preventDefault()
    const scroll = window.scrollY + e.deltaY
    recalc(scroll)
    if (!scrolled) {
      window.scrollTo({ top: scroll })
      scrolled = true
      setTimeout(() => {
        scrolled = false
      }, 0)
    }
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
    recalc(window.scrollY)
  }

  const { destroy, update } = watchForPositionChange([el.offsetParent as HTMLElement, config?.target], onpositionchange)
  window.addEventListener('scroll', onscroll, { passive: true })
  window.addEventListener('wheel', onwheel, { passive: false })

  function stickyUpdate (newConfig?: StickyArgs) {
    if (newConfig?.store !== config?.store) newConfig?.store?.update(v => ({ ...v, translateY, floating }))
    config = newConfig
    update([el.offsetParent as HTMLElement, config?.target], onpositionchange)
  }

  function stickyDestroy () {
    window.removeEventListener('scroll', onscroll)
    window.removeEventListener('wheel', onwheel)
    destroy()
  }

  return {
    update: stickyUpdate,
    destroy: stickyDestroy
  }
}
