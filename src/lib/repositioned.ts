import equal from 'fast-deep-equal'
import { bodyOffset } from './bodyoffset'

export type ElementOffsets = Partial<ReturnType<typeof bodyOffset>>

export function watchForPositionChange (el: HTMLElement|undefined, cb: (offset: Required<ElementOffsets>) => void) {
  let lastoffset: ElementOffsets = {}
  function watch () {
    if (!el) return
    const offset = bodyOffset(el)
    if (!equal(offset, lastoffset)) {
      lastoffset = offset
      cb(offset)
    }
  }
  let observer = new MutationObserver(watch)
  window.addEventListener('resize', watch, { passive: true })
  observer = new MutationObserver(watch)
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true
  })
  watch()

  return {
    update (newEl: HTMLElement, newCb: (offset: Required<ElementOffsets>) => void) {
      const changed = newEl !== el || newCb !== cb
      el = newEl
      cb = newCb
      if (changed) watch()
    },
    destroy () {
      window.removeEventListener('resize', watch)
      observer.disconnect()
    }
  }
}
