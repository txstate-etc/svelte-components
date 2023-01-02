import type { SettableSubject } from '@txstate-mws/svelte-store'
import { sharedOffsetParent, targetOffset, watchForPositionChangeInContainer } from '../util/index.js'
import type { ElementOffsets } from '../util/index.js'
export type GlueAlignOpts = 'auto' | 'bottomleft' | 'bottomright' | 'topleft' | 'topright'

export interface GlueArgs<T extends GlueAlignStore = GlueAlignStore> {
  target: HTMLElement
  align?: GlueAlignOpts
  cover?: boolean
  adjustparentheight?: boolean
  store?: SettableSubject<T>
}

export interface GlueAlignStore {
  valign: 'bottom' | 'top'
  halign: 'left' | 'right'
}

let setBodyRelative = false
export function glue (el: HTMLElement, { target, align = 'auto', cover = false, adjustparentheight = false, store }: GlueArgs) {
  if (!setBodyRelative) {
    setBodyRelative = true
    document.body.style.position = 'relative'
  }
  let halign: GlueAlignStore['halign']
  let valign: GlueAlignStore['valign']
  const parent: HTMLElement = el.offsetParent as HTMLElement
  const formerMinHeight: string | undefined = parent.style.minHeight
  let sharedOffset = sharedOffsetParent(el, target)

  function reposition (offset: Required<ElementOffsets>) {
    if (!target || !sharedOffset || !(el.offsetParent instanceof HTMLElement)) return
    let autoalign = align
    const parentoffset = el.offsetParent === sharedOffset && target !== sharedOffset ? { top: 0, left: 0, bottom: 0, right: 0 } : targetOffset(el.offsetParent, sharedOffset)
    if (align === 'auto') {
      const rect = target.getBoundingClientRect()
      const leftright = window.innerWidth - rect.right > rect.left ? 'left' : 'right'
      const topbottom = window.innerHeight - rect.bottom > rect.top ? 'bottom' : 'top'
      autoalign = topbottom + leftright as 'auto'
    }
    function adjustParentHeight () {
      if (!adjustparentheight) return
      if (parent.style.overflowY === 'auto') return
      const minHeight = el.offsetTop + el.offsetHeight
      if (minHeight > parent.clientHeight) {
        requestAnimationFrame(() => {
          parent.style.minHeight = String(minHeight) + 'px'
        })
      }
    }
    const targetHeight = target.offsetHeight
    if (autoalign === 'bottomleft') {
      requestAnimationFrame(() => {
        el.style.top = `${offset.top + (cover ? 0 : targetHeight) - parentoffset.top}px`
        el.style.left = `${offset.left - parentoffset.left}px`
        el.style.bottom = ''
        el.style.right = ''
        adjustParentHeight()
      })
      valign = 'bottom'
      halign = 'left'
    } else if (autoalign === 'bottomright') {
      requestAnimationFrame(() => {
        el.style.top = `${offset.top + (cover ? 0 : targetHeight) - parentoffset.top}px`
        el.style.left = ''
        el.style.bottom = ''
        el.style.right = `${offset.right - parentoffset.right}px`
        adjustParentHeight()
      })
      valign = 'bottom'
      halign = 'right'
    } else if (autoalign === 'topleft') {
      requestAnimationFrame(() => {
        el.style.top = ''
        el.style.left = `${offset.left - parentoffset.left}px`
        el.style.bottom = `${offset.bottom + (cover ? 0 : targetHeight) - parentoffset.bottom}px`
        el.style.right = ''
        adjustParentHeight()
      })
      valign = 'top'
      halign = 'left'
    } else if (autoalign === 'topright') {
      requestAnimationFrame(() => {
        el.style.top = ''
        el.style.left = ''
        el.style.bottom = `${offset.bottom + (cover ? 0 : targetHeight) - parentoffset.bottom}px`
        el.style.right = `${offset.right - parentoffset.right}px`
        adjustParentHeight()
      })
      valign = 'top'
      halign = 'right'
    }
    store?.update(v => ({ ...v, valign, halign }))
  }
  const { destroy: watchDestroy, update } = watchForPositionChangeInContainer(target, sharedOffset, reposition)

  return {
    update ({ target: utarget, align: ualign = 'auto', cover: ucover = false, store: ustore }: GlueArgs) {
      align = ualign
      cover = ucover
      if (ustore && ustore !== store) {
        ustore.update(v => ({ ...v, valign, halign }))
        store = ustore
      }
      if (target !== utarget) {
        sharedOffset = sharedOffsetParent(el, utarget)
        target = utarget
        update(target, sharedOffset, reposition)
      }
    },
    destroy () {
      watchDestroy()
      if (adjustparentheight) {
        if (formerMinHeight) parent.style.minHeight = formerMinHeight
        parent.style.removeProperty('min-height')
      }
    }
  }
}
