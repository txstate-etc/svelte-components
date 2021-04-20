import { debounced, WritableSubject, ElementOffsets, watchForPositionChange } from '../lib'

interface OffsetConfig<T extends ElementOffsets = ElementOffsets> {
  debounce?: boolean|number
  store?: WritableSubject<T>
}

export function offset (el: HTMLElement, config?: OffsetConfig) {
  if (config?.debounce === true) config.debounce = 100
  let lastOffset: ElementOffsets = {}
  function lookforoffsetchange (current: ElementOffsets) {
    lastOffset = current
    if (config?.store) config.store.update(v => ({ ...v, ...current }))
    el.dispatchEvent(new CustomEvent('offset', { detail: current }))
  }
  let resolvedchange = config?.debounce ? debounced(lookforoffsetchange, config.debounce) : lookforoffsetchange

  const { destroy, update } = watchForPositionChange(el, resolvedchange)

  return {
    update (newConfig?: OffsetConfig) {
      if (newConfig?.debounce === true) newConfig.debounce = 100
      if (newConfig?.store !== config?.store) {
        newConfig?.store?.update(v => ({ ...v, ...lastOffset }))
      }
      if (newConfig?.debounce !== config?.debounce) {
        resolvedchange = newConfig?.debounce ? debounced(lookforoffsetchange, newConfig.debounce as any) : lookforoffsetchange
        update(el, resolvedchange)
      }
      config = newConfig
    },
    destroy
  }
}
