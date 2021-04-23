import { DeepStore, UsableSubject } from './deepstore'
import { get } from 'txstate-utils'
import { get as getVal } from 'svelte/store'

/**
 * Watch one or more parent stores for changes. Each time, run a function to derive
 * a new state from the parent state(s). Subscribers will only be notified if the
 * derived state has changed (uses fast-deep-equal).
 *
 * If only one parent store, it's possible to use a dot-prop string as the getter.
 *
 * If you create one of these in a component, be sure to call .complete() in onDestroy
 * to free up memory.
 */
export class DerivedStore<DerivedType, ParentType = any> extends DeepStore<DerivedType> {
  constructor (store: UsableSubject<ParentType>, getter: (value: ParentType) => DerivedType)
  constructor (store: UsableSubject<ParentType>, getter: string)
  constructor (store: UsableSubject<any>[], getter: (value: any[]) => DerivedType)
  constructor (store: UsableSubject<any>|UsableSubject<any>[], getter: string|((value: any) => DerivedType)|((values: any[]) => DerivedType)) {
    if (typeof getter === 'string') {
      const accessor = getter
      getter = (parentValue: any) => get(parentValue, accessor)
    }
    super({} as any)
    if (Array.isArray(store)) {
      const values = store.map(getVal)
      for (let i = 0; i < store.length; i++) {
        let unsubscribe
        if (store instanceof DeepStore) {
          unsubscribe = store[i].subscribe(v => {
            values[i] = store.clone(v)
            super.set((getter as (values: any[]) => DerivedType)(values))
          })
        } else {
          unsubscribe = store[i].subscribe(v => {
            values[i] = v
            super.set((getter as (values: any[]) => DerivedType)(values))
          })
        }
        this.cleanup(unsubscribe)
      }
      super.set((getter as (values: any[]) => DerivedType)(values))
    } else {
      const unsubscribe = store.subscribe(v => {
        super.set((getter as (value: any) => DerivedType)(v))
      })
      this.cleanup(unsubscribe)
    }
  }
}
