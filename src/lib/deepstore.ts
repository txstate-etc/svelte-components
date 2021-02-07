import { Writable } from 'svelte/store'
import deepEqual from 'fast-deep-equal'

export class DeepStore<T> implements Writable<T> {
  protected value: T
  protected subscribers: Map<string, (s: T) => void>

  constructor (value: T) {
    this.value = this.clone(value)
    this.subscribers = new Map()
  }

  clone (value: T) {
    return value
  }

  set (value: T) {
    if (!deepEqual(value, this.value)) {
      this.value = this.clone(value)
      for (const [id, run] of this.subscribers) {
        run(value)
      }
    }
  }

  update (updater: (value: T) => T) {
    this.set(this.clone(updater(this.value)))
  }

  public subscribe (run: (s: T) => void) {
    const id = Math.random().toString(32)
    this.subscribers.set(id, run)
    run(this.value)
    return () => { this.subscribers.delete(id) }
  }
}
