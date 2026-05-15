import type { WritableSubject } from '@txstate-mws/svelte-store'

class ElementQueries {
  #watchlist: HTMLElement[][] = []
  #busy = false
  #hasInit = false
  #mutationobserver?: MutationObserver
  #boundRefresh: () => void = this.refresh.bind(this)
  #subscribers = 0
  #stores = new Map<HTMLElement, WritableSubject<any>>()

  #processwidths () {
    for (const layer of this.#watchlist) {
      const widths: number[] = []
      const attrs: (string | null)[] = []
      for (const el of layer) {
        widths.push(el.offsetWidth)
        attrs.push(el.getAttribute('data-eq'))
      }
      for (let j = 0; j < layer.length; j++) {
        const el = layer[j]
        const w = widths[j]
        let attrstr = ''
        let finalw = 1600
        for (let k = 1600; k >= w && k > 700; k -= 100) { attrstr += `${k}px `; finalw = k }
        for (let k = 700; k >= w; k -= 50) { attrstr += `${k}px `; finalw = k }
        if (attrstr !== attrs[j]) el.setAttribute('data-eq', attrstr)
        if (this.#stores.has(el)) {
          this.#stores.get(el)!.update(v => v.width === finalw ? v : { ...v, width: finalw })
        }
      }
    }
    this.#busy = false
  }

  #finddepth (target: HTMLElement, currentdepth = 0): number {
    const closest = target.parentElement?.closest<HTMLElement>('.eq-parent')
    if (!closest) return currentdepth
    return this.#finddepth(closest, currentdepth + 1)
  }

  #collecttargets () {
    this.#watchlist = []
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.eq-parent'))
    for (const target of targets) {
      const depth = this.#finddepth(target)
      if (!this.#watchlist[depth]) this.#watchlist[depth] = [target]
      else this.#watchlist[depth].push(target)
    }
  }

  refresh () {
    if (!this.#busy && this.#watchlist.length > 0) {
      this.#busy = true
      requestAnimationFrame(this.#processwidths.bind(this))
    }
  }

  #gotoanchor () {
    // since we are dramatically resizing, we need to scroll to the proper place for an
    // anchor tag
    const m = document.location.hash.match(/^#([a-z][a-zA-Z0-9_:.\-]*)$/iv)
    if (m) {
      const id = m[1]
      requestAnimationFrame(() => { (document.getElementById(id) ?? document.querySelector(`[name="${id}"]`))?.scrollIntoView(true) })
    }
  }

  fullresync () {
    this.#collecttargets()
    this.refresh()
  }

  #activate () {
    this.fullresync()
    window.addEventListener('resize', this.#boundRefresh)
    this.#mutationobserver = new MutationObserver(() => { this.fullresync() })
    this.#mutationobserver.observe(document.body, {
      subtree: true,
      childList: true,
      attributeFilter: ['class', 'style']
    })
  }

  #activateRaw () {
    if (typeof window === 'undefined' || this.#hasInit) return
    this.#hasInit = true
    if (['interactive', 'complete'].includes(document.readyState)) {
      this.#activate()
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        this.#activate()
        this.#gotoanchor()
      })
    }
  }

  // if someone uses the library without svelte, they may just activate it once
  // instead of faithfully subscribing and unsubscribing, so we'll add a subscriber that can't be
  // decremented and it will stay activated forever
  activate () {
    this.#subscribers += 1
    this.#activateRaw()
  }

  #deactivate () {
    if (this.#subscribers > 0 || typeof window === 'undefined') return
    window.removeEventListener('resize', this.#boundRefresh)
    this.#mutationobserver?.disconnect()
    this.#hasInit = false
  }

  subscribe<S extends { width: number }> (el: HTMLElement, store?: WritableSubject<S>) {
    this.#subscribers += 1
    if (store) this.#stores.set(el, store)
    else this.#stores.delete(el)
    this.#activateRaw()
    return () => {
      this.#subscribers -= 1
      if (this.#subscribers === 0) this.#deactivate()
    }
  }
}

export const elementqueries = new ElementQueries()

export function eq<S extends { width: number } = { width: number }> (el: HTMLElement, opts?: { store: WritableSubject<S> }) {
  el.classList.add('eq-parent')
  let unsubscribe = elementqueries.subscribe(el, opts?.store)
  return {
    update (opts?: { store: WritableSubject<S> }) {
      unsubscribe()
      unsubscribe = elementqueries.subscribe(el, opts?.store)
    },
    destroy () {
      unsubscribe()
    }
  }
}
