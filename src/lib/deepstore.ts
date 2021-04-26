import { Writable } from 'svelte/store'
import deepEqual from 'fast-deep-equal'

export interface UsableSubject<T> {
  subscribe: (observer: (value: T) => void) => () => void
}

export interface WritableSubject<T> extends UsableSubject<T> {
  update: (updater: (value: T) => T) => void
}

export interface SettableSubject<T> extends WritableSubject<T> {
  set: (value: T) => void
}

function isWritable <T> (value: T|Writable<T>): value is Writable<T> {
  return !!(value as Writable<T>).subscribe
}

/**
 * An alternative to svelte's "writable" that also checks deep equality (fast-deep-equal) before
 * notifying subscribers. A writable will notify subscribers every time it is
 * updated, even if nothing has changed.
 *
 * Note that this strategy is weak against mutable state updates:
 * store.update(v => { v.someprop = 'newvalue'; return v })
 *
 * This line would NOT notify subscribers because the state will be compared against
 * itself and always found to be equal. If you are making updates in a mutable fashion,
 * use a SafeStore instead.
 *
 * You can also pass in a writable as your initial state. This will subscribe to the writable
 * but add the deep equality checks.
 *
 * If you pass in a writable while in a component, be sure to call .complete() in your
 * onDestroy to free memory.
 */
export class DeepStore<T> implements Writable<T> {
  protected value!: T
  protected subscribers: Map<string, (s: T) => void>
  protected cleanups: (() => void)[] = []
  private valueStore?: Writable<T>
  private pause = false

  constructor (value: T|Writable<T>) {
    this.subscribers = new Map()
    if (isWritable(value)) {
      this.valueStore = value
      this.cleanup(this.valueStore.subscribe(v => this.set(v)))
    } else {
      this.value = this.clone(value)
    }
  }

  clone (value: T) {
    return value
  }

  set (value: T) {
    if (this.pause) return
    if (!deepEqual(value, this.value)) {
      this.value = this.clone(value)
      for (const [id, run] of this.subscribers) {
        run(value)
      }
      if (this.valueStore) {
        this.pause = true
        this.valueStore.set(value)
        this.pause = false
      }
    }
  }

  update (updater: (value: T) => T) {
    this.set(this.clone(updater(this.value)))
  }

  subscribe (run: (s: T) => any) {
    const id = Math.random().toString(32)
    this.subscribers.set(id, run)
    run(this.value)
    return () => { this.subscribers.delete(id) }
  }

  protected cleanup (fn: () => void) {
    this.cleanups.push(fn)
  }

  complete () {
    for (const fn of this.cleanups) fn()
    this.cleanups = []
    this.subscribers.clear()
  }
}
