import { bodyOffset, debounced } from '../lib'

interface GlueArgs {
  target: HTMLElement
  align?: 'auto'|'bottomleft'|'bottomright'|'topleft'|'topright'
  cover?: boolean
}

export function glue (el: HTMLElement, { target, align = 'auto', cover = false }: GlueArgs) {
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
    } else if (autoalign === 'bottomright') {
      el.style.top = `${offset.top + (cover ? 0 : target.offsetHeight)}px`
      el.style.left = 'auto'
      el.style.bottom = 'auto'
      el.style.right = `${offset.right}px`
    } else if (autoalign === 'topleft') {
      el.style.top = 'auto'
      el.style.left = `${offset.left}px`
      el.style.bottom = `${offset.top - (cover ? target.offsetHeight : 0)}px`
      el.style.right = 'auto'
    } else if (autoalign === 'topright') {
      el.style.top = 'auto'
      el.style.left = 'auto'
      el.style.bottom = `${offset.top - (cover ? target.offsetHeight : 0)}px`
      el.style.right = `${offset.right}px`
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
