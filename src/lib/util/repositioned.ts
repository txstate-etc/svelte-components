import { equal, isNotNull, randomid, toArray } from 'txstate-utils'
import { bodyOffset, targetOffset } from './bodyoffset.js'
import type { ElementOffsets } from './bodyoffset.js'

const observers = new Map<string, () => void>()
let mutationobserver: MutationObserver
export function watchForMutations (cb: () => void) {
  function watch () {
    for (const cb of observers.values()) cb()
  }

  if (observers.size === 0) {
    mutationobserver ??= new MutationObserver(watch)
    window.addEventListener('resize', watch, { passive: true })
    mutationobserver.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true
    })
  }

  const id = randomid()
  observers.set(id, cb)
  cb()

  return {
    destroy () {
      observers.delete(id)
      if (observers.size === 0) {
        window.removeEventListener('resize', watch)
        mutationobserver.disconnect()
      }
    }
  }
}

export function watchForPositionChange (el: (HTMLElement | undefined)[] | HTMLElement | undefined, cb: ((offset: Required<ElementOffsets>) => void) | ((offsets: Required<ElementOffsets>[]) => void)) {
  let lastoffsets: ElementOffsets[] = []
  let els = toArray(el).filter(isNotNull)
  function watch () {
    const offsets = els.map(bodyOffset)
    if (offsets.some((offset, i) => !equal(offset, lastoffsets[i]))) {
      lastoffsets = offsets
      Array.isArray(el) ? (cb as any)(offsets) : (cb as any)(offsets[0])
    }
  }

  const { destroy } = watchForMutations(watch)

  return {
    update (newEl: (HTMLElement | undefined)[] | HTMLElement | undefined, newCb: ((offset: Required<ElementOffsets>) => void) | ((offsets: Required<ElementOffsets>[]) => void)) {
      const changed = newEl !== el || newCb !== cb
      if (changed) {
        el = newEl
        els = toArray(el).filter(isNotNull)
        cb = newCb
        watch()
      }
    },
    destroy
  }
}

export function watchForPositionChangeInContainer (el: HTMLElement | undefined, container: HTMLElement | undefined, cb: (offset: Required<ElementOffsets>) => void) {
  let lastoffset: ElementOffsets

  function watch () {
    if (!el || !container) return
    const offset = targetOffset(el, container)
    if (!equal(offset, lastoffset)) {
      lastoffset = offset
      cb(offset)
    }
  }

  const { destroy } = watchForMutations(watch)

  return {
    update (newEl: HTMLElement | undefined, newContainer: HTMLElement | undefined, newCb: (offset: Required<ElementOffsets>) => void) {
      const changed = newEl !== el || newContainer !== container || newCb !== cb
      if (changed) {
        el = newEl
        container = newContainer
        cb = newCb
        watch()
      }
    },
    destroy
  }
}
