import { DeepStore, UsableSubject, WritableSubject } from './deepstore'
import { get, set } from 'txstate-utils'

export class DerivedStore<DerivedType, ParentType> extends DeepStore<DerivedType> {
  protected parentStore: UsableSubject<ParentType>|WritableSubject<ParentType>
  protected setter?: (value: DerivedType, state: ParentType) => ParentType

  constructor (store: UsableSubject<ParentType>, getter: string|((value: ParentType) => DerivedType))
  constructor (store: WritableSubject<ParentType>, getter: string|((value: ParentType) => DerivedType), setter: (value: DerivedType, state: ParentType) => ParentType)
  constructor (store: UsableSubject<ParentType>|WritableSubject<ParentType>, getter: string|((value: ParentType) => DerivedType), setter?: (value: DerivedType, state: ParentType) => ParentType) {
    if (typeof getter === 'string') {
      const accessor = getter
      getter = parentValue => get(parentValue, accessor)
      setter = (newValue, parentValue) => set(parentValue, accessor, newValue)
    }
    super({} as any)
    this.parentStore = store
    this.setter = setter
    const unsubscribe = store.subscribe(v => {
      super.set((getter as any)(v))
    })
    this.cleanup(unsubscribe)
  }

  set (value: DerivedType) {
    if (!this.setter) throw new Error('tried to update a read-only DerivedStore')
    const pStore: WritableSubject<ParentType> = this.parentStore as WritableSubject<ParentType>
    pStore.update(parentValue => this.setter!(value, parentValue))
  }

  clone (state: DerivedType) {
    // parent store could be a SafeStore - if so we should use its clone function
    // so that the derived store is also safe against mutations
    return (this.parentStore as DeepStore<any>)?.clone?.(state) ?? state
  }
}
