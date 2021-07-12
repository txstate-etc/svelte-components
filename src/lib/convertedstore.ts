import { Store } from './store'
import { isSettable, UsableSubject } from './activestore'

/**
 * A store that allows you to pass in a traditional svelte store in the constructor.
 *
 * Updates to the original store will be sent to subscribers of this store, but only after a deep equality check.
 *
 * Updates to this store will also be sent to the original store after a deep equality check.
 */
export class ConvertedStore<T> extends Store<T> {
  private valueStore: UsableSubject<T>
  private pause = false

  constructor (value: UsableSubject<T>) {
    super({} as any)
    this.valueStore = value
    this.registerSource(() => this.valueStore.subscribe(v => this.set(v)))
  }

  set (value: T) {
    if (this.pause) return
    if (!this.equal(value, this.value)) {
      this.value = this.clone(value)
      for (const [id, run] of this.subscribers) {
        run(value)
      }
      if (isSettable(this.valueStore)) {
        this.pause = true
        this.valueStore.set(value)
        this.pause = false
      }
    }
  }
}

export function convertStore <T> (store: UsableSubject<T>) {
  return new ConvertedStore(store)
}
