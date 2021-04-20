import { ElementOffsets, SettableSubject, watchForPositionChange } from '../lib'

export type GlueAlignOpts = 'auto'|'bottomleft'|'bottomright'|'topleft'|'topright'

export interface GlueArgs<T extends GlueAlignStore = GlueAlignStore> {
  target: HTMLElement
  align?: GlueAlignOpts
  cover?: boolean
  store?: SettableSubject<T>
}

export interface GlueAlignStore {
  valign: 'bottom'|'top'
  halign: 'left'|'right'
}

export function glue (el: HTMLElement, { target, align = 'auto', cover = false, store }: GlueArgs) {
  document.body.style.position = 'relative'
  let halign: GlueAlignStore['halign']
  let valign: GlueAlignStore['valign']
  function reposition (offset: Required<ElementOffsets>) {
    if (!target) return
    let autoalign = align
    if (align === 'auto') {
      const rect = target.getBoundingClientRect()
      const leftright = window.innerWidth - rect.right > rect.left ? 'left' : 'right'
      const topbottom = window.innerHeight - rect.bottom > rect.top ? 'bottom' : 'top'
      autoalign = topbottom + leftright as 'auto'
    }
    const targetHeight = target.offsetHeight
    if (autoalign === 'bottomleft') {
      requestAnimationFrame(() => {
        el.style.top = `${offset.top + (cover ? 0 : targetHeight)}px`
        el.style.left = `${offset.left}px`
        el.style.bottom = ''
        el.style.right = ''
      })
      valign = 'bottom'
      halign = 'left'
    } else if (autoalign === 'bottomright') {
      requestAnimationFrame(() => {
        el.style.top = `${offset.top + (cover ? 0 : targetHeight)}px`
        el.style.left = ''
        el.style.bottom = ''
        el.style.right = `${offset.right}px`
      })
      valign = 'bottom'
      halign = 'right'
    } else if (autoalign === 'topleft') {
      requestAnimationFrame(() => {
        el.style.top = ''
        el.style.left = `${offset.left}px`
        el.style.bottom = `${offset.bottom + (cover ? 0 : targetHeight)}px`
        el.style.right = ''
      })
      valign = 'top'
      halign = 'left'
    } else if (autoalign === 'topright') {
      requestAnimationFrame(() => {
        el.style.top = ''
        el.style.left = ''
        el.style.bottom = `${offset.bottom + (cover ? 0 : targetHeight)}px`
        el.style.right = `${offset.right}px`
      })
      valign = 'top'
      halign = 'right'
    }
    store?.update(v => ({ ...v, valign, halign }))
  }
  const { destroy, update } = watchForPositionChange(target, reposition)

  document.body.appendChild(el)
  return {
    update ({ target: utarget, align: ualign = 'auto', cover: ucover = false, store: ustore }: GlueArgs) {
      if (target !== utarget) {
        update(utarget, reposition)
        target = utarget
      }
      align = ualign
      cover = ucover
      if (ustore && ustore !== store) {
        ustore.update(v => ({ ...v, valign, halign }))
        store = ustore
      }
    },
    destroy () {
      destroy()
    }
  }
}
