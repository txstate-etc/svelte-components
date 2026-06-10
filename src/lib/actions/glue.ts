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
  target?: HTMLElement
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
 * A measure function reads the current geometry of one glued element and returns a
 * thunk that performs the resulting DOM writes (or undefined when nothing changed).
 */
type GlueMeasure = () => (() => void) | undefined

/**
 * All active glue instances share one scroll listener and one requestAnimationFrame
 * per frame. Each frame runs every registered measure() (the layout reads) and only
 * then runs the write thunks they return, so for a page with thousands of glued
 * elements the browser reads layout once per frame and never interleaves reads with
 * writes. Multiple scroll events that arrive before a frame paints coalesce into a
 * single measure pass.
 */
const glueInstances = new Set<GlueMeasure>()
let frameRequested = false
let scrollBound = false

function runGlueFrame () {
  frameRequested = false
  const writes: (() => void)[] = []
  for (const measure of glueInstances) {
    const write = measure()
    if (write) writes.push(write)
  }
  for (const write of writes) write()
}

function scheduleGlueFrame () {
  if (frameRequested) return
  frameRequested = true
  requestAnimationFrame(runGlueFrame)
}

function onGlueScroll () {
  scheduleGlueFrame()
}

function registerGlue (measure: GlueMeasure) {
  glueInstances.add(measure)
  if (!scrollBound) {
    document.addEventListener('scroll', onGlueScroll, { capture: true, passive: true })
    scrollBound = true
  }
}

function unregisterGlue (measure: GlueMeasure) {
  glueInstances.delete(measure)
  if (glueInstances.size === 0 && scrollBound) {
    document.removeEventListener('scroll', onGlueScroll, { capture: true })
    scrollBound = false
  }
}

/**
 * Make this element `position: fixed` and move it around to align with the target element.
 */
export function glue (el: HTMLElement, { target, align = 'auto', cover = false, gap = 0, adjustparentheight = false, store }: GlueArgs) {
  let halign: GlueAlignStore['halign']
  let valign: GlueAlignStore['valign']
  const parent = el.offsetParent instanceof HTMLElement ? el.offsetParent : undefined

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
  // The containing block (nearest ancestor that establishes a containing block for
  // position: fixed) is determined by the ancestors' computed styles. Scrolling can
  // never change it, but it CAN change when an ancestor gains/loses a transform,
  // filter, will-change, contain, etc. Walking the ancestor chain and calling
  // getComputedStyle on each node is expensive, so cache it across the high-frequency
  // scroll events and recompute only when something might have changed: a DOM/style
  // mutation, a resize, or a target change (see invalidateAndSchedule / update).
  let fixedParent: HTMLElement | null | undefined
  let fixedParentComputed = false

  // Read-only pass: gather geometry and build the write thunk. Runs inside the shared
  // frame's measure phase, so it must not write to the DOM.
  function measure (): (() => void) | undefined {
    if (!fixedParentComputed) {
      fixedParent = fixedContainingBlock(el)
      fixedParentComputed = true
    }
    let fixedRect = { left: 0, top: 0, right: 0, bottom: 0 }
    if (fixedParent) {
      const tmpRect = fixedParent.getBoundingClientRect()
      fixedRect = { left: tmpRect.left, right: document.documentElement.clientWidth - tmpRect.right, top: tmpRect.top, bottom: document.documentElement.clientHeight - tmpRect.bottom }
    }
    if (!target) return undefined
    const tmpRect = target.getBoundingClientRect()
    const rect = { left: tmpRect.left - fixedRect.left, right: document.documentElement.clientWidth - tmpRect.right - fixedRect.right, top: tmpRect.top - fixedRect.top, bottom: document.documentElement.clientHeight - tmpRect.bottom - fixedRect.bottom, width: tmpRect.width, height: tmpRect.height }
    if (equal(rect, lastrect)) return undefined
    lastrect = rect

    let autoalign: GlueAlignOpts = align
    const leftright = rect.right > rect.left ? 'left' : 'right'
    const topbottom = rect.bottom > rect.top ? 'bottom' : 'top'
    if (align === 'auto') {
      autoalign = topbottom + leftright
    } else if (align === 'autoleft') {
      autoalign = topbottom + 'left'
    } else if (align === 'autoright') {
      autoalign = topbottom + 'right'
    } else if (align === 'topauto') {
      autoalign = 'top' + leftright
    } else if (align === 'bottomauto') {
      autoalign = 'bottom' + leftright
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
    let position: (() => void) | undefined
    if (autoalign === 'bottomleft') {
      position = () => {
        el.style.top = `${rect.top + (cover ? 0 : targetHeight) + gap}px`
        el.style.left = `${rect.left}px`
        el.style.removeProperty('bottom')
        el.style.removeProperty('right')
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      }
      valign = 'bottom'
      halign = 'left'
    } else if (autoalign === 'bottomright') {
      position = () => {
        el.style.top = `${rect.top + (cover ? 0 : targetHeight) + gap}px`
        el.style.removeProperty('left')
        el.style.removeProperty('bottom')
        el.style.right = `${rect.right}px`
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      }
      valign = 'bottom'
      halign = 'right'
    } else if (autoalign === 'topleft') {
      position = () => {
        el.style.removeProperty('top')
        el.style.left = `${rect.left}px`
        el.style.bottom = `${rect.bottom + (cover ? 0 : targetHeight) + gap}px`
        el.style.removeProperty('right')
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      }
      valign = 'top'
      halign = 'left'
    } else if (autoalign === 'topright') {
      position = () => {
        el.style.removeProperty('top')
        el.style.removeProperty('left')
        el.style.bottom = `${rect.bottom + (cover ? 0 : targetHeight) + gap}px`
        el.style.right = `${rect.right}px`
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      }
      valign = 'top'
      halign = 'right'
    } else if (autoalign === 'top') {
      position = () => {
        el.style.removeProperty('top')
        el.style.left = `${rect.left + rect.width / 2 - elWidth / 2}px`
        el.style.bottom = `${rect.bottom + (cover ? 0 : targetHeight) + gap}px`
        el.style.removeProperty('right')
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      }
      valign = 'top'
      halign = 'center'
    } else if (autoalign === 'bottom') {
      position = () => {
        el.style.top = `${rect.top + (cover ? 0 : targetHeight) + gap}px`
        el.style.left = `${rect.left + rect.width / 2 - elWidth / 2}px`
        el.style.removeProperty('bottom')
        el.style.removeProperty('right')
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      }
      valign = 'bottom'
      halign = 'center'
    } else if (autoalign === 'left') {
      position = () => {
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
      }
      valign = 'center'
      halign = 'left'
    } else if (autoalign === 'right') {
      position = () => {
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
      }
      valign = 'center'
      halign = 'right'
    } else if (autoalign === 'middle') {
      position = () => {
        el.style.top = `${rect.top + rect.height / 2 - elHeight / 2}px`
        el.style.left = `${rect.left + rect.width / 2 - elWidth / 2}px`
        el.style.removeProperty('bottom')
        el.style.removeProperty('right')
        adjustParentHeight(elOffsetTop, elOffsetHeight, parentClientHeight, parentOverflowY)
      }
      valign = 'center'
      halign = 'center'
    }
    const fvalign = valign
    const fhalign = halign
    return () => {
      position?.()
      store?.update(v => ({ ...v, valign: fvalign, halign: fhalign }))
    }
  }

  function invalidateAndSchedule () {
    // A mutation or resize may have changed which ancestor is the containing block.
    fixedParentComputed = false
    scheduleGlueFrame()
  }

  const { destroy: watchDestroy } = watchForMutations(invalidateAndSchedule)
  registerGlue(measure)
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
          fixedParentComputed = false
        }
        scheduleGlueFrame()
      }
    },
    destroy () {
      unregisterGlue(measure)
      watchDestroy()
      if (adjustparentheight && parent) {
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
