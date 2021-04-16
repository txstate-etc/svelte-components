import { bodyOffset, debounced, SettableSubject } from '../lib'

export type GlueAlignOpts = 'auto'|'bottomleft'|'bottomright'|'topleft'|'topright'

export interface GlueArgs {
  target: HTMLElement
  align?: GlueAlignOpts
  cover?: boolean
  store?: SettableSubject<GlueAlignStore>
}

export interface GlueAlignStore {
  valign: 'bottom'|'top'
  halign: 'left'|'right'
}

export function glue (el: HTMLElement, { target, align = 'auto', cover = false, store }: GlueArgs) {
  function reposition () {
    if (!target) return
    const offset = bodyOffset(target)
    let autoalign = align
    if (align === 'auto') {
      const rect = target.getBoundingClientRect()
      const leftright = window.innerWidth - rect.right > rect.left ? 'left' : 'right'
      const topbottom = window.innerHeight - rect.bottom > rect.top ? 'bottom' : 'top'
      autoalign = topbottom + leftright as 'auto'
    }
    if (autoalign === 'bottomleft') {
      el.style.top = `${offset.top + (cover ? 0 : target.offsetHeight)}px`
      el.style.left = `${offset.left}px`
      el.style.bottom = 'auto'
      el.style.right = 'auto'
      store?.set({ valign: 'bottom', halign: 'left' })
    } else if (autoalign === 'bottomright') {
      el.style.top = `${offset.top + (cover ? 0 : target.offsetHeight)}px`
      el.style.left = 'auto'
      el.style.bottom = 'auto'
      el.style.right = `${offset.right}px`
      store?.set({ valign: 'bottom', halign: 'right' })
    } else if (autoalign === 'topleft') {
      el.style.top = 'auto'
      el.style.left = `${offset.left}px`
      el.style.bottom = `${offset.bottom + (cover ? 0 : target.offsetHeight)}px`
      el.style.right = 'auto'
      store?.set({ valign: 'top', halign: 'left' })
    } else if (autoalign === 'topright') {
      el.style.top = 'auto'
      el.style.left = 'auto'
      el.style.bottom = `${offset.bottom + (cover ? 0 : target.offsetHeight)}px`
      el.style.right = `${offset.right}px`
      store?.set({ valign: 'top', halign: 'right' })
    }
  }
  const debouncedreposition = debounced(reposition, 200)
  const observer = new MutationObserver(debouncedreposition)

  document.body.appendChild(el)
  function update ({ target: utarget, align: ualign = 'auto', cover: ucover = false }: GlueArgs) {
    target = utarget
    align = ualign
    cover = ucover
    if (!target) {
      window.removeEventListener('resize', debouncedreposition)
      observer.disconnect()
    } else {
      reposition()
      window.addEventListener('resize', debouncedreposition, { passive: true })
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true
      })
    }
  }
  function destroy () {
    if (el.parentNode) el.parentNode.removeChild(el)
    window.removeEventListener('resize', debouncedreposition)
  }
  update({ target, align, cover })
  return {
    update,
    destroy
  }
}
