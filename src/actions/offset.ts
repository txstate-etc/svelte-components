import equal from 'fast-deep-equal'
import { bodyOffset, debounced, SettableSubject } from '../lib'

export type ElementOffsets = Partial<ReturnType<typeof bodyOffset>>

interface OffsetConfig {
  debounce?: boolean|number
  store?: SettableSubject<ElementOffsets>
}

export function offset (el: HTMLElement, config?: OffsetConfig) {
  if (config?.debounce === true) config.debounce = 100
  let lastOffset: ElementOffsets = {}
  function lookforoffsetchange () {
    const current = bodyOffset(el)
    if (!equal(lastOffset, current)) {
      lastOffset = current
      if (config?.store) config.store.set(current)
      el.dispatchEvent(new CustomEvent('offset', { detail: current }))
    }
  }
  let resolvedchange = config?.debounce ? debounced(lookforoffsetchange, config.debounce) : lookforoffsetchange

  window.addEventListener('resize', resolvedchange, { passive: true })
  let observer = new MutationObserver(resolvedchange)
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true
  })
  lookforoffsetchange()

  return {
    update (newConfig?: OffsetConfig) {
      if (newConfig?.debounce === true) newConfig.debounce = 100
      if (newConfig?.store !== config?.store) {
        newConfig?.store?.set(lastOffset)
      }
      if (newConfig?.debounce !== config?.debounce) {
        window.removeEventListener('resize', resolvedchange)
        resolvedchange = newConfig?.debounce ? debounced(lookforoffsetchange, newConfig.debounce as any) : lookforoffsetchange
        window.addEventListener('resize', resolvedchange, { passive: true })
        observer.disconnect()
        observer = new MutationObserver(resolvedchange)
        observer.observe(document.body, {
          subtree: true,
          childList: true,
          attributes: true,
          characterData: true
        })
      }
      config = newConfig
    },
    destroy () {
      window.removeEventListener('resize', resolvedchange)
      observer.disconnect()
    }
  }
}
