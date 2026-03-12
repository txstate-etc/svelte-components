import type { SettableSubject } from '@txstate-mws/svelte-store'
import { watchForMutations } from '../util/index.js'
import { equal } from 'txstate-utils'
export type GlueAlignOpts = 'auto' | 'bottomleft' | 'bottomright' | 'topleft' | 'topright' | 'top' | 'bottom' | 'left' | 'right' | 'autoleft' | 'autoright' | 'topauto' | 'bottomauto' | 'automiddle' | 'middleauto' | 'middle'

export interface GlueArgs<T extends GlueAlignStore = GlueAlignStore> {
  /**
   * The HTML element to which the element should be glued. The target remains where
   * it is; the element you placed the glue action on will become position: fixed and
   * move to align with the target.
   */
  target: HTMLElement
  /**
   * How to align the element relative to the target.
   *
   * Corner alignments:
   * - `topleft`: element's bottom-left corner meets target's top-left corner
   * - `topright`: element's bottom-right corner meets target's top-right corner
   * - `bottomleft`: element's top-left corner meets target's bottom-left corner
   * - `bottomright`: element's top-right corner meets target's bottom-right corner
   *
   * Side alignments (centered on the midpoint of the side):
   * - `top`: element centered above target
   * - `bottom`: element centered below target
   * - `left`: element centered to the left of target
   * - `right`: element centered to the right of target
   *
   * Auto alignments (choose based on available viewport space):
   * - `auto`: choose between all four corners
   * - `autoleft`: choose between `topleft` and `bottomleft`
   * - `autoright`: choose between `topright` and `bottomright`
   * - `topauto`: choose between `topleft` and `topright`
   * - `bottomauto`: choose between `bottomleft` and `bottomright`
   * - `automiddle`: choose between `top` and `bottom`
   * - `middleauto`: choose between `left` and `right`
   * - `middle`: choose between `top`, `bottom`, `left`, and `right`, or with `cover` set to true, simply center over the target
   *
   * When `cover` is false (default), the element is placed adjacent to the target.
   * When `cover` is true, the element overlaps the target from the aligned side.
   *
   * @default 'auto'
   */
  align?: GlueAlignOpts
  /**
   * Adjusts the alignment setting behavior such that now the element will cover the target.
   */
  cover?: boolean
  /**
   * A pixel margin between the element and the target. When used with `cover`, will reveal
   * a gap's worth of pixels of the target.
   */
  gap?: number
  /**
   * When true, increases the parent element's `min-height` to account for
   * the positioned element's size, preventing the parent from collapsing
   * when its child becomes `position: fixed`. Ignored if the parent has
   * `overflow-y: auto`. The original `min-height` is restored on destroy.
   *
   * @default false
   */
  adjustparentheight?: boolean
  /**
   * The store that contains information about the alignment of the element. With align
   * set to `auto`, this will tell you quickly which alignment is currently active.
   */
  store?: SettableSubject<T>
}

export interface GlueAlignStore {
  valign: 'bottom' | 'top' | 'center'
  halign: 'left' | 'right' | 'center'
}

/**
 * Make this element `position: fixed` and move it around to align with the target element.
 */
export function glue (el: HTMLElement, { target, align = 'auto', cover = false, gap = 0, adjustparentheight = false, store }: GlueArgs) {
  let halign: GlueAlignStore['halign']
  let valign: GlueAlignStore['valign']
  const parent: HTMLElement | undefined = el.offsetParent as HTMLElement
  const formerMinHeight: string | undefined = parent?.style.minHeight
  if (target) el.style.position = 'fixed'

  function adjustParentHeight (elOffsetTop: number, elOffsetHeight: number, parentClientHeight: number, parentOverflowY: string | undefined) {
    if (!adjustparentheight) return
    if (parentOverflowY === 'auto') return
    const minHeight = elOffsetTop + elOffsetHeight
    if (minHeight > parentClientHeight) {
      parent!.style.minHeight = String(minHeight) + 'px'
    }
  }

  let lastrect: { left: number, right: number, top: number, bottom: number, width: number, height: number } | undefined
  let timer: number | undefined
  function reposition () {
    const fixedParent = fixedContainingBlock(el)
    let fixedRect = { left: 0, top: 0, right: 0, bottom: 0 }
    if (fixedParent) {
      const tmpRect = fixedParent.getBoundingClientRect()
      fixedRect = { left: tmpRect.left, right: document.documentElement.clientWidth - tmpRect.right, top: tmpRect.top, bottom: document.documentElement.clientHeight - tmpRect.bottom }
    }
    if (!target) return
    const tmpRect = target.getBoundingClientRect()
    const rect = { left: tmpRect.left - fixedRect.left, right: document.documentElement.clientWidth - tmpRect.right - fixedRect.right, top: tmpRect.top - fixedRect.top, bottom: document.documentElement.clientHeight - tmpRect.bottom - fixedRect.bottom, width: tmpRect.width, height: tmpRect.height }
    if (equal(rect, lastrect)) return
    lastrect = rect

    let autoalign: GlueAlignOpts = align
    const leftright = rect.right > rect.left ? 'left' : 'right'
    const topbottom = rect.bottom > rect.top ? 'bottom' : 'top'
    if (align === 'auto') {
      autoalign = (topbottom + leftright) as GlueAlignOpts
    } else if (align === 'autoleft') {
      autoalign = (topbottom + 'left') as GlueAlignOpts
    } else if (align === 'autoright') {
      autoalign = (topbottom + 'right') as GlueAlignOpts
    } else if (align === 'topauto') {
      autoalign = ('top' + leftright) as GlueAlignOpts
    } else if (align === 'bottomauto') {
      autoalign = ('bottom' + leftright) as GlueAlignOpts
    } else if (align === 'automiddle') {
      autoalign = topbottom
    } else if (align === 'middleauto') {
      autoalign = leftright
    } else if (align === 'middle') {
      if (cover) {
        autoalign = 'middle'
      } else {
        const maxSpace = Math.max(rect.top, rect.bottom, rect.left, rect.right)
        if (maxSpace === rect.bottom) autoalign = 'bottom'
        else if (maxSpace === rect.top) autoalign = 'top'
        else if (maxSpace === rect.right) autoalign = 'right'
        else autoalign = 'left'
      }
    }
    const targetHeight = rect.height
    const elRect = el.getBoundingClientRect()
    const elWidth = elRect.width
    const elHeight = elRect.height
    const elOffsetTop = el.offsetTop
    const elOffsetHeight = el.offsetHeight
    const parentClientHeight = parent?.clientHeight ?? 0
    const parentOverflowY = parent?.style.overflowY
    if (autoalign === 'bottomleft') {
      cancelAnimationFrame(timer!)
      timer = requestAnimationFrame(() => {
        el.style.top = `${rect.top + (cover ? 0 : targetHeight) + gap}px`
        el.style.left = `${rect.left}px`
        el.style.removeProperty('bottom')
        el.style.removeProperty('right')
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      })
      valign = 'bottom'
      halign = 'left'
    } else if (autoalign === 'bottomright') {
      cancelAnimationFrame(timer!)
      timer = requestAnimationFrame(() => {
        el.style.top = `${rect.top + (cover ? 0 : targetHeight) + gap}px`
        el.style.removeProperty('left')
        el.style.removeProperty('bottom')
        el.style.right = `${rect.right}px`
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      })
      valign = 'bottom'
      halign = 'right'
    } else if (autoalign === 'topleft') {
      cancelAnimationFrame(timer!)
      timer = requestAnimationFrame(() => {
        el.style.removeProperty('top')
        el.style.left = `${rect.left}px`
        el.style.bottom = `${rect.bottom + (cover ? 0 : targetHeight) + gap}px`
        el.style.removeProperty('right')
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      })
      valign = 'top'
      halign = 'left'
    } else if (autoalign === 'topright') {
      cancelAnimationFrame(timer!)
      timer = requestAnimationFrame(() => {
        el.style.removeProperty('top')
        el.style.removeProperty('left')
        el.style.bottom = `${rect.bottom + (cover ? 0 : targetHeight) + gap}px`
        el.style.right = `${rect.right}px`
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      })
      valign = 'top'
      halign = 'right'
    } else if (autoalign === 'top') {
      cancelAnimationFrame(timer!)
      timer = requestAnimationFrame(() => {
        el.style.removeProperty('top')
        el.style.left = `${rect.left + rect.width / 2 - elWidth / 2}px`
        el.style.bottom = `${rect.bottom + (cover ? 0 : targetHeight) + gap}px`
        el.style.removeProperty('right')
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      })
      valign = 'top'
      halign = 'center'
    } else if (autoalign === 'bottom') {
      cancelAnimationFrame(timer!)
      timer = requestAnimationFrame(() => {
        el.style.top = `${rect.top + (cover ? 0 : targetHeight) + gap}px`
        el.style.left = `${rect.left + rect.width / 2 - elWidth / 2}px`
        el.style.removeProperty('bottom')
        el.style.removeProperty('right')
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      })
      valign = 'bottom'
      halign = 'center'
    } else if (autoalign === 'left') {
      cancelAnimationFrame(timer!)
      timer = requestAnimationFrame(() => {
        el.style.top = `${rect.top + rect.height / 2 - elHeight / 2}px`
        el.style.removeProperty('bottom')
        if (cover) {
          el.style.left = `${rect.left + gap}px`
          el.style.removeProperty('right')
        } else {
          el.style.removeProperty('left')
          el.style.right = `${rect.right + rect.width + gap}px`
        }
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      })
      valign = 'center'
      halign = 'left'
    } else if (autoalign === 'right') {
      cancelAnimationFrame(timer!)
      timer = requestAnimationFrame(() => {
        el.style.top = `${rect.top + rect.height / 2 - elHeight / 2}px`
        el.style.removeProperty('bottom')
        if (cover) {
          el.style.removeProperty('left')
          el.style.right = `${rect.right + gap}px`
        } else {
          el.style.left = `${rect.left + rect.width + gap}px`
          el.style.removeProperty('right')
        }
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      })
      valign = 'center'
      halign = 'right'
    } else if (autoalign === 'middle') {
      cancelAnimationFrame(timer!)
      timer = requestAnimationFrame(() => {
        el.style.top = `${rect.top + rect.height / 2 - elHeight / 2}px`
        el.style.left = `${rect.left + rect.width / 2 - elWidth / 2}px`
        el.style.removeProperty('bottom')
        el.style.removeProperty('right')
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      })
      valign = 'center'
      halign = 'center'
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
  if ('container-type' in css && css.getPropertyValue('container-type') !== 'normal') return true // A container-type value other than normal
  if ('backdrop-filter' in css && css.getPropertyValue('backdrop-filter') !== 'none') return true // A backdrop-filter other than none (e.g. backdrop-filter: blur(10px);)
  return false
}
function fixedContainingBlock (el: HTMLElement) {
  let parent = el.parentElement
  while (isHTMLElement(parent) && !isFixedContainer(parent)) parent = parent.parentElement
  return parent
}
