import { Store } from '@txstate-mws/svelte-store'
import type { WritableSubject } from '@txstate-mws/svelte-store'
import { debounced, watchForPositionChangeInContainer } from '../util/index.js'
import type { ElementOffsets } from '../util/index.js'

interface OffsetConfig<T extends ElementOffsets = ElementOffsets> {
  debounce?: boolean | number
  store?: WritableSubject<T>
  container?: HTMLElement | 'nearest'
}

export class OffsetStore extends Store<ElementOffsets> {
  constructor (initialState?: ElementOffsets) {
    super(initialState ?? { top: 0, right: 0, bottom: 0, left: 0 })
  }
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
  const offsetContainer = !config?.container ? document.body : (config.container === 'nearest' ? el.offsetParent as HTMLElement ?? document.body : config.container)
  const { destroy, update } = watchForPositionChangeInContainer(el, offsetContainer, resolvedchange)

  return {
    update (newConfig?: OffsetConfig) {
      const offsetContainer = !config?.container ? document.body : (config.container === 'nearest' ? el.offsetParent as HTMLElement ?? document.body : config.container)
      if (newConfig?.debounce === true) newConfig.debounce = 100
      if (newConfig?.store !== config?.store) {
        newConfig?.store?.update(v => ({ ...v, ...lastOffset }))
      }
      if (newConfig?.debounce !== config?.debounce) {
        resolvedchange = newConfig?.debounce ? debounced(lookforoffsetchange, newConfig.debounce) : lookforoffsetchange
        update(el, offsetContainer, resolvedchange)
      }
      config = newConfig
    },
    destroy
  }
}
