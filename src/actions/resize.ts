import equal from 'fast-deep-equal'
import { debounced, SettableSubject } from '../lib'

export interface ElementSize {
  clientWidth?: number
  clientHeight?: number
  offsetWidth?: number
  offsetHeight?: number
}

interface ResizeConfig {
  debounce?: boolean|number
  store?: SettableSubject<ElementSize>
}

export function resize (el: HTMLElement, config?: ResizeConfig) {
  if (config?.debounce === true) config.debounce = 100
  let lastSize: ElementSize = {}
  function watch () {
    const current = { clientWidth: el.clientWidth, clientHeight: el.clientHeight, offsetWidth: el.offsetWidth, offsetHeight: el.offsetHeight }
    if (!equal(lastSize, current)) {
      lastSize = current
      if (config?.store) config.store.set(current)
      el.dispatchEvent(new CustomEvent('resize', { detail: current }))
    }
  }

  if (!ResizeObserver) return watch() // support SSR

  let observer = new ResizeObserver(config?.debounce ? debounced(watch, config.debounce) : watch)
  observer.observe(el)
  watch()

  return {
    update (newConfig?: ResizeConfig) {
      if (newConfig?.debounce === true) newConfig.debounce = 100
      if (newConfig?.store !== config?.store) {
        newConfig?.store?.set(lastSize)
      }
      if (!!newConfig?.debounce !== !!config?.debounce) {
        observer.disconnect()
        observer = new ResizeObserver(newConfig?.debounce ? debounced(watch, newConfig.debounce) : watch)
        observer.observe(el)
      }
      config = newConfig
    },
    destroy () {
      observer.disconnect()
    }
  }
}
