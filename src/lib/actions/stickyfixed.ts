import { bodyOffset, watchForPositionChange } from '../util/index.js'
import type { ElementOffsets } from '../util/index.js'
import type { StickyArgs } from './sticky.js'

/**
 * An implementation of stickyness based on `positon: fixed`. Only use when
 * `position: sticky` won't work for you. If `position: sticky` does work for you, use it,
 * it performs better.
 *
 * Reasons `position: sticky` might not work:
 * 1) it cannot work on a thead or tr, only td and th (and non-table elements)
 * 2) it gets confused if any parent elements have an `overflow` set, even `overflow: hidden`
 * 3) it always stays within the boundaries of the closest parent element that has a `position`
 *     * use:sticky accepts a `target` element as a parameter, defining the bounding container
 *
 * Note that this implementation gets great animation performance at the cost of extra complexity.
 * It does a lot of work like cloning the element you place it on, placing the cloned element next
 * to yours in the DOM, setting widths to match between them, watching for mutations to keep them
 * in sync, etc. Some of this work may get foiled if you have a complex html/css/js situation.
 *
 * You may also want to try use:sticky. It is based on setting `transform: translateY()` as appropriate,
 * and is less fragile than this. However, it cannot do its work before the scroll on mobile, only after,
 * so it will visually lag a bit on mobile.
 */
export function stickyfixed (el: HTMLElement, config?: StickyArgs) {
  let floating: boolean
  let translateY: number
  let scrollstart = Number.MAX_SAFE_INTEGER
  let scrollend = Number.MAX_SAFE_INTEGER
  let spacer: HTMLElement
  let elheight: number
  let left: number
  let top = 0

  function generatespacer (mutations?: MutationRecord[]) {
    if (mutations?.every(m => m.attributeName === 'style')) return
    spacer?.remove()
    spacer = el.cloneNode(true) as HTMLElement
    spacer.setAttribute('aria-hidden', 'true')
    spacer.style.position = ''
    spacer.style.top = ''
    spacer.style.left = ''
    spacer.style.width = ''
    const tds = Array.from(spacer.querySelectorAll<HTMLElement>('td,th'))
    for (const td of tds) td.style.width = ''
    if (floating) el.parentElement?.insertBefore(spacer, el)
  }
  const mutationobserver = new MutationObserver(generatespacer)
  mutationobserver.observe(el, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true
  })
  generatespacer()

  function adjustwidths () {
    const tds = Array.from(el.querySelectorAll<HTMLElement>('td,th'))
    if (floating) {
      const spacertds = Array.from(spacer.querySelectorAll<HTMLElement>('td,th'))
      const widths = spacertds.map(td => window.getComputedStyle(td).width)
      const table = spacer.closest('table')
      let extrawidth = 0
      if (table) {
        const cell = el.querySelector('th:last-child,td:last-child')
        if (cell) {
          const tstyle = window.getComputedStyle(table)
          extrawidth = tstyle.borderCollapse === 'collapse' ? parseInt(window.getComputedStyle(cell).borderRightWidth) : 0
        }
      }
      const width = `${parseInt(window.getComputedStyle(spacer).width) + extrawidth}px`
      elheight = spacer.offsetHeight
      for (let i = 0; i < tds.length; i++) tds[i].style.width = widths[i]
      el.style.width = width
    } else {
      for (const td of tds) td.style.width = ''
      el.style.width = ''
      elheight = el.offsetHeight
    }
  }

  const resizeobserver = new ResizeObserver(adjustwidths)

  function recalc (scroll: number) {
    const newTranslateY = Math.max(Math.min(scroll - 1, scrollend) - scrollstart, 0)
    const newFloating = newTranslateY > 0
    const newTop = Math.max(Math.min(scrollend - scroll, 0), -2 * elheight)
    if (newFloating !== floating) {
      floating = newFloating
      if (floating) {
        el.parentElement?.insertBefore(spacer, el)
        el.style.position = 'fixed'
        el.style.top = `${Math.min(scrollend - scroll, 0)}px`
        el.style.left = `${left}px`
        resizeobserver.observe(spacer)
      } else {
        el.style.position = ''
        el.style.top = ''
        el.style.left = ''
        resizeobserver.disconnect()
        spacer.remove()
      }
      adjustwidths()
    }
    if (newTranslateY !== translateY) {
      translateY = newTranslateY
      config?.store?.update(v => ({ ...v, translateY, floating }))
    }
    if (top !== newTop) {
      top = newTop
      if (floating) el.style.top = `${top}px`
    }
  }

  function onscroll (e: Event) {
    recalc(window.scrollY)
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
    const table = el.closest('table')
    const borderspacing = (table ? parseInt(window.getComputedStyle(table).borderSpacing) : 0)
    scrollstart = offset[0].top + el.offsetTop
    left = offset[0].left + (spacer.parentElement ? spacer.offsetLeft : el.offsetLeft)
    if (el.tagName === 'TR') {
      scrollstart -= borderspacing
    }
    const containeroffset = config?.target ? offset[1] ?? offset[0] : offset[0]
    scrollend = Math.max(scrollstart, containeroffset.top + (config?.target ?? offsetParent).clientHeight - el.offsetHeight)
    recalc(window.scrollY)
  }

  const { destroy, update } = watchForPositionChange([el.offsetParent as HTMLElement, config?.target], onpositionchange)
  window.addEventListener('scroll', onscroll, { passive: true })

  function stickyUpdate (newConfig?: StickyArgs) {
    if (newConfig?.store !== config?.store) newConfig?.store?.update(v => ({ ...v, translateY, floating }))
    config = newConfig
    update([el.offsetParent as HTMLElement, config?.target], onpositionchange)
  }

  function stickyDestroy () {
    resizeobserver.disconnect()
    mutationobserver.disconnect()
    window.removeEventListener('scroll', onscroll)
    destroy()
  }

  return {
    update: stickyUpdate,
    destroy: stickyDestroy
  }
}
