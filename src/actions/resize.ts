import equal from 'fast-deep-equal'
import { debounced, SettableSubject } from '../lib'

export interface ElementSize {
  clientWidth?: number
  clientHeight?: number
  offsetWidth?: number
  offsetHeight?: number
}

interface ResizeConfig {
  allowToSettle?: boolean
  store?: SettableSubject<ElementSize>
}

export function resize (el: HTMLElement, config?: ResizeConfig) {
  let lastSize: ElementSize = {}
  function watch () {
    const current = { clientWidth: el.clientWidth, clientHeight: el.clientHeight, offsetWidth: el.offsetWidth, offsetHeight: el.offsetHeight }
    if (!equal(lastSize, current)) {
      lastSize = current
      if (config?.store) config.store.set(current)
      el.dispatchEvent(new CustomEvent('resize', { detail: current }))
    }
  }

  let observer = new ResizeObserver(config?.allowToSettle ? debounced(watch, 100) : watch)
  observer.observe(el)
  watch()

  return {
    update (newConfig?: ResizeConfig) {
      if (newConfig?.store !== config?.store) {
        newConfig?.store?.set(lastSize)
      }
      if (!!newConfig?.allowToSettle !== !!config?.allowToSettle) {
        observer.disconnect()
        observer = new ResizeObserver(newConfig?.allowToSettle ? debounced(watch, 100) : watch)
        observer.observe(el)
      }
      config = newConfig
    },
    destroy () {
      observer.disconnect()
    }
  }
}
