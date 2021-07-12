import { Store } from './store'
import { UsableSubject } from './activestore'
import { get } from 'txstate-utils'

export interface DerivedStoreOptions {
  debounce?: number|boolean
}

/**
 * Watch one or more parent stores for changes. Each time, run a function to derive
 * a new state from the parent state(s). Subscribers will only be notified if the
 * derived state has changed (uses fast-deep-equal).
 *
 * If only one parent store, it's possible to use a dot-prop string as the getter.
 */
export class DerivedStore<DerivedType, ParentType = any> extends Store<DerivedType> {
  constructor (store: UsableSubject<ParentType>|UsableSubject<any>[], getter: string|((value: any) => DerivedType)|((values: any[]) => DerivedType), options?: DerivedStoreOptions) {
    if (typeof getter === 'string') {
      const accessor = getter
      getter = (parentValue: any) => get(parentValue, accessor)
    }
    super({} as any)
    if (Array.isArray(store)) {
      const values: any[] = []
      let timer: any
      const superSet = () => super.set((getter as (values: any[]) => DerivedType)(values))
      const superSetDebounced = options?.debounce == null || options?.debounce === false || options?.debounce < 0
        ? superSet
        : () => {
            clearTimeout(timer)
            timer = setTimeout(superSet, options.debounce === true ? 0 : options.debounce as number)
          }
      for (let i = 0; i < store.length; i++) {
        const idx = i
        const st = store[i]
        if (st instanceof Store) {
          this.registerSource(() => st.subscribe(v => {
            values[idx] = st.clone(v)
            superSetDebounced()
          }))
        } else {
          this.registerSource(() => st.subscribe(v => {
            values[idx] = v
            superSetDebounced()
          }))
        }
      }
    } else {
      let timer: any
      const superSet = (v: any) => super.set((getter as (value: any) => DerivedType)(v))
      const superSetDebounced = options?.debounce == null || options?.debounce === false || options?.debounce < 0
        ? superSet
        : (v: any) => {
            clearTimeout(timer)
            timer = setTimeout(() => superSet(v), options.debounce === true ? 0 : options.debounce as number)
          }
      this.registerSource(() => store.subscribe(superSetDebounced))
    }
  }
}

export function derivedStore <DerivedType, ParentType, A extends keyof ParentType> (store: UsableSubject<ParentType>, accessor: A, options?: DerivedStoreOptions): DerivedStore<ParentType[A], ParentType>
export function derivedStore <DerivedType, ParentType = any> (store: UsableSubject<ParentType>, accessor: string, options?: DerivedStoreOptions): DerivedStore<DerivedType, ParentType>
export function derivedStore <DerivedType, ParentType> (store: UsableSubject<ParentType>, getter: (value: ParentType) => DerivedType, options?: DerivedStoreOptions): DerivedStore<DerivedType, ParentType>
export function derivedStore <DerivedType, T1, T2> (store: [UsableSubject<T1>, UsableSubject<T2>], getter: (value: [T1, T2]) => DerivedType, options?: DerivedStoreOptions): DerivedStore<DerivedType>
export function derivedStore <DerivedType, T1, T2, T3> (store: [UsableSubject<T1>, UsableSubject<T2>, UsableSubject<T3>], getter: (value: [T1, T2, T3]) => DerivedType, options?: DerivedStoreOptions): DerivedStore<DerivedType>
export function derivedStore <DerivedType, T1, T2, T3, T4> (store: [UsableSubject<T1>, UsableSubject<T2>, UsableSubject<T3>, UsableSubject<T4>], getter: (value: [T1, T2, T3, T4]) => DerivedType, options?: DerivedStoreOptions): DerivedStore<DerivedType>
export function derivedStore <DerivedType, T1, T2, T3, T4, T5> (store: [UsableSubject<T1>, UsableSubject<T2>, UsableSubject<T3>, UsableSubject<T4>, UsableSubject<T5>], getter: (value: [T1, T2, T3, T4, T5]) => DerivedType, options?: DerivedStoreOptions): DerivedStore<DerivedType>
export function derivedStore <DerivedType> (store: UsableSubject<any>[], getter: (value: any[]) => DerivedType, options?: DerivedStoreOptions): DerivedStore<DerivedType>
export function derivedStore <DerivedType> (store: UsableSubject<any>|UsableSubject<any>[], getter: string|((value: any) => DerivedType)|((values: any[]) => DerivedType), options?: DerivedStoreOptions) {
  return new DerivedStore(store, getter, options)
}
