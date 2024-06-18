import type { SettableSubject } from '@txstate-mws/svelte-store'
import { watchForMutations } from '../util/index.js'
import { equal } from 'txstate-utils'
export type GlueAlignOpts = 'auto' | 'bottomleft' | 'bottomright' | 'topleft' | 'topright'

export interface GlueArgs<T extends GlueAlignStore = GlueAlignStore> {
  target: HTMLElement
  align?: GlueAlignOpts
  cover?: boolean
  gap?: number
  adjustparentheight?: boolean
  store?: SettableSubject<T>
}

export interface GlueAlignStore {
  valign: 'bottom' | 'top'
  halign: 'left' | 'right'
}

export function glue (el: HTMLElement, { target, align = 'auto', cover = false, gap = 0, adjustparentheight = false, store }: GlueArgs) {
  let halign: GlueAlignStore['halign']
  let valign: GlueAlignStore['valign']
  const parent: HTMLElement | undefined = el.offsetParent as HTMLElement
  const formerMinHeight: string | undefined = parent?.style.minHeight
  if (target) el.style.position = 'fixed'

  function adjustParentHeight () {
    if (!adjustparentheight) return
    if (parent?.style.overflowY === 'auto') return
    const minHeight = el.offsetTop + el.offsetHeight
    if (minHeight > (parent?.clientHeight ?? 0)) {
      requestAnimationFrame(() => {
        parent!.style.minHeight = String(minHeight) + 'px'
      })
    }
  }

  let lastrect: DOMRect | undefined
  function reposition () {
    const fixedParent = fixedContainingBlock(el)
    let fixedRect = { left: 0, top: 0, right: 0, bottom: 0 }
    if (fixedParent) {
      const tmpRect = fixedParent.getBoundingClientRect()
      fixedRect = { left: tmpRect.left, right: window.innerWidth - tmpRect.right, top: tmpRect.top, bottom: window.innerHeight - tmpRect.bottom }
    }
    if (!target) return
    const tmpRect = target.getBoundingClientRect()
    const rect = { left: tmpRect.left - fixedRect.left, right: window.innerWidth - tmpRect.right - fixedRect.right, top: tmpRect.top - fixedRect.top, bottom: window.innerHeight - tmpRect.bottom - fixedRect.bottom, width: tmpRect.width, height: tmpRect.height }
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
        el.style.top = `${rect.top + (cover ? 0 : targetHeight) + gap}px`
        el.style.left = `${rect.left}px`
        el.style.bottom = ''
        el.style.right = ''
        adjustParentHeight()
      })
      valign = 'bottom'
      halign = 'left'
    } else if (autoalign === 'bottomright') {
      requestAnimationFrame(() => {
        el.style.top = `${rect.top + (cover ? 0 : targetHeight) + gap}px`
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
        el.style.bottom = `${rect.bottom + (cover ? 0 : targetHeight) + gap}px`
        el.style.right = ''
        adjustParentHeight()
      })
      valign = 'top'
      halign = 'left'
    } else if (autoalign === 'topright') {
      requestAnimationFrame(() => {
        el.style.top = ''
        el.style.left = ''
        el.style.bottom = `${rect.bottom + (cover ? 0 : targetHeight) + gap}px`
        el.style.right = `${rect.right}px`
        adjustParentHeight()
      })
      valign = 'top'
      halign = 'right'
    }
    store?.update(v => ({ ...v, valign, halign }))
  }
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { destroy: watchDestroy } = watchForMutations(reposition)
  document.addEventListener('scroll', reposition, { capture: true })
  return {
    update ({ target: utarget, align: ualign = 'auto', cover: ucover = false, gap: ugap = 0, store: ustore }: GlueArgs) {
      align = ualign
      cover = ucover
      gap = ugap
      if (ustore && ustore !== store) {
        ustore.update(v => ({ ...v, valign, halign }))
        store = ustore
      }
      if (target !== utarget) {
        target = utarget
        if (!target) el.style.removeProperty('position')
        else {
          el.style.position = 'fixed'
          reposition()
        }
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

const isHTMLElement = (e: Element | null | undefined): e is HTMLElement =>
  !!e && 'offsetParent' in e

function isFixedContainer (el: HTMLElement) {
  const css = getComputedStyle(el)
  if (css.getPropertyValue('transform') !== 'none' || css.getPropertyValue('perspective') !== 'none') return true // A transform or perspective value other than none
  if (['transform', 'perspective', 'filter'].includes(css.getPropertyValue('will-change'))) return true // A will-change value of transform, filter, or perspective
  if (css.getPropertyValue('filter') !== 'none') return true // A filter value other than none
  if (['layout', 'paint', 'strict', 'content'].includes(css.getPropertyValue('contain'))) return true // A contain value of layout, paint, strict or content (e.g. contain: paint;)
  if (css.getPropertyValue('container-type') !== 'normal') return true // A container-type value other than normal
  if (css.getPropertyValue('backdrop-filter') !== 'none') return true // A backdrop-filter other than none (e.g. backdrop-filter: blur(10px);)
  return false
}
function fixedContainingBlock (el: HTMLElement) {
  let parent = el.parentElement
  while (isHTMLElement(parent) && !isFixedContainer(parent)) parent = parent.parentElement
  return parent
}
