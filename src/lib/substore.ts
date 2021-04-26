import { get, set } from 'txstate-utils'
import { DeepStore, WritableSubject } from './deepstore'

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
 *
 * If you create one of these in a component, be sure to call .complete() in onDestroy to free up memory.
 */
export class SubStore<SubType, ParentType = any> extends DeepStore<SubType> {
  protected parentStore: WritableSubject<ParentType>
  protected setter: (value: SubType, state: ParentType) => ParentType

  constructor (store: WritableSubject<ParentType>, getter: string)
  constructor (store: WritableSubject<ParentType>, getter: (value: ParentType) => SubType, setter: (value: SubType, state: ParentType) => ParentType)
  constructor (store: WritableSubject<ParentType>, getter: string|((value: ParentType) => SubType), setter?: (value: SubType, state: ParentType) => ParentType) {
    if (typeof getter === 'string') {
      const accessor = getter
      getter = parentValue => get(parentValue, accessor)
      setter = (newValue, parentValue) => set(parentValue, accessor, newValue)
    }
    super({} as any)
    this.parentStore = store
    this.setter = setter!
    const unsubscribe = store.subscribe(v => {
      super.set((getter as any)(v))
    })
    this.cleanup(unsubscribe)
  }

  set (value: SubType) {
    this.parentStore.update(parentValue => this.setter(value, parentValue))
  }

  clone (state: SubType) {
    // parent store could be a SafeStore - if so we should use its clone function
    // so that the substore is also safe against mutations
    return (this.parentStore as DeepStore<any>)?.clone?.(state) ?? state
  }
}
