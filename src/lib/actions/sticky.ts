import type { SettableSubject } from '@txstate-mws/svelte-store'
import { bodyOffset, watchForPositionChange } from '../util/index.js'
import type { ElementOffsets } from '../util/index.js'

export interface StickyArgs <T extends StickyStore = StickyStore> {
  target?: HTMLElement
  store?: SettableSubject<T>
}

export interface StickyStore {
  floating?: boolean
  translateY?: number
}

let scrolled = false

/**
 * A robust implementation of stickyness based on `transform: translateY()`. Only use when
 * `position: sticky` won't work for you. If `position: sticky` does work for you, use it,
 * it performs better.
 *
 * Reasons `position: sticky` might not work:
 * 1) it cannot work on a thead or tr, only td and th (and non-table elements)
 * 2) it gets confused if any parent elements have an `overflow` set, even `overflow: hidden`
 * 3) it always stays within the boundaries of the closest parent element that has a `position`
 *     * use:sticky accepts a `target` element as a parameter, defining the bounding container
 *
 * Note that if the element you place this on has other transforms, this is going to overwrite them.
 *
 * The main drawback to this approach is that it cannot do its work before scroll on mobile, only after,
 * so on mobile you are going to see it visually lag a little during scrolling.
 *
 * You may also want to try use:stickyfixed. It is based on setting `position: fixed` when appropriate,
 * and therefore animates better than this. However, it has a lot more work to do and is more
 * fragile if your markup/CSS situation is very complex.
 */
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
