import equal from 'fast-deep-equal'
import { bodyOffset, debounced, SettableSubject } from '../lib'

export type ElementOffsets = Partial<ReturnType<typeof bodyOffset>>

interface OffsetConfig {
  allowToSettle?: boolean
  store?: SettableSubject<ElementOffsets>
}

export function offset (el: HTMLElement, config?: OffsetConfig) {
  let lastOffset: ElementOffsets = {}
  function lookforoffsetchange () {
    const current = bodyOffset(el)
    if (!equal(lastOffset, current)) {
      lastOffset = current
      if (config?.store) config.store.set(current)
      el.dispatchEvent(new CustomEvent('offset', { detail: current }))
    }
  }
  const debouncedlookforoffsetchange = debounced(lookforoffsetchange, 100)

  window.addEventListener('resize', config?.allowToSettle ? debouncedlookforoffsetchange : lookforoffsetchange, { passive: true })
  let observer = new MutationObserver(config?.allowToSettle ? debouncedlookforoffsetchange : lookforoffsetchange)
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true
  })
  lookforoffsetchange()

  return {
    update (newConfig?: OffsetConfig) {
      if (newConfig?.store !== config?.store) {
        newConfig?.store?.set(lastOffset)
      }
      if (!!newConfig?.allowToSettle !== !!config?.allowToSettle) {
        observer.disconnect()
        observer = new MutationObserver(newConfig?.allowToSettle ? debouncedlookforoffsetchange : lookforoffsetchange)
        observer.observe(document.body, {
          subtree: true,
          childList: true,
          attributes: true,
          characterData: true
        })
        if (newConfig?.allowToSettle) {
          window.removeEventListener('resize', lookforoffsetchange)
          window.addEventListener('resize', debouncedlookforoffsetchange, { passive: true })
        } else {
          window.removeEventListener('resize', debouncedlookforoffsetchange)
          window.addEventListener('resize', lookforoffsetchange, { passive: true })
        }
      }
      config = newConfig
    },
    destroy () {
      window.removeEventListener('resize', lookforoffsetchange)
      observer.disconnect()
    }
  }
}
