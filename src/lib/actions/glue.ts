import type { SettableSubject } from '@txstate-mws/svelte-store'
import { watchForMutations } from '../util/index.js'
import { equal } from 'txstate-utils'
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

export function glue (el: HTMLElement, { target, align = 'auto', cover = false, adjustparentheight = false, store }: GlueArgs) {
  let halign: GlueAlignStore['halign']
  let valign: GlueAlignStore['valign']
  const parent: HTMLElement = el.offsetParent as HTMLElement
  const formerMinHeight: string | undefined = parent.style.minHeight
  if (target) el.style.position = 'fixed'

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

  let lastrect: DOMRect | undefined
  function reposition () {
    const tmpRect = target.getBoundingClientRect()
    const rect = { left: tmpRect.left, right: window.innerWidth - tmpRect.right, top: tmpRect.top, bottom: window.innerHeight - tmpRect.bottom, width: tmpRect.width, height: tmpRect.height }
    if (equal(rect, lastrect)) return

    let autoalign = align
    if (align === 'auto') {
      const leftright = rect.right > rect.left ? 'left' : 'right'
      const topbottom = rect.bottom > rect.top ? 'bottom' : 'top'
      autoalign = topbottom + leftright as 'auto'
    }
    const targetHeight = rect.height
    if (autoalign === 'bottomleft') {
      requestAnimationFrame(() => {
        el.style.top = `${rect.top + (cover ? 0 : targetHeight)}px`
        el.style.left = `${rect.left}px`
        el.style.bottom = ''
        el.style.right = ''
        adjustParentHeight()
      })
      valign = 'bottom'
      halign = 'left'
    } else if (autoalign === 'bottomright') {
      requestAnimationFrame(() => {
        el.style.top = `${rect.top + (cover ? 0 : targetHeight)}px`
        el.style.left = ''
        el.style.bottom = ''
        el.style.right = `${rect.right}px`
        adjustParentHeight()
      })
      valign = 'bottom'
      halign = 'right'
    } else if (autoalign === 'topleft') {
      requestAnimationFrame(() => {
        el.style.top = ''
        el.style.left = `${rect.left}px`
        el.style.bottom = `${rect.bottom + (cover ? 0 : targetHeight)}px`
        el.style.right = ''
        adjustParentHeight()
      })
      valign = 'top'
      halign = 'left'
    } else if (autoalign === 'topright') {
      requestAnimationFrame(() => {
        el.style.top = ''
        el.style.left = ''
        el.style.bottom = `${rect.bottom + (cover ? 0 : targetHeight)}px`
        el.style.right = `${rect.right}px`
        adjustParentHeight()
      })
      valign = 'top'
      halign = 'right'
    }
    store?.update(v => ({ ...v, valign, halign }))
  }
  const { destroy: watchDestroy } = watchForMutations(reposition)
  document.addEventListener('scroll', reposition, { capture: true })
  return {
    update ({ target: utarget, align: ualign = 'auto', cover: ucover = false, store: ustore }: GlueArgs) {
      align = ualign
      cover = ucover
      if (ustore && ustore !== store) {
        ustore.update(v => ({ ...v, valign, halign }))
        store = ustore
      }
      if (target !== utarget) {
        target = utarget
        if (!target) el.style.removeProperty('position')
        else el.style.position = 'fixed'
      }
    },
    destroy () {
      watchDestroy()
      document.removeEventListener('scroll', reposition)
      if (adjustparentheight) {
        if (formerMinHeight) parent.style.minHeight = formerMinHeight
        parent.style.removeProperty('min-height')
      }
    }
  }
}
