import { get, set } from 'txstate-utils'
import { Store } from './store'
import { WritableSubject } from './activestore'

/**
 * Create a store that represents a part of a larger store. Updates to the parent store will propagate
 * down to the SubStore as appropriate, and updates to the SubStore will propagate
 * back up to the parent store. This requires both a getter and setter function to handle each
 * direction. The setter is given the new SubStore state and the existing parent store state and
 * should return a new state for the parent store.
 *
 * Alternatively, a dot-prop string can be provided and both the getter and setter will be automatically
 * generated. For example, a parent store containing state { deep: { value: 'here' }, hello: 'world' }
 * could be used with the getter string "deep.value". The SubStore's initial state would be "here", and
 * updating it to "there" would update the parent store state to { deep: { value: 'there' }, hello: 'world' }
 */
export class SubStore<SubType, ParentType = any> extends Store<SubType> {
  protected parentStore: WritableSubject<ParentType>
  protected setter: (value: SubType, state: ParentType) => ParentType

  constructor (store: WritableSubject<ParentType>, getter: keyof ParentType|string|((value: ParentType) => SubType), setter?: (value: SubType, state: ParentType) => ParentType) {
    super({} as any)
    if (typeof getter === 'string') {
      const accessor = getter
      getter = parentValue => get(parentValue, accessor)
      setter = (newValue, parentValue) => set(parentValue, accessor, newValue)
    }
    this.parentStore = store
    this.setter = setter!
    this.registerSource(() => store.subscribe(v => {
      super.set((getter as any)(v))
    }))
  }

  set (value: SubType) {
    this.parentStore.update(parentValue => this.setter(value, parentValue))
  }

  clone (state: SubType) {
    // parent store could be a SafeStore - if so we should use its clone function
    // so that the substore is also safe against mutations
    return (this.parentStore as Store<any>)?.clone?.(state) ?? state
  }
}

export function subStore <SubType, ParentType, A extends keyof ParentType> (store: WritableSubject<ParentType>, accessor: A): SubStore<ParentType[A], ParentType>
export function subStore <SubType, ParentType = any> (store: WritableSubject<ParentType>, accessor: string): SubStore<SubType, ParentType>
export function subStore <SubType, ParentType> (store: WritableSubject<ParentType>, getter: (value: ParentType) => SubType, setter: (value: SubType, state: ParentType) => ParentType): SubStore<SubType, ParentType>
export function subStore <SubType, ParentType> (store: WritableSubject<ParentType>, getter: keyof ParentType|string|((value: ParentType) => SubType), setter?: (value: SubType, state: ParentType) => ParentType) {
  return new SubStore(store, getter, setter)
}
