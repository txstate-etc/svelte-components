import equal from 'fast-deep-equal'
import { isNotNull, toArray } from 'txstate-utils'
import { bodyOffset } from './bodyoffset'

export type ElementOffsets = Partial<ReturnType<typeof bodyOffset>>

export function watchForPositionChange (el: (HTMLElement|undefined)[]|HTMLElement|undefined, cb: ((offset: Required<ElementOffsets>) => void)|((offsets: Required<ElementOffsets>[]) => void)) {
  let lastoffsets: ElementOffsets[] = []
  let els = toArray(el).filter(isNotNull)
  function watch () {
    const offsets = els.map(bodyOffset)
    if (offsets.some((offset, i) => !equal(offset, lastoffsets[i]))) {
      lastoffsets = offsets
      Array.isArray(el) ? (cb as any)(offsets) : (cb as any)(offsets[0])
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
    update (newEl: (HTMLElement|undefined)[]|HTMLElement|undefined, newCb: ((offset: Required<ElementOffsets>) => void)|((offsets: Required<ElementOffsets>[]) => void)) {
      const changed = newEl !== el || newCb !== cb
      if (changed) {
        el = newEl
        els = toArray(el).filter(isNotNull)
        cb = newCb
        watch()
      }
    },
    destroy () {
      window.removeEventListener('resize', watch)
      observer.disconnect()
    }
  }
}
